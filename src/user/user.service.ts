import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'prisma/prisma.service';
import { UserForUpdate } from 'src/auth/dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateUser(user: User, dto: UserForUpdate) {
    try {
      // Destructure and filter out undefined values from the DTO
      const { email, username, bio, image } = dto;
      const updateData = { email, username, bio, image };

      // Remove undefined fields from updateData
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );

      // Return early if no fields to update
      if (Object.keys(updateData).length === 0) {
        return user;
      }

      return await this.prisma.user.update({
        where: {
          email: user.email,
        },
        data: updateData,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('email or username taken');
      }
    }
  }
}
