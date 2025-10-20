import { IsString, IsOptional, MaxLength, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ 
    description: 'Current password',
    example: 'currentPassword123'
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ 
    description: 'New password',
    example: 'newPassword123'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  newPassword: string;
}

export class UpdateGlobalNameDto {
  @ApiProperty({ 
    description: 'Global name',
    example: 'John Doe',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(32, { message: 'Global name must not exceed 32 characters' })
  globalName?: string;
}

export class UpdateCustomStatusDto {
  @ApiProperty({ 
    description: 'Custom status message',
    example: 'Playing Minecraft',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(128, { message: 'Custom status must not exceed 128 characters' })
  customStatus?: string;
}

export class UpdateUsernameDto {
  @ApiProperty({ 
    description: 'New username',
    example: 'john_doe_2024'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(32, { message: 'Username must not exceed 32 characters' })
  username: string;
}
