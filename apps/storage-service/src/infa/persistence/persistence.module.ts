import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';

import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient } from '@prisma/client';

// =================================
// this is BigInt serialization for JSON (error)
Object.assign(BigInt.prototype, {
  toJSON() {
    return this.toString();
  },
});
// =================================

@Module({
  imports: [],
  providers: [PrismaClient],
  exports: [PrismaClient],
})
export class PrismaModule implements OnModuleInit {
  private readonly logger = new Logger(PrismaModule.name);
  constructor(private readonly prisma: PrismaClient) {}

  async onModuleInit() {
    await this.prisma
      .$connect()
      .then(() => this.logger.log('Prisma connected'))
      .catch((error) => this.logger.error('Prisma connection error', error));
  }
}

const clsModule = ClsModule.forRoot({
  plugins: [
    new ClsPluginTransactional({
      imports: [PrismaClient],
      adapter: new TransactionalAdapterPrisma({
        prismaInjectionToken: PrismaClient,
      }),
    }),
  ],
});

@Global()
@Module({
  imports: [PrismaModule, clsModule],
  providers: [],
  exports: [PrismaModule],
})
export class PersistencesModule {}

export default PersistencesModule;
