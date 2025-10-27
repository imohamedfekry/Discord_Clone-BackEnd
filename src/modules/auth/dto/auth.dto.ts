import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, IsStrongPassword, IsDateString, IsDate, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsUsername } from '../../../common/Global/validators/username.validator';
import { Type } from 'class-transformer';
import { IsValidBirthdate } from 'src/common/Global/validators/IsValidBirthdate.validator';

export class RegisterDto {
  @ApiProperty({ description: 'The username of the user' })
  @IsString()
  @IsNotEmpty()
  @IsUsername()
  username: string;

  @ApiProperty({ description: 'The email of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  // @ApiProperty({ description: 'The phone of the user' })
  // @IsString()
  // @MinLength(10)
  // @MaxLength(15)
  // phone: string;
  @ApiProperty({ description: 'The birthdate of the user', example: '2002-10-26' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @IsValidBirthdate()
  birthdate: Date;
}

export class LoginDto {
  @ApiProperty({ description: 'The email of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  @IsNotEmpty()
  // @IsStrongPassword()
  password: string;
}
