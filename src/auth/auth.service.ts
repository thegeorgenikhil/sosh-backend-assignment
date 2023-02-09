import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { hash, verify } from 'argon2';
import { Model } from 'mongoose';
import { BlogDocument } from 'src/blog/schema/blog.schema';
import { AuthSigninDto, AuthSignupDto } from './dto';
import { AuthResponse, User, UserDocument } from './schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('user') private readonly userModel: Model<UserDocument>,
    @InjectModel('blog') private readonly blogModel: Model<BlogDocument>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthSignupDto): Promise<AuthResponse> {
    const foundUser = await this.userModel.findOne({ email: dto.email });
    if (foundUser) {
      throw new ForbiddenException(
        'User already exists with the given credentials',
      );
    }
    const hashedPassword = await hash(dto.password);
    const user: Partial<User> = { ...dto, password: hashedPassword };
    const newUser = new this.userModel(user);
    const createdUser = await newUser.save();
    const token = await this.signToken(createdUser.id, createdUser.email);
    const { _id, name, email } = createdUser;
    return {
      _id,
      name,
      email,
      ...token,
    };
  }

  async signin(dto: AuthSigninDto): Promise<AuthResponse> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new ForbiddenException('No user with this email address');
    }

    const pwdMatches = await verify(user.password, dto.password);

    if (!pwdMatches) {
      throw new ForbiddenException('Password doesn"t match');
    }

    const token = await this.signToken(user.id, user.email);
    delete user.password;

    const { name, email, _id } = user;

    return {
      _id,
      name,
      email,
      ...token,
    };
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }

  async clean() {
    await this.userModel.deleteMany({});
    await this.blogModel.deleteMany({});
  }
}
