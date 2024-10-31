import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserForRegistration } from './dto';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async registerUser(@Body('user') dto: UserForRegistration) {
    const user = await this.authService.createUser(dto);
    return { user: user };
  }
}
