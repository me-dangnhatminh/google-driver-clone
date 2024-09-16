import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [PrismaModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaClient,
            defaultTxOptions: {
              isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            },
          }),
        }),
      ],
    }),
  ],
  exports: [ClsModule],
})
export class PersistencesModule {}
