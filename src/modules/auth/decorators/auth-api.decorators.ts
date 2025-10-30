import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBadRequestResponse, ApiConflictResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { AuthResponseDto, LoginResponseDto } from '../../../common/dto/auth-response.dto';
import { ErrorResponseDto, ValidationErrorResponseDto } from '../../../common/dto/shared-response.dto';

/**
 * Register API Documentation
 */
export function RegisterApiDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.CREATED),
    ApiOperation({ 
      summary: 'Register a new user',
      description: 'Create a new user account with username, email, password and phone number'
    }),
    ApiResponse({ 
      status: 201, 
      description: 'User successfully registered',
      type: AuthResponseDto,
      schema: {
        example: {
          status: 'success',
          code: 'USER_CREATED',
          message: 'User created successfully',
          data: {
            user: {
              id: '1234567890',
              username: 'johndoe',
              email: 'john@example.com',
              avatar: null
            },
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        }
      }
    }),
    ApiBadRequestResponse({ 
      description: 'Validation failed',
      type: ValidationErrorResponseDto,
      schema: {
        example: {
          status: 'fail',
          code: 'VALIDATION_FAILED',
          message: 'Validation failed',
          timestamp: '2025-10-17T12:00:00.000Z',
          errors: [
            {
              field: 'email',
              message: 'Invalid email format',
              value: 'invalid-email'
            }
          ]
        }
      }
    }),
    ApiConflictResponse({ 
      description: 'User already exists',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'fail',
          code: 'USER_ALREADY_EXISTS',
          message: 'User with this email already exists',
          timestamp: '2025-10-17T12:00:00.000Z'
        }
      }
    })
  );
}

/**
 * Login API Documentation
 */
export function LoginApiDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ 
      summary: 'Login user',
      description: 'Authenticate user with email and password'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'User successfully logged in',
      type: LoginResponseDto,
      schema: {
        example: {
          status: 'success',
          code: 'LOGIN_SUCCESS',
          message: 'Logged in successfully',
          data: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        }
      }
    }),
    ApiBadRequestResponse({ 
      description: 'Validation failed',
      type: ValidationErrorResponseDto,
      schema: {
        example: {
          status: 'fail',
          code: 400,
          message: 'Validation failed',
          timestamp: '2025-10-17T12:00:00.000Z',
          errors: [
            {
              field: 'email',
              message: 'Email is required',
              value: ''
            }
          ]
        }
      }
    }),
    ApiUnauthorizedResponse({ 
      description: 'Invalid credentials',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'fail',
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          timestamp: '2025-10-17T12:00:00.000Z'
        }
      }
    })
  );
}
