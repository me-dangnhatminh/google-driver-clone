import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID as uuid } from 'crypto';

@Injectable()
export class HTTPLogger implements NestMiddleware {
  private logger = new Logger(HTTPLogger.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl: url, body, query, params } = request;
    const startTime = Date.now();

    const requestId = uuid();
    request['id'] = requestId;
    response.setHeader('X-Request-ID', requestId);

    response.on('finish', () => {
      const executionTime = `${Date.now() - startTime}ms`;
      const status = response.statusCode;

      // FIXME: If the body and query contain too much data, it can cause overload. Need to limit the size of the data.
      const msgObj = {
        id: requestId,
        executionTime,
        request: { ip, method, url, body, query, params },
        response: {
          status,
          message: response.statusMessage,
          headers: response.getHeaders(),
          body: 'response body',
        },
      };
      const msgJson = JSON.stringify(msgObj, null, 2);

      if (status < 400) {
        this.logger.log(msgJson);
      } else if (status < 500) {
        this.logger.warn(msgJson);
      } else {
        this.logger.error(msgJson);
      }
    });

    next();
  }
}
