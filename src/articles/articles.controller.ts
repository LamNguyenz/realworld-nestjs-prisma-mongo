import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetOptionalUser } from 'src/common/decorator/get-optional-user.decorator';
import { GetUser } from 'src/common/decorator/get-user-decorator';
import { Public } from 'src/common/decorator/public.decorator';
import { JwtGuard } from 'src/common/guard';
import { ArticlesService } from './articles.service';
import {
  ArticleForCreateDto,
  ArticleForUpdateDto,
  CommentForCreateDto,
  GetArticlesQueryDto,
} from './dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async getArticles(
    @GetOptionalUser() user: User,
    @Query() query: GetArticlesQueryDto,
  ) {
    return await this.articlesService.getArticles(user, query);
  }

  @UseGuards(JwtGuard)
  @Public()
  @Get(':slug')
  async getArticle(@GetUser() user: User, @Param('slug') slug: string) {
    return { article: await this.articlesService.findArticle(user, slug) };
  }

  @UseGuards(JwtGuard)
  @Post()
  async createArticle(
    @GetUser() user: User,
    @Body('article') dto: ArticleForCreateDto,
  ) {
    return {
      article: await this.articlesService.createArticle(user, dto),
    };
  }

  @UseGuards(JwtGuard)
  @Put(':slug')
  async updateArticle(
    @GetUser() user: User,
    @Param('slug') slug: string,
    @Body('article') dto: ArticleForUpdateDto,
  ) {
    return {
      article: await this.articlesService.updateArticle(user, slug, dto),
    };
  }

  @UseGuards(JwtGuard)
  @Delete(':slug')
  async deleteArticle(@GetUser() user: User, @Param('slug') slug: string) {
    return {
      article: await this.articlesService.deleteArticle(user, slug),
    };
  }

  @UseGuards(JwtGuard)
  @Post(':slug/favorite')
  async favoriteArticle(@GetUser() user: User, @Param('slug') slug: string) {
    return {
      article: await this.articlesService.favoriteArticle(user, slug),
    };
  }

  @UseGuards(JwtGuard)
  @Delete(':slug/favorite')
  async unFavoriteArticle(@GetUser() user: User, @Param('slug') slug: string) {
    return {
      article: await this.articlesService.unFavoriteArticle(user, slug),
    };
  }

  @UseGuards(JwtGuard)
  @Get(':slug/comments')
  async getCommentsForArticle(@Param('slug') slug: string) {
    return { comments: await this.articlesService.getCommentsForArticle(slug) };
  }

  @UseGuards(JwtGuard)
  @Post(':slug/comments')
  async addCommentToArticle(
    @GetUser() user: User,
    @Param('slug') slug: string,
    @Body('comment') dto: CommentForCreateDto,
  ) {
    return {
      comment: await this.articlesService.addCommentToArticle(user, slug, dto),
    };
  }

  @UseGuards(JwtGuard)
  @Delete(':slug/comments/:id')
  async deleteCommentFromArticle(@Param('id') id: string) {
    return await this.articlesService.deleteCommentFromArticle(id);
  }
}
