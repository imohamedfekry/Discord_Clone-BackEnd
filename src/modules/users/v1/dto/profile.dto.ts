import { IsString, IsOptional, MaxLength, MinLength, IsNotEmpty, IsStrongPassword, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PresenceStatus } from '../../../../common/presence/presence.types';

export class UpdatePasswordDto {
  @ApiProperty({ 
    description: 'Current password',
    example: 'currentPassword123'
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  currentPassword: string;

  @ApiProperty({ 
    description: 'New password',
    example: 'newPassword123'
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
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

export class UpdatePresenceStatusDto {
  @ApiProperty({ 
    description: 'Presence status',
    enum: PresenceStatus,
    example: PresenceStatus.IDLE
  })
  @IsEnum(PresenceStatus, { 
    message: `Status must be one of: ${Object.values(PresenceStatus).join(', ')}` 
  })
  @IsNotEmpty()
  status: PresenceStatus;
}
