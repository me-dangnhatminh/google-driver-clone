import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
// import { I18nService } from 'nestjs-i18n';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor() {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    let statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;
    }

    const errorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      message,
    };

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      const errorDetails = Object.assign(
        {
          path: context.getRequest().url,
          method: context.getRequest().method,
        },
        errorResponse,
        { stack: stack?.split('\n') },
      );
      this.logger.debug(JSON.stringify(errorDetails, null, 2));
    }

    response.status(statusCode).json(errorResponse);
  }
}
