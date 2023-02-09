import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './dto';

@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}
  @Get()
  getAllBlogs() {
    return this.blogService.getAllBlogs();
  }

  @UseGuards(JwtGuard)
  @Post()
  createBlog(@GetUser('_id') userId: string, @Body() dto: CreateBlogDto) {
    return this.blogService.createBlog(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  updateBlog(
    @GetUser('_id') userId: string,
    @Param('id') blogId: string,
    @Body() dto: UpdateBlogDto,
  ) {
    return this.blogService.updateBlog(userId, blogId, dto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  deleteBlog(@GetUser('_id') userId: string, @Param('id') blogId: string) {
    return this.blogService.deleteBlog(userId, blogId);
  }
}
