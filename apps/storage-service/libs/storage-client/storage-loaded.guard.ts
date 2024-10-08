import {
  ExecutionContext,
  Injectable,
  CanActivate,
  Logger,
  createParamDecorator,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';
import * as rx from 'rxjs';

@Injectable()
export class StorageLoaded implements CanActivate {
  private readonly logger = new Logger(StorageLoaded.name);
  constructor(@Inject('StorageService') private readonly storageService) {}

  canActivate(context: ExecutionContext) {
    if (context.getType() !== 'http') return true;

    const req = context.switchToHttp().getRequest();
    const owner_id: string = req.auth.userId;

    if (!owner_id) throw new InternalServerErrorException();
    return rx.from(this.storageService.get({ owner_id })).pipe(
      rx.catchError(() => {
        return this.storageService.initial({ owner_id });
      }),
      rx.map((storage) => {
        req.storage = storage;
        return true;
      }),
    );
  }
}

export const HttpStorage = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return data ? req?.storage[data] : req?.storage;
  },
);
