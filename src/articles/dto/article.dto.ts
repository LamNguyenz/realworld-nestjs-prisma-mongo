import { Article, User } from '@prisma/client';
import { ProfileDto } from 'src/profiles/dto';

export interface ArticleForCreateDto {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
}

export interface ArticleDto {
  slug: string;
  title: string;
  description: string;
  bofy: string;
  tagList: string[];
  author: ProfileDto;
  createdAt: Date;
  updatedAt: Date;
}

export function castToArticle(
  article: Article,
  user: User,
  tags: string[],
  author: ProfileDto,
) {
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: tags,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    author,
  };
}
