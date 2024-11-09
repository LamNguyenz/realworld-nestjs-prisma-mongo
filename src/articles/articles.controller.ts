import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetOptionalUser } from 'src/common/decorator/get-optional-user.decorator';
import { GetUser } from 'src/common/decorator/get-user-decorator';
import { JwtGuard } from 'src/common/guard';
import { ArticlesService } from './articles.service';
import { ArticleForCreateDto } from './dto';
import { GetArticlesQueryDto } from './dto/article.dto';

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

  @Get(':slug')
  async getArticle(@GetOptionalUser() user: User, @Param('slug') slug: string) {
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
}
