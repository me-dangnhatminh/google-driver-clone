import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Configs } from 'src/configs';

@Module({
  providers: [
    {
      provide: PrismaClient,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => {
        const logger = new Logger(PrismaModule.name);
        const dbConfig = configService.get('db', { infer: true });
        const url = `${dbConfig.type}://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
        const prisma = new PrismaClient({ datasourceUrl: url });
        return prisma
          .$connect()
          .then(() => {
            const msg = `Connected to database (${dbConfig.type}): ${dbConfig.database}, host: ${dbConfig.host}, port: ${dbConfig.port}, username: ${dbConfig.username}`;
            logger.log(msg);
          })
          .catch((err) => logger.error(err.message, err));
      },
    },
  ],
  exports: [PrismaClient],
})
export class PrismaModule {}

// =================================
// this is BigInt serialization for JSON (error)
Object.assign(BigInt.prototype, {
  toJSON() {
    return this.toString();
  },
});
// =================================
