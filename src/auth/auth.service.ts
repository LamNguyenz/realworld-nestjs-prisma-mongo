import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as argon from 'argon2';
import { LoginDto, UserDto, UserForRegistration } from './dto';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async createUser(dto: UserForRegistration) {
    const hashedPassword = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          ...dto,
          password: hashedPassword,
        },
      });
      const token = await this.signToken(user.id, user.email);
      const userToReturn: UserDto = {
        email: user.email,
        token: token,
        username: user.username,
        bio: user.bio,
        image: user.image,
      };
      return userToReturn;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new BadRequestException('email is taken');
        }
      }
    }
  }

  async verifyUser(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new NotFoundException('user does not exist');
    const matches = await argon.verify(user.password, dto.password);
    if (!matches)
      throw new UnauthorizedException('password and email do not match');

    const token = await this.signToken(user.id, user.email);
    const userReturned: UserDto = {
      email: user.email,
      token: token,
      username: user.username,
      bio: user.bio,
      image: user.image,
    };
    return userReturned;
  }

  async signToken(userId: string, email: string): Promise<string> {
    const data = {
      sub: userId,
      email: email,
    };

    const SECRET = process.env.SECRET;
    const token = await this.jwt.signAsync(data, {
      secret: SECRET,
      expiresIn: '5h',
    });

    return token;
  }
}
