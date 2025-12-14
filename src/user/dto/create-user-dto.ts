import {
  IsString,
  IsEmail,
  MinLength,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}

export class PasswordDto {
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 number, and be at least 8 characters long',
  })
  password: string;
}
