import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FriendshipStatus } from '@prisma/client';
import { IsId } from '../../../../common/Global/validators/isId.validator';
import { IsUsername } from '../../../../common/Global/validators/username.validator';

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
    enum: ['ACCEPTED', 'REJECTED'],
    example: 'ACCEPTED'
  })
  @IsEnum(['ACCEPTED', 'REJECTED'], {
    message: 'Status must be either ACCEPTED or REJECTED'
  })
  status: 'ACCEPTED' | 'REJECTED';
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
