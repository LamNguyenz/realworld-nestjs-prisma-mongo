import { BadRequestException, Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { ArticleForCreateDto, castToArticle } from './dto';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { castToProfile, ProfileDto } from 'src/profiles/dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async getArticles(
    user: User,
    query?: {
      tag?: string;
      author?: string;
      favorited?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const { tag, author, favorited, limit = 10, offset = 0 } = query;
    const queryArgs: Prisma.ArticleFindManyArgs = {
      where: {
        author: {
          username: author,
        },
      },
    };
    const [articles, articlesCount] = await Promise.all([
      this.prisma.article.findMany({
        ...queryArgs,
        take: limit,
        skip: offset,
        include: {
          author: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      this.prisma.article.count({
        where: queryArgs.where,
      }),
    ]);

    const articlesDto = articles.map((article) => {
      const following =
        article.author?.followersIds.includes(user?.id || '') || false;
      let authorProfile: ProfileDto;
      if (!article.author) {
        authorProfile = null;
      } else {
        authorProfile = castToProfile(article.author, following);
      }
      return castToArticle(article, user, article.tagList, authorProfile);
    });
    return { articles: articlesDto, articlesCount };
  }

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
