import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from "../decorator/public.decorator";

export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    const request = context.switchToHttp().getRequest();

    if (user) return user;

    const reflector = new Reflector();
    const isPublic = reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    // For public routes, allow null/undefined user
    if (isPublic) return user;

    throw new UnauthorizedException();
  }
}
