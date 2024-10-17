import { Authenticated, HttpUser } from '@app/auth-client';
import { Metadata } from '@grpc/grpc-js';
import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Logger,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('storage')
@ApiBearerAuth()
@Controller({ path: 'storage', version: '1' })
@UseGuards(Authenticated)
export class StorageRestController {
  private readonly logger = new Logger(StorageRestController.name);

  constructor(
    @Inject('StorageService') private readonly storageService,
    @Inject('UserService') private readonly userService,
  ) {}

  @Get('my-storage')
  async my(@HttpUser() user, @Res({ passthrough: true }) res) {
    const storageId = user?.metadata['my-storage'];
    if (!storageId) {
      this.logger.warn('Storage not found, creating new one');
      const metadata = new Metadata();
      metadata.set('idempotency-key', `storage-create-${user.id}`);
      const storage = await this.storageService
        .create({ ownerId: user.id, used: BigInt(0) }, metadata)
        .toPromise();
      const update = { id: user.id, metadata: { 'my-storage': storage.id } };
      await this.userService.update(update, metadata).toPromise();
      res.status(201);
      return storage;
    }
    const storage = await this.storageService.get({ id: storageId });
    if (!storage) {
      this.logger.error('Storage not found');
      throw new BadRequestException('Storage not found');
    }
    return storage;
  }
}
