import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HTTPLogger implements NestMiddleware {
  private logger = new Logger(HTTPLogger.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, path: url } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const responseTime = Date.now() - startTime;
      const msg = `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip} - ${responseTime}ms`;

      const isErrored = statusCode >= 400;
      if (isErrored) {
        this.logger.error(msg);
      } else {
        this.logger.log(msg);
      }
    });

    next();
  }
}