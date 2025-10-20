import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RelationType } from '@prisma/client';
import { IsId } from '../../../../common/Global/validators/isId.validator';

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
