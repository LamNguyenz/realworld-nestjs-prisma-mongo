import { Article, User } from '@prisma/client';
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ProfileDto } from 'src/profiles/dto';

export class ArticleForCreateDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagList?: string[];
}

export interface ArticleDto {
  slug: string;
  title: string;
  description: string;
  body: string;
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

export class GetArticlesQueryDto {
  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  favorited?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number;
}
