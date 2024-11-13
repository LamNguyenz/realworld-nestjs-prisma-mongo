import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Optional,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/common/decorator/get-user-decorator';
import { Public } from 'src/common/decorator/public.decorator';
import { JwtGuard } from 'src/common/guard';
import { ProfilesService } from './profiles.service';

@UseGuards(JwtGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}

  @Public()
  @Get(':username')
  async findUser(@GetUser() user: User, @Param('username') username: string) {
    return {
      profile: await this.profileService.findUser(user, username),
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post(':username/follow')
  async followUser(@GetUser() user: User, @Param('username') username: string) {
    return { profile: await this.profileService.followUser(user, username) };
  }

  @Delete(':username/follow')
  async unfollowUser(
    @GetUser() user: User,
    @Param('username') username: string,
  ) {
    return { profile: await this.profileService.unfollowUser(user, username) };
  }
}
