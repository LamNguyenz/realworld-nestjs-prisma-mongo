import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { castToProfile, ProfileDto } from './dto';

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

    const isFollowing = userFromDb.followingIds.includes(user?.id);
    return castToProfile(userFromDb, isFollowing);
  }

  async followUser(user: User, userName: string) {
    const userFollowed = await this.prisma.user.update({
      where: {
        username: userName,
      },
      data: {
        followers: {
          set: [{ username: user.username }],
        },
      },
    });
    const profile: ProfileDto = castToProfile(userFollowed, true);
    return profile;
  }

  async unfollowUser(user: User, userName: string) {
    const userUnfollowed = await this.prisma.user.update({
      where: {
        username: userName,
      },
      data: {
        followers: {
          disconnect: [{ id: user.id }],
        },
      },
    });
    const profile: ProfileDto = castToProfile(userUnfollowed, false);
    return profile;
  }
}
