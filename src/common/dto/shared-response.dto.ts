import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { DateTransform } from '../decorators/date-transform.decorator';

/**
 * User DTO containing common user fields from schema
 * Used for authentication responses and as a base for profile DTOs
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
  @ApiProperty({ description: 'User is online', required: false })
  isOnline?: boolean;

  @Expose()
  @ApiProperty({ description: 'User is bot' })
  isBot: boolean;

  @Expose()
  @DateTransform({ nullable: true })
  @ApiProperty({ description: 'User creation date', type: String, nullable: true })
  createdAt: string | null;
}



export class ErrorResponseDto {
  @ApiProperty({ description: 'Response status', enum: ['fail', 'error'] })
  status: 'fail' | 'error';

  @ApiProperty({ description: 'HTTP status code' })
  code: number;

  @ApiProperty({ description: 'Error message' })
  message: string;

  @ApiProperty({ description: 'Timestamp of the error' })
  timestamp: string;
}

export class ValidationErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Validation errors',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        field: { type: 'string' },
        message: { type: 'string' },
        value: { type: 'string' },
      },
    },
  })
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}
