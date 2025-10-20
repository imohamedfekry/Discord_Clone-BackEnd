import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiConflictResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { ErrorResponseDto, UserProfileResponseDto } from 'src/common/dto';

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

/**
 * Send Friend Request by Username API Documentation
 */
export function SendFriendRequestByUsernameApiDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.CREATED),
    ApiOperation({ 
      summary: 'Send friend request by username',
      description: 'Send a friend request to another user using their username. Use this for users not in the same server/chat. This method is more secure but slower.'
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Friend request sent successfully',
      schema: {
        example: {
          status: 'success',
          code: 201,
          message: 'Friend request sent successfully',
          data: {
            id: '123456789012345678',
            status: 'PENDING',
            createdAt: '2025-10-17T12:00:00.000Z'
          }
        }
      }
    }),
    ApiBadRequestResponse({ 
      description: 'Bad request - Invalid input data or cannot add yourself',
      type: ErrorResponseDto
    }),
    ApiNotFoundResponse({ 
      description: 'User not found',
      type: ErrorResponseDto
    }),
    ApiConflictResponse({ 
      description: 'Users are already friends or request already pending',
      type: ErrorResponseDto
    }),
    ApiUnauthorizedResponse({ 
      description: 'Unauthorized - Invalid or missing token',
      type: ErrorResponseDto
    })
  );
}

/**
 * Send Friend Request by ID API Documentation
 */
export function SendFriendRequestByIdApiDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.CREATED),
    ApiOperation({ 
      summary: 'Send friend request by user ID',
      description: 'Send a friend request to another user using their ID. Use this for users in the same server/chat. This method is faster but requires knowing the user ID.'
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Friend request sent successfully',
      schema: {
        example: {
          status: 'success',
          code: 201,
          message: 'Friend request sent successfully',
          data: {
            id: '123456789012345678',
            status: 'PENDING',
            createdAt: '2025-10-17T12:00:00.000Z'
          }
        }
      }
    }),
    ApiBadRequestResponse({ 
      description: 'Bad request - Invalid input data or cannot add yourself',
      type: ErrorResponseDto
    }),
    ApiNotFoundResponse({ 
      description: 'User not found',
      type: ErrorResponseDto
    }),
    ApiConflictResponse({ 
      description: 'Users are already friends or request already pending',
      type: ErrorResponseDto
    }),
    ApiUnauthorizedResponse({ 
      description: 'Unauthorized - Invalid or missing token',
      type: ErrorResponseDto
    })
  );
}