import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HTTPLogger implements NestMiddleware {
  private logger = new Logger(HTTPLogger.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl: url } = request;
    const ip = request.headers['x-forwarded-for'] || request.ip;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length') || 0;
      const latency = Date.now() - startTime;
      const msg = `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip} - ${latency}ms`;

      if (statusCode >= 500) {
        this.logger.error(msg);
      } else if (statusCode >= 400) {
        this.logger.warn(msg);
      } else {
        this.logger.log(msg);
      }
    });

    next();
  }
}
