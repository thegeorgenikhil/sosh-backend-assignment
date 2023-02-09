import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../auth/schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('user') private readonly userModel: Model<UserDocument>,
    @InjectModel('blog') private readonly blogModel: Model<UserDocument>,
  ) {}

  async getUser(userId: string) {
    const user = await this.userModel.findById(userId);
    const blogs = await this.blogModel.find({ createdBy: userId });
    const { id, name, email } = user;
    return {
      id,
      name,
      email,
      blogs: blogs,
    };
  }
}
