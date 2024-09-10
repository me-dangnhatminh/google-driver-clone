import {
  ExecutionContext,
  Injectable,
  CanActivate,
  Logger,
  createParamDecorator,
  InternalServerErrorException,
} from '@nestjs/common';

import { StorageService } from 'src/app';

@Injectable()
export class StorageLoaded implements CanActivate {
  private readonly logger = new Logger(StorageLoaded.name);
  constructor(private readonly storageService: StorageService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const ownerId: string = req.user.sub;
    if (!ownerId) {
      this.logger.error('No ownerId found in request');
      throw new InternalServerErrorException();
    }
    req.storage = await this.storageService.getMyStorage(ownerId);
    return true;
  }
}

export const HttpStorage = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return data ? req?.storage[data] : req?.storage;
  },
);
