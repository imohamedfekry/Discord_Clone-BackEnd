import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export default class CatchAllFilter implements ExceptionFilter {
  catch(exception: Error & { code?: string }, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    console.log(exception);
    if (process.env.NODE_ENV === 'development') {
      return this.errorDev(res, exception);
    } else {
      return this.errorProd(res);
    }
  }

  errorDev(res: Response, exception: Error & { code?: string | undefined }) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      exception,
      message: exception.message,
      code: exception.code ?? '500' as string | undefined,
    });
  }

  errorProd(res: Response) {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      code: '500' as string,
    });
  }
}
