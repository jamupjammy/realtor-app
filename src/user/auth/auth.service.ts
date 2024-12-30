import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from '../dtos/auth.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
  async signup({ email, password, name, phone }: SignupDto) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    console.log({ userExists });
    if (userExists) {
      throw new ConflictException();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        user_type: UserType.BUYER,
      },
    });

    const token = await jwt.sign(
      {
        name,
        id: user.id,
      },
      process.env.JSON_TOKEN_KEY,
      {
        expiresIn: 3600000,
      },
    );
    return token;
  }
}
