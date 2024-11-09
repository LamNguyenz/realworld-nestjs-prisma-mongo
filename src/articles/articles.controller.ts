import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetOptionalUser } from 'src/common/decorator/get-optional-user.decorator';
import { GetUser } from 'src/common/decorator/get-user-decorator';
import { JwtGuard } from 'src/common/guard';
import { ArticlesService } from './articles.service';
import { GetArticlesQueryDto } from './dto/article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}
  @UseGuards(JwtGuard)
  @Post()
  async createArticle(@GetUser() user: User, @Body('article') dto) {
    return {
      article: await this.articlesService.createArticle(user, dto),
    };
  }

  @Get()
  async getArticles(
    @GetOptionalUser() user: User,
    @Query() query: GetArticlesQueryDto,
  ) {
    return await this.articlesService.getArticles(user, query);
  }
}
