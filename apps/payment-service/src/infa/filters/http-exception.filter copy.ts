import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppError, AppIssueCode } from 'src/common/app-error';

const HttpCodeMap: Record<AppIssueCode, HttpStatus> = {
  unknown: HttpStatus.INTERNAL_SERVER_ERROR,
  plan_notfound: HttpStatus.NOT_FOUND,
  auth_invalid: HttpStatus.UNAUTHORIZED,
  plan_invalid: HttpStatus.BAD_REQUEST,
  email_invalid: HttpStatus.BAD_REQUEST,
};

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
    } else if (exception instanceof AppError) {
      const issueLength = exception.issues.length;
      if (issueLength === 0) {
        statusCode = HttpCodeMap.unknown;
      } else {
        statusCode = HttpStatus.GONE;
        const messages = exception.issues.map((issue) => issue.message);
        message = messages.join(', ');
      }

      message = exception.message;
    }

    const errorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      message,
    };

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      const errorDetails = {
        ...errorResponse,
        stack: exception instanceof Error ? exception.stack : undefined,
      };
      this.logger.error(JSON.stringify(errorDetails));
    }

    response.status(statusCode).json(errorResponse);
  }
}
