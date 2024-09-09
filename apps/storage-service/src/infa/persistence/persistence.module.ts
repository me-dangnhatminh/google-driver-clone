import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';

import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Configs } from 'src/configs';
import { DbConfig } from 'src/configs/db.config';

// =================================
// this is BigInt serialization for JSON (error)
Object.assign(BigInt.prototype, {
  toJSON() {
    return this.toString();
  },
});
// =================================

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [PrismaClient],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaClient,
          }),
        }),
      ],
    }),
  ],
  providers: [PrismaClient],
  exports: [PrismaClient, ClsModule],
})
export class PersistencesModule implements OnModuleInit {
  private readonly logger;
  private readonly prisma: PrismaClient;
  private readonly dbConfig: DbConfig;

  constructor(private readonly configService: ConfigService<Configs, true>) {
    this.logger = new Logger(PersistencesModule.name);
    this.dbConfig = this.configService.get<DbConfig>('db');

    const url = `${this.dbConfig.dbType}://${this.dbConfig.username}:${this.dbConfig.password}@${this.dbConfig.host}:${this.dbConfig.port}/${this.dbConfig.database}`;
    this.prisma = new PrismaClient({ datasourceUrl: url });
  }

  async onModuleInit() {
    await this.prisma
      .$connect()
      .then(() => {
        const msg = `Prisma connected to ${this.dbConfig.dbType}://${this.dbConfig.host}:${this.dbConfig.port}/${this.dbConfig.database}`;
        this.logger.log(msg);
      })
      .catch((error) => this.logger.error('Prisma connection error', error));
  }
}

export default PersistencesModule;
