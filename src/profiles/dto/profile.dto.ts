import { User } from '@prisma/client';

export interface ProfileDto {
  username: string;
  bio: string;
  image: string;
  isFollowing: boolean;
}

export function castToProfile(user: User, isFollowing: boolean) {
  return {
    username: user.username,
    bio: user.bio,
    image: user.image,
    following: isFollowing,
  };
}
