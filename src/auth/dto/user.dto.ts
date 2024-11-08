import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export interface UserDto {
  email: string;
  token: string;
  username: string;
  bio: string;
  image?: string;
}

export class UserForRegistration {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly username: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

export interface UserForUpdate {
  email?: string;
  username?: string;
  bio?: string;
  image?: string;
}
