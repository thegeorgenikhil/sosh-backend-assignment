import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UpdateBlogDto } from './dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogDocument } from './schema/blog.schema';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel('blog') private readonly blogModel: Model<BlogDocument>,
  ) {}
  async getAllBlogs() {
    const blogs = await this.blogModel.find();
    const populatedBlogs = await this.blogModel.populate(blogs, {
      path: 'createdBy',
      select: 'name',
    });
    return {
      blogs: populatedBlogs,
    };
  }

  async createBlog(userId: string, dto: CreateBlogDto) {
    const blog = new this.blogModel({
      ...dto,
      createdBy: userId,
    });

    const createdBlog = await blog.save();
    await createdBlog.populate({ path: 'createdBy', select: 'name' });
    return createdBlog;
  }

  async updateBlog(userId: string, blogId: string, dto: UpdateBlogDto) {
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      throw new BadRequestException('Invalid blog id');
    }
    const blog = await this.blogModel.findById(blogId);
    if (!blog) {
      throw new BadRequestException('Blog not found');
    }

    if (blog.createdBy.toString() !== userId.toString()) {
      throw new ForbiddenException(
        'You are not authorized to update this blog',
      );
    }

    const update = await this.blogModel.updateOne(
      {
        _id: blogId,
      },
      {
        ...dto,
      },
    );

    if (update.modifiedCount === 0) {
      throw new BadRequestException('Not able to update blog');
    }

    const updateBlog = await this.blogModel.findById(blogId);

    return {
      message: 'Blog updated successfully',
      blog: updateBlog,
    };
  }

  async deleteBlog(userId: string, blogId: string) {
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      throw new BadRequestException('Invalid blog id');
    }

    const blog = await this.blogModel.findById(blogId);
    if (!blog) {
      throw new BadRequestException('Blog not found');
    }

    if (blog.createdBy.toString() !== userId.toString()) {
      throw new ForbiddenException(
        'You are not authorized to delete this blog',
      );
    }

    const blogDeleted = await this.blogModel.deleteOne({
      id: blogId,
    });

    if (blogDeleted.deletedCount === 0) {
      throw new BadRequestException('Not able to delete blog');
    }

    return {
      message: 'Blog deleted successfully',
    };
  }
}
