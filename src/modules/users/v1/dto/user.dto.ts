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
import { UserStatus, FriendshipStatus, RelationType } from '@prisma/client';
import { IsEmoji } from 'src/common/decorators/is-emoji.decorator';
import { PresenceExpireDuration } from 'src/common/Types/presence.types';
import { IsId } from '../../../../common/Global/validators/isId.validator';
import { IsUsername } from '../../../../common/Global/validators/username.validator';
import { FriendRequestResponseStatus } from './user-types.dto';

// ==================== PROFILE DTOs ====================

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
  globalname: string;
}

export class UpdateCustomStatusDto {
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

// ==================== FRIENDSHIP DTOs ====================

export class SendFriendRequestDto {
  @ApiProperty({
    description: 'The username of the user to send friend request to (optional if userId is provided)',
    example: 'john_doe',
    required: false
  })
  @IsString()
  @IsOptional()
  @IsUsername()
  username?: string;

  @ApiProperty({
    description: 'The ID of the user to send friend request to (optional if username is provided)',
    example: '123456789012345678',
    required: false
  })
  @IsString()
  @IsOptional()
  @IsId()
  userId?: string;
}

export class RespondToFriendRequestDto {
  @ApiProperty({
    description: 'The ID of the friendship request',
    example: '123456789012345678'
  })
  @IsString()
  @IsNotEmpty()
  @IsId()
  friendshipId: string;

  @ApiProperty({
    description: 'The response to the friend request - ACCEPTED or REJECTED',
    enum: FriendRequestResponseStatus,
    example: FriendRequestResponseStatus.ACCEPTED
  })
  @IsEnum(FriendRequestResponseStatus, {
    message: 'Status must be either ACCEPTED or REJECTED'
  })
  status: FriendRequestResponseStatus;
}

export class RemoveFriendDto {
  @ApiProperty({
    description: 'The ID of the user to remove from friends',
    example: '123456789012345678'
  })
  @IsString()
  @IsNotEmpty()
  @IsId()
  userId: string;
}

export class GetFriendsQueryDto {
  @ApiProperty({
    description: 'Filter friends by status',
    enum: FriendshipStatus,
    required: false,
    example: FriendshipStatus.ACCEPTED
  })
  @IsOptional()
  @IsEnum(FriendshipStatus)
  status?: FriendshipStatus;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    example: 1
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    example: 20
  })
  @IsOptional()
  @IsString()
  limit?: string;
}

export class GetMutualFriendsDto {
  @ApiProperty({
    description: 'The ID of the user to get mutual friends with',
    example: '123456789012345678'
  })
  @IsString()
  @IsNotEmpty()
  @IsId()
  userId: string;
}

export class CheckFriendshipDto {
  @ApiProperty({
    description: 'The ID of the user to check friendship with',
    example: '123456789012345678'
  })
  @IsString()
  @IsNotEmpty()
  @IsId()
  userId: string;
}

export class CancelFriendRequestDto {
  @ApiProperty({
    description: 'The ID of the friendship request to cancel',
    example: '123456789012345678'
  })
  @IsString()
  @IsNotEmpty()
  @IsId()
  friendshipId: string;
}

// ==================== USER RELATION DTOs ====================

export class CreateUserRelationDto {
  @ApiProperty({
    description: 'The ID of the target user',
    example: '123456789012345678'
  })
  @IsString()
  @IsNotEmpty()
  @IsId()
  targetUserId: string;

  @ApiProperty({
    description: 'The type of relation to create',
    enum: RelationType,
    example: RelationType.BLOCKED
  })
  @IsEnum(RelationType)
  type: RelationType;

  @ApiProperty({
    description: 'Optional note for the relation',
    example: 'Spam user',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class UpdateUserRelationDto {
  @ApiProperty({
    description: 'The ID of the target user',
    example: '123456789012345678'
  })
  @IsString()
  @IsNotEmpty()
  @IsId()
  targetUserId: string;

  @ApiProperty({
    description: 'The type of relation to update',
    enum: RelationType,
    example: RelationType.BLOCKED
  })
  @IsEnum(RelationType)
  type: RelationType;

  @ApiProperty({
    description: 'Updated note for the relation',
    example: 'Updated reason for blocking',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class RemoveUserRelationDto {
  @ApiProperty({
    description: 'The ID of the target user',
    example: '123456789012345678'
  })
  @IsString()
  @IsNotEmpty()
  @IsId()
  targetUserId: string;

  @ApiProperty({
    description: 'The type of relation to remove',
    enum: RelationType,
    example: RelationType.BLOCKED
  })
  @IsEnum(RelationType)
  type: RelationType;
}

export class GetUserRelationsQueryDto {
  @ApiProperty({
    description: 'Filter by relation type',
    enum: RelationType,
    required: false,
    example: RelationType.BLOCKED
  })
  @IsOptional()
  @IsEnum(RelationType)
  type?: RelationType;
}

export class CheckUserRelationDto {
  @ApiProperty({
    description: 'The ID of the target user to check relation with',
    example: '123456789012345678'
  })
  @IsString()
  @IsNotEmpty()
  @IsId()
  targetUserId: string;

  @ApiProperty({
    description: 'The type of relation to check',
    enum: RelationType,
    example: RelationType.BLOCKED
  })
  @IsEnum(RelationType)
  type: RelationType;
}

export class UpdateRelationNoteDto {
  @ApiProperty({
    description: 'The ID of the target user',
    example: '123456789012345678'
  })
  @IsString()
  @IsNotEmpty()
  @IsId()
  targetUserId: string;

  @ApiProperty({
    description: 'The type of relation',
    enum: RelationType,
    example: RelationType.BLOCKED
  })
  @IsEnum(RelationType)
  type: RelationType;

  @ApiProperty({
    description: 'New note for the relation',
    example: 'Updated reason for blocking'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  note: string;
}


// Crate DM want user id only in body
export class CreateDMDto {
  @ApiProperty({
    description: 'The ID of the target user',
    example: '123456789012345678'
  })
  @IsString()
  @IsNotEmpty()
  @IsId()
  targetUserId: string;
}