import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsStrongPassword,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { IsEmoji } from 'src/common/decorators/is-emoji.decorator';
import { PresenceExpireDuration } from 'src/common/Types/presence.types';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'currentPassword123',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'newPassword123',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;
}

export class UpdateglobalnameDto {
  @ApiProperty({
    description: 'Global name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32, { message: 'Global name must not exceed 32 characters' })
  globalname?: string;
}

export class UpdateCustomStatusDto {
  // expire and status(text) and emoji 
  @ApiProperty({
    description: 'Custom status message',
    example: 'Playing Minecraft',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(128, { message: 'Custom status must not exceed 128 characters' })
  text?: string;

  @ApiProperty({
    description: 'Custom status emoji',
    example: '🎮',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEmoji({ min: 1, max: 1 })
  emoji?: string;

  @ApiProperty({
    description: 'Presence expire duration',
    enum: PresenceExpireDuration,
    example: PresenceExpireDuration.FIFTEEN_MINUTES,
    required: false,
  })
  @IsEnum(PresenceExpireDuration, {
    message: `Presence expire duration must be one of: ${Object.values(PresenceExpireDuration).join(', ')}`,
  })
  @IsOptional()
  expiresAt?: PresenceExpireDuration;
}

export class UpdateUsernameDto {
  @ApiProperty({
    description: 'New username',
    example: 'john_doe_2024',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(32, { message: 'Username must not exceed 32 characters' })
  username: string;
}

export class UpdatePresenceStatusDto {
  @ApiProperty({
    description: 'Presence status',
    enum: UserStatus,
    example: UserStatus.IDLE,
  })
  @IsEnum(UserStatus, {
    message: `Status must be one of: ${Object.values(UserStatus).join(', ')}`,
  })
  @IsNotEmpty()
  status: UserStatus;

  @ApiProperty({
    description: 'Presence expire duration',
    enum: PresenceExpireDuration,
    example: PresenceExpireDuration.FIFTEEN_MINUTES,
    required: false,
  })
  @IsEnum(PresenceExpireDuration, {
    message: `Presence expire duration must be one of: ${Object.values(PresenceExpireDuration).join(', ')}`,
  })
  @IsOptional()
  expiresAt?: PresenceExpireDuration;
}
