import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';

interface JWTPayload {
  name: string;
  id: number;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext) {
    // 1) Determine the Usertypes that can execute the endpoints
    // a. use role decorator (setmetadata to read the roles passed in the contrller)
    //   b. now use the reflector to read these roles from setmetadata in the guard

    const roles = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2) Grab the Jwt from the request header and verify it. (In the interceptor we just decoded jwt, we did not verify it!). Not useful to verify at the interceptor since is implemented at the guard level for obstruction if the verification fails.
    // 3) Database request to get role by user_id
    // 4) Determine if user has permissions
    const request = context.switchToHttp().getRequest();
    const token = request.headers?.authorization?.split('Bearer ')[1];
    try {
      const payload = (await jwt.verify(
        token,
        process.env.JSON_TOKEN_KEY,
      )) as JWTPayload;
      // todo: when to use 'as Type' instead of :Type ?
      const user = await this.prismaService.user.findUnique({
        where: {
          id: payload.id,
        },
      });
      if (!user) return false;
      if (roles.includes(user.user_type)) return true;
      return false;
    } catch (error) {
      return false;
    }
  }
}
