import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User avatar URL', required: false })
  avatar?: string;
}

export class UserProfileResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Global name', required: false })
  globalName?: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User phone number' })
  phone: string;

  @ApiProperty({ description: 'User avatar URL', required: false })
  avatar?: string;

  @ApiProperty({ description: 'User status', required: false })
  status?: string;

  @ApiProperty({ description: 'Custom status message', required: false })
  customStatus?: string;

  @ApiProperty({ description: 'User creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'User last update date' })
  updatedAt: Date;
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
        value: { type: 'string' }
      }
    }
  })
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}
