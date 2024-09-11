import { TransactionHost } from '@nestjs-cls/transactional';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { randomUUID as uuid } from 'crypto';
import { MyStorage, RootFolder } from 'src/domain';

@Injectable()
export class StorageService {
  constructor(
    private readonly txHost: TransactionHost,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getMyStorage(ownerId: string) {
    const tx = this.txHost.tx as PrismaClient;
    const key = `storage:${ownerId}`;
    let storage = await this.cacheManager.get<MyStorage>(key);
    if (!storage) {
      const id = uuid();
      const my = MyStorage.parse({ id, ownerId, refId: id });
      const root = RootFolder.parse({ id, ownerId, name: 'My Storage' });
      const freespace = 1 * 1024 * 1024 * 1024; // 1GB , TODO: get from config
      storage = await tx.myStorage
        .upsert({
          where: { ownerId },
          include: { ref: true },
          create: {
            id: my.id,
            ownerId: my.ownerId,
            createdAt: my.createdAt,
            ref: { create: root },
          },
          update: {},
        })
        .then((my) => ({
          ...my,
          used: Number(my.ref.size),
          total: Number(freespace),
        }));

      this.cacheManager.set(key, storage, 5 * 60 * 1000); // 5 minutes
    }
    return storage;
  }
}
