import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async getTags() {
    const tags = await this.prisma.article.findMany({
      select: {
        tagList: true,
      },
    });
    const flatTags = tags.flatMap((article) => article.tagList);
    return [...new Set(flatTags)];
  }
}
