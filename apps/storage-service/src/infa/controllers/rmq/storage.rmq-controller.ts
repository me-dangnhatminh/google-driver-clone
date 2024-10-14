import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { DiskStorageService } from 'src/infa/adapters';

import { Controller } from '@nestjs/common';

@Controller()
export class StorageRmqController {
  constructor(private readonly diskStorageService: DiskStorageService) {}

  @MessagePattern('storage.file_removed')
  async fileRemoved(@Payload() data, @Ctx() context: RmqContext) {
    const { id } = data;
    await this.diskStorageService.deleteFiles([id]);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }

  @MessagePattern('storage.files_removed')
  async filesRemoved(@Payload() data, @Ctx() context: RmqContext) {
    const { ids } = data;
    await this.diskStorageService.deleteFiles(ids);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
