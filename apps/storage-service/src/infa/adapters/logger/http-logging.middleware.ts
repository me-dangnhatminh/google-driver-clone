import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID as uuid } from 'crypto';

export type HttpLoggingMessage = {
  request: {
    id: string;
    headers: any;
    uri: string;
    url: string;
    method: string;
    querystring: string;
    size: number;
    [key: string]: any;
  };
  response: {
    status: number;
    size: number;
    latency: number;
    headers: any;
    [key: string]: any;
  };
};
@Injectable()
export class HttpLogging implements NestMiddleware {
  private logger = new Logger(HttpLogging.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const startTime = Date.now();

    const requestHeaders = request.headers;
    const requestId = requestHeaders['x-request-id'] ?? uuid();

    const clientIp =
      requestHeaders['x-forwarded-for'] ||
      requestHeaders['x-real-ip'] ||
      request.connection.remoteAddress;

    const requestMessage = {
      id: requestId,
      headers: request.headers,
      uri: request.url,
      url: request.originalUrl,
      method: request.method,
      querystring: JSON.stringify(request.query),
      size: Number(request.get('content-length') || 0),
    };

    response.on('finish', () => {
      const latency = Date.now() - startTime;
      const responseMessage = {
        status: response.statusCode,
        size: Number(response.get('content-length') || 0),
        latency,
        headers: response.getHeaders(),
      };

      const message = `${request.method} ${request.url} ${responseMessage.status} ${responseMessage.size} - ${clientIp} - ${latency}ms`;
      this.logger.debug({
        clientIp,
        request: requestMessage,
        response: responseMessage,
        message: message,
      });
    });

    next();
  }
}
