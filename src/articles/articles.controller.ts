import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { GetUser } from 'src/common/decorator/get-user-decorator';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/common/guard';

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
}
