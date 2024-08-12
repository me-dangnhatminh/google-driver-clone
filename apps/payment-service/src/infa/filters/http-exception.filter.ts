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

const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

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
      timestamp: formatter.format(new Date()),
      message,
    };

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      const path = context.getRequest().url;
      const method = context.getRequest().method;

      const errorDetails = Object.assign({ method, path }, errorResponse);
      let msg = `Error: ${JSON.stringify(errorDetails, null, 2)}`;
      if (stack) msg += `\nStack: ${stack}`;
      this.logger.error(msg);
    }

    response.status(statusCode).json(errorResponse);
  }
}
