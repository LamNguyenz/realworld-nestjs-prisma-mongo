import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/common/decorator/get-user-decorator';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/common/guard';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getCurrentUser(@GetUser() user: User) {
    return { user: user };
  }
}
