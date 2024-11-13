import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import {
  ArticleForCreateDto,
  ArticleForUpdateDto,
  castToArticle,
  GetArticlesQueryDto,
} from './dto';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { castToProfile } from 'src/profiles/dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async getArticles(user: User, query?: GetArticlesQueryDto) {
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
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          tagList: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          author: true,
        },
        take: limit,
        skip: offset,
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
      const authorProfile = article.author
        ? castToProfile(article.author, following)
        : null;
      return castToArticle(
        { ...article, body: '' },
        user,
        article.tagList,
        authorProfile,
      );
    });
    return { articles: articlesDto, articlesCount };
  }

  async findArticle(user: User, slug: string) {
    const article = await this.prisma.article.findUnique({
      where: {
        slug,
      },
      include: {
        author: true,
      },
    });
    if (article === null) throw new NotFoundException('article not found');

    const following = article.author?.followersIds.includes(user?.id) || false;

    const authorProfile = castToProfile(article.author, following);
    return castToArticle(article, user, article.tagList, authorProfile);
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

  async updateArticle(
    user: User,
    slug: string,
    articleToUpdate: ArticleForUpdateDto,
  ) {
    const existingArticle = await this.prisma.article.findUnique({
      where: {
        slug,
        authorId: user.id,
      },
    });

    if (existingArticle === null) {
      throw new NotFoundException('article not found');
    }

    const newSlug = articleToUpdate.title.split(' ').join('-');

    const article = await this.prisma.article.update({
      where: {
        id: existingArticle.id,
      },
      data: { ...articleToUpdate, slug: newSlug },
      include: {
        author: true,
      },
    });

    return castToArticle(
      article,
      user,
      article.tagList,
      castToProfile(article.author, false),
    );
  }

  async deleteArticle(user: User, slug: string) {
    const article = await this.prisma.article.findUnique({
      where: {
        slug,
        authorId: user.id,
      },
    });

    if (article === null) throw new NotFoundException('article not found');

    await this.prisma.article.delete({
      where: {
        id: article.id,
      },
    });
    return;
  }
}
