import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { castToProfile } from './dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async findUser(user: User, userName: string) {
    const userFromDb = await this.prisma.user.findUnique({
      where: {
        username: userName,
      },
    });
    if (!userFromDb) throw new NotFoundException('user not found');

    const isFollowing = userFromDb.followingIds.includes(user.id);
    const profile = castToProfile(user, isFollowing);
    return profile;
  }
}
