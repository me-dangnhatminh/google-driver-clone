import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HTTPLogger implements NestMiddleware {
  private logger = new Logger(HTTPLogger.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const now = Date.now();

    const client_ip =
      request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const _request = {
      id: request.headers['x-request-id'],
      headers: request.headers,
      uri: request.url,
      size: request.get('Content-Length'),
      method: request.method,
      querystring: request.query,
      url: request.originalUrl,
    };

    response.on('finish', () => {
      const latency = Date.now() - now;
      // response.setHeader('x-response-latency', `${latency}`);
      const _response = {
        size: response.get('Content-Length'),
        headers: response.getHeaders(),
        status: response.statusCode,
        latency,
      };

      const log = {
        client_ip,
        request: _request,
        response: _response,
      };
      this.logger.log(JSON.stringify(log, null, 2));
    });

    next();
  }
}
