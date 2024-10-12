import { CacheInterceptor } from '@nestjs/cache-manager';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class BearerTokenCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.split('Bearer ')[1];

    const oldTrack = super.trackBy(context);
    const cachekey = oldTrack && token ? `${oldTrack}-${token}` : oldTrack;
    if (cachekey) response.setHeader('x-cache-key', cachekey);
    return cachekey;
  }
}

export default BearerTokenCacheInterceptor;
