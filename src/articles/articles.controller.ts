import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetOptionalUser } from 'src/common/decorator/get-optional-user.decorator';
import { GetUser } from 'src/common/decorator/get-user-decorator';
import { JwtGuard } from 'src/common/guard';
import { ArticlesService } from './articles.service';

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
    // Filter by tag
    @Query('tag') tag?: string,
    // Filter by author
    @Query('author') author?: string,
    // Filter by favorited
    @Query('favorited') favorited?: string,
    // Pagination
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    const { articles, articlesCount } = await this.articlesService.getArticles(
      user,
      {
        tag,
        author,
        favorited,
        limit,
        offset,
      },
    );
    return { articles, articlesCount };
  }
}
