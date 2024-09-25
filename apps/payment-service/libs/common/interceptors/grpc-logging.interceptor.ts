import { Metadata, Call } from '@grpc/grpc-js';
import {
  NestInterceptor,
  Logger,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';

export class GrpcLoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger(GrpcLoggingInterceptor.name);
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!context.getType().startsWith('rpc')) return next.handle();
    const now = Date.now();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [req, metadata, call]: [Request, Metadata, Call] = context.getArgs();

    const className = context.getClass().name;
    const method = context.getHandler().name;
    const service = `${className}.${method}`;

    const client = call.getPeer();
    const host = '';
    const path = call['path'];

    // const clientIp = metadata.get('x-forwarded-for');

    return next.handle().pipe(
      tap(() => {
        const msg = `GRPC ${service} ${client} ${host} ${path} ${Date.now() - now}ms`;
        this.logger.log(msg);
      }),
      catchError((err) => {
        const msgJson = {
          service,
          client,
          host,
          path,
          elapsed: `${Date.now() - now}ms`,
          error: err.message,
        };
        const msg = JSON.stringify(msgJson, null, 2);
        this.logger.error(msg, err.stack);
        throw err;
      }),
    );
  }
}
