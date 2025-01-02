import { SetMetadata } from '@nestjs/common';
import { UserType } from '@prisma/client';

export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);
// If I put { } around SetMetadata - > there is an error. Explore later TODO:
