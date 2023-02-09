import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthSignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(7)
  @IsNotEmpty()
  password: string;
}
