// Common types used across the application

export interface ApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  code: string; // e.g., 'USER_CREATED', 'LOGIN_SUCCESS'
  message: string;
  data?: T;
  timestamp?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
  type?: 'access' | 'refresh';
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ErrorResponse {
  status: 'fail' | 'error';
  code: string;
  message: string;
  errors?: ValidationError[];
  timestamp: string;
}