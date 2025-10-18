import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBadRequestResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { 
  UserProfileResponseDto, 
  ErrorResponseDto, 
} from '../../../common/dto/shared-response.dto';

/**
 * Get Profile API Documentation
 */
export function GetProfileApiDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ 
      summary: 'Get current user profile',
      description: 'Retrieve the profile information of the currently authenticated user'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'User profile retrieved successfully',
      type: UserProfileResponseDto,
      schema: {
        example: {
          status: 'success',
          code: 200,
          message: '',
          data: {
            id: '1234567890',
            username: 'johndoe',
            email: 'john@example.com',
            phone: '+1234567890',
            avatar: 'https://example.com/avatar.jpg',
            bio: 'Software developer and tech enthusiast',
            status: 'online',
            createdAt: '2025-10-17T12:00:00.000Z',
            updatedAt: '2025-10-17T12:00:00.000Z'
          }
        }
      }
    }),
    ApiUnauthorizedResponse({ 
      description: 'Unauthorized - Invalid or missing token',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'fail',
          code: 401,
          message: 'Unauthorized',
          timestamp: '2025-10-17T12:00:00.000Z'
        }
      }
    })
  );
}