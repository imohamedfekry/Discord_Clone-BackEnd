import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'The username of the user' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: 'The email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'The phone of the user' })
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone: string;
}

export class LoginDto {
  @ApiProperty({ description: 'The email of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
