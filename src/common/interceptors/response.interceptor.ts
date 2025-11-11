import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../shared/types';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        const isApiResponse =
          typeof data === 'object' &&
          data !== null &&
          'status' in data &&
          'code' in data &&
          'message' in data;

        if (isApiResponse) return data as ApiResponse<T>;

        const isObject = typeof data === 'object' && data !== null;
        return {
          status: 'success',
          code: 'SUCCESS',
          message: 'Operation completed successfully',
          data: isObject ? data : { value: data },
        } satisfies ApiResponse<any>;
      }),
    );
  }
}


