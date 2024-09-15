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
import { STORAGE_SERVICE_NAME } from './constant';
import { ClientGrpcProxy } from '@nestjs/microservices';

@Injectable()
export class StorageLoaded implements CanActivate {
  private readonly logger = new Logger(StorageLoaded.name);
  private storageService: any;
  constructor(@Inject(STORAGE_SERVICE_NAME) client: ClientGrpcProxy) {
    this.storageService = client.getService('StorageService');
  }
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const ownerId: string = req.user.sub;
    if (!ownerId) {
      this.logger.error('No ownerId found in request');
      throw new InternalServerErrorException();
    }
    const meta = new grpc.Metadata();
    meta.add('accessorId', ownerId);
    const get: rx.Observable<any> = this.storageService.myStorage({}, meta);
    return rx.from(get).pipe(
      rx.catchError((err) => {
        this.logger.error(err);
        throw new InternalServerErrorException();
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
