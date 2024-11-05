import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { ArticleForCreateDto, castToArticle } from './dto';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { castToProfile } from 'src/profiles/dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async createArticle(user: User, articleToCreate: ArticleForCreateDto) {
    const slug = articleToCreate.title.split(' ').join('-');
    try {
      const article = await this.prisma.article.create({
        data: {
          ...articleToCreate,
          authorId: user.id,
          slug,
          tagList: {
            set: articleToCreate.tagList,
          },
        },
      });
      return castToArticle(
        article,
        user,
        article.tagList,
        castToProfile(user, false),
      );
    } catch (error) {
      if (error instanceof PrismaClientValidationError) {
        throw new BadRequestException('Bad request');
      }
    }
  }
}
