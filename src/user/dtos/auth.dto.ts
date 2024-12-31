// import { PartialType, OmitType } from '@nestjs/mapped-types';
// mapped-types import not working
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Matches(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/, {
    message: 'phone must be a valid phone number',
  })
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(5)
  password: string;
}

export class SigninDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  password: string;
}

// export class SigninDto extends OmitType(SignupDto, ['name', 'phone']) {}
// Combining Partial and Omit.
// export class UpdatePublicUserDto extends PartialType(
//   OmitType(CreateUserDto, ['password']),
// ) {}
