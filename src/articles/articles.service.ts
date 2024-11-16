import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Article, Prisma, User } from '@prisma/client';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { PrismaService } from 'prisma/prisma.service';
import { castToProfile } from 'src/profiles/dto';
import {
  ArticleForCreateDto,
  ArticleForUpdateDto,
  castToArticle,
  castToCommentDto,
  CommentForCreateDto,
  GetArticlesQueryDto,
} from './dto';

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
        article as unknown as Article,
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

    try {
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
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Article with this ttitle already exists',
        );
      }
      throw error;
    }
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

  async favoriteArticle(user: User, slug: string) {
    let article = await this.prisma.article.findUnique({
      where: {
        slug,
      },
      include: {
        author: true,
      },
    });

    if (!article) throw new NotFoundException('article not found');

    if (!article.favoritedUserIds.includes(user.id)) {
      article = await this.prisma.article.update({
        where: {
          slug,
        },
        data: {
          favoritedUserIds: {
            push: user.id,
          },
        },
        include: {
          author: true,
        },
      });
    }

    const following = article.author?.followersIds.includes(user.id) || false;
    return castToArticle(
      article,
      user,
      article.tagList,
      castToProfile(article.author, following),
    );
  }

  async unFavoriteArticle(user: User, slug: string) {
    const article = await this.prisma.article.findUnique({
      where: {
        slug,
      },
    });
    if (!article) throw new NotFoundException('article not found');

    const favoritedUserIds = article.favoritedUserIds.filter(
      (id) => id !== user.id,
    );

    const articleUpdated = await this.prisma.article.update({
      where: {
        slug,
      },
      data: {
        favoritedUserIds,
      },
      include: {
        author: true,
      },
    });
    const isFollowing =
      articleUpdated.author?.followersIds.includes(user.id) || false;
    return castToArticle(
      articleUpdated,
      user,
      articleUpdated.tagList,
      castToProfile(articleUpdated.author, isFollowing),
    );
  }

  async addCommentToArticle(
    user: User,
    slug: string,
    dto: CommentForCreateDto,
  ) {
    const article = await this.prisma.article.findUnique({
      where: {
        slug,
      },
    });

    if (!article) throw new NotFoundException('article not found');

    const comment = await this.prisma.comment.create({
      data: {
        articleId: article.id,
        authorId: user.id,
        body: dto.body,
      },
    });
    return castToCommentDto(comment, castToProfile(user, false));
  }

  async getCommentsForArticle(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: {
        slug,
      },
      select: {
        comments: {
          include: {
            author: true,
          },
        },
      },
    });
    if (!article) throw new NotFoundException('article not found');
    return article.comments.map((comment) => {
      return castToCommentDto(comment, castToProfile(comment.author, false));
    }) || [];
  }

  async deleteCommentFromArticle(id: string) {
    try {
      await this.prisma.comment.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('comment not found');
      }
      throw error;
    }
  }
}
