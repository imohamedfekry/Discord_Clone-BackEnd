import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  @Injectable()
  export class TransformInterceptor<T> implements NestInterceptor<T, any> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
      return next.handle().pipe(
        map((data: any) => {
          // لو الـ data كائن (object)، يبقى نتعامل معاه
          const isObject = typeof data === 'object' && data !== null;
  
          return {
            status: 'success',
            code: 200,
            message: isObject && 'message' in data ? data.message : '',
            data: isObject && 'data' in data ? data.data : data,
          };
        }),
      );
    }
  }
