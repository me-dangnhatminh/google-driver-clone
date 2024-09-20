import {
  ExecutionContext,
  PayloadTooLargeException,
  NestInterceptor,
  CallHandler,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class StorageFreeInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const storage = req.storage;
    const placeholder = req.storage.placeholder; // placeholder is the size of the file being uploaded
    const isFree = placeholder + storage.used <= storage.total;
    if (!isFree)
      throw new PayloadTooLargeException({
        type: 'invalid_storage',
        code: 'storage_not_enough',
        message: 'Not enough storage',
        used: storage.used,
        capacity: storage.capacity,
        placeholder: placeholder,
      });
    return next.handle();
  }
}
