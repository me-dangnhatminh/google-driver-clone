import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Observable, firstValueFrom, of } from 'rxjs';
// import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor() {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const ctx: HttpArgumentsHost = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode: number = response.statusCode;
    const responseBody = await firstValueFrom(next.handle());

    const message = responseBody?.message ?? 'success';

    return of({
      statusCode,
      // timestamp: new Date().toISOString(),
      message,
      data: responseBody,
    });
  }
}
