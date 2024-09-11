import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [PrismaClient],
  exports: [PrismaClient],
})
export class PrismaModule implements OnModuleInit {
  private readonly logger = new Logger(PrismaModule.name);
  constructor(private readonly prisma: PrismaClient) {}

  async onModuleInit() {
    await this.prisma.$connect();
    this.logger.log('Connected to database');
  }
}

// =================================
// this is BigInt serialization for JSON (error)
Object.assign(BigInt.prototype, {
  toJSON() {
    return this.toString();
  },
});
// =================================
// {
//   provide: PrismaClient,
//   inject: [ConfigService],
//   useFactory: (configService: ConfigService<Configs, true>) => {
//     const logger = new Logger(PrismaModule.name);
//     const dbConfig = configService.get('db', { infer: true });
//     const url = `${dbConfig.type}://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
//     const prisma = new PrismaClient({ datasourceUrl: url });
//     return prisma
//       .$connect()
//       .then(() => {
//         const msg = `Connected to database (${dbConfig.type}): ${dbConfig.database}, host: ${dbConfig.host}, port: ${dbConfig.port}, username: ${dbConfig.username}`;
//         logger.log(msg);
//       })
//       .catch((err) => logger.error(err.message, err));
//   },
// },
