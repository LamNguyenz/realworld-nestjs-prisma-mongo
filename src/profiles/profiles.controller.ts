import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { GetUser } from 'src/common/decorator/get-user-decorator';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/common/guard';

@UseGuards(JwtGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}

  @Get(':username')
  async findUser(@GetUser() user: User, @Param('username') username: string) {
    return {
      profile: await this.profileService.findUser(user, username),
    };
  }
}
