// Application constants
export const APP_CONSTANTS = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },
  
  // Response Messages
  MESSAGES: {
    SUCCESS: 'Operation completed successfully',
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    VALIDATION_ERROR: 'Validation failed',
    INTERNAL_ERROR: 'Internal server error',
  },
  
  // JWT
  JWT: {
    ACCESS_TOKEN_EXPIRES: '7d',
    REFRESH_TOKEN_EXPIRES: '30d',
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
} as const;

// Environment
export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;