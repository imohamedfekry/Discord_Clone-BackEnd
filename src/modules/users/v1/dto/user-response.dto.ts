import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { DateTransform } from '../../../../common/decorators/date-transform.decorator';
import { UserStatus } from '@prisma/client';
import { UserDto } from './user-types.dto';

/**
 * Simplified Presence DTO for user profile response
 * Only contains status - expiresAt and createdAt are excluded
 */
export class PresenceDto {
  @Expose()
  @ApiProperty({ 
    description: 'Presence status (Display Status from Database). Returns OFFLINE if user is offline',
    enum: UserStatus,
    required: false,
    nullable: true
  })
  status?: UserStatus | null;
}

/**
 * Simplified User Status Record DTO for user profile response
 * Only contains text and emoji - expiresAt is excluded
 */
export class UserStatusRecordDto {
  @Expose()
  @ApiProperty({ 
    description: 'Custom status text',
    example: 'Playing Minecraft',
    required: false,
    nullable: true
  })
  text?: string | null;

  @Expose()
  @ApiProperty({ 
    description: 'Custom status emoji',
    example: '🎮',
    required: false,
    nullable: true
  })
  emoji?: string | null;
}

/**
 * User Profile Response DTO
 * Combines UserDto + PresenceDto + UserStatusRecordDto + isOnline from Redis
 */
export class UserProfileResponseDto {
  // User fields - using UserDto
  @Expose()
  @Type(() => UserDto)
  @ApiProperty({ 
    description: 'User information',
    type: UserDto
  })
  user: UserDto;

  // Presence fields - using PresenceDto
  @Expose()
  @Type(() => PresenceDto)
  @ApiProperty({ 
    description: 'Presence information (Display Status from Database)',
    type: PresenceDto,
    required: false
  })
  presence?: PresenceDto | null;

  // Custom Status fields - using UserStatusRecordDto
  @Expose()
  @Type(() => UserStatusRecordDto)
  @ApiProperty({ 
    description: 'Custom status information',
    type: UserStatusRecordDto,
    required: false
  })
  customStatus?: UserStatusRecordDto | null;

  // Connection status from Redis (WebSocket) - real-time
  @Expose()
  @ApiProperty({ 
    description: 'Connection status from Redis (WebSocket) - real-time',
    example: true
  })
  isOnline: boolean;
}

