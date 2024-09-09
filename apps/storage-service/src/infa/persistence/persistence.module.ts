import { DynamicModule, Logger } from '@nestjs/common';

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

export class PersistencesModule {
  constructor() {}

  static forRoot(): DynamicModule {
    return {
      module: PersistencesModule,
      imports: [
        {
          module: PersistencesModule,
          global: true,
          providers: [
            {
              provide: PrismaClient,
              inject: [ConfigService],
              useFactory: async (
                configService: ConfigService<Configs, true>,
              ) => {
                const logger = new Logger(PersistencesModule.name);
                const dbConfig = configService.get<DbConfig>('db');
                const url = `${dbConfig.type}://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
                const prisma = new PrismaClient({ datasourceUrl: url });
                // TODO: bad solution, need to find a better way to connect to the database
                await prisma
                  .$connect()
                  .then(() => {
                    const msg = `Connected to database (${dbConfig.type}): ${dbConfig.database}, host: ${dbConfig.host}, port: ${dbConfig.port}, username: ${dbConfig.username}`;
                    logger.log(msg);
                  })
                  .catch((err) => logger.error(err.message, err));
                return prisma;
              },
            },
          ],
          exports: [PrismaClient],
        },
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
      exports: [ClsModule],
    };
  }
}

export default PersistencesModule;
