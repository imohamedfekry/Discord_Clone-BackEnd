import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { DateTransform } from '../../../../common/decorators/date-transform.decorator';

/**
 * User Types and Enums
 * Centralized types for user module DTOs
 */

export enum FriendRequestResponseStatus {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

/**
 * User DTO for user module responses
 * Used in UserProfileResponseDto
 */
export class UserDto {
  @Expose()
  @Transform(({ obj }) => obj.id?.toString())
  @ApiProperty({ description: 'User ID' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Username' })
  username: string;

  @Expose()
  @DateTransform({ nullable: true })
  @ApiProperty({ description: 'User birthdate', required: false, type: String, nullable: true })
  birthdate?: string | null;

  @Expose()
  @ApiProperty({ description: 'Global name', required: false })
  globalname?: string;

  @Expose()
  @ApiProperty({ description: 'User email', required: false })
  email?: string;

  @Expose()
  @ApiProperty({ description: 'User phone number', required: false })
  phone?: string;

  @Expose()
  @ApiProperty({ description: 'User avatar URL', required: false })
  avatar?: string;

  @Expose()
  @ApiProperty({ description: 'User is bot' })
  isBot: boolean;

  @Expose()
  @DateTransform({ nullable: true })
  @ApiProperty({ description: 'User creation date', type: String, nullable: true })
  createdAt?: string | null;
}

