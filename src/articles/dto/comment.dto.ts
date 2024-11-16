import { Comment } from '@prisma/client';
import { ProfileDto } from "src/profiles/dto";

export interface CommentForCreateDto {
  body: string;
}

export interface CommentDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  author: ProfileDto;
}

export const castToCommentDto = (comment: Comment, author: ProfileDto) => {
  return {
    id: comment.id,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    body: comment.body,
    author,
  };
};
