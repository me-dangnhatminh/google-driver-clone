import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [
    {
      provide: PrismaClient,
      useValue: new PrismaClient({
        log: [{ emit: 'event', level: 'query' }],
      }),
    },
  ],
  exports: [PrismaClient],
})
export class PrismaModule implements OnModuleInit {
  private readonly logger = new Logger(PrismaModule.name);
  constructor(private readonly prisma: PrismaClient<any>) {}

  async onModuleInit() {
    await this.prisma.$connect().then(() => {
      this.logger.log('Connected to database');
    });

    await this.prisma.$on('query', (e) => {
      this.logger.debug(JSON.stringify(e, null, 2));
    });
  }
}

// =================================
// this is BigInt serialization for JSON (error)
Object.assign(BigInt.prototype, {
  toJSON() {
    return this.toString();
  },
});
