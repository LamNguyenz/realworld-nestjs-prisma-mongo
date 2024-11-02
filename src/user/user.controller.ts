import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/common/decorator/get-user-decorator';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/common/guard';
import { UserForUpdate } from 'src/auth/dto';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getCurrentUser(@GetUser() user: User) {
    return { user: user };
  }

  @Put()
  async updateUser(@GetUser() user: User, @Body('user') dto: UserForUpdate) {
    return this.userService.updateUser(user, dto);
  }
}
