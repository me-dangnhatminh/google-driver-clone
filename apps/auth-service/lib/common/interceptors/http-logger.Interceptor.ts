import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class HTTPLogger implements NestInterceptor {
  private logger = new Logger(HTTPLogger.name);

  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { ip, method, url } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap((res) => {
        const { statusCode } = response;
        const contentLength = response.get('content-length') || 0;
        const responseTime = Date.now() - startTime;
        const msg = `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip} - ${responseTime}ms`;

        if (statusCode >= 500) {
          this.logger.error(msg);
        } else if (statusCode >= 400) {
          this.logger.warn(msg);
        } else {
          this.logger.log(msg);
        }
      }),
    );
  }
}
