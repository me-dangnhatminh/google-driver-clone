import { Module } from '@nestjs/common';
import { getQueueToken, BullModule as NestBull } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Configs } from 'src/config';

@Module({
  imports: [
    NestBull.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => {
        const rdConfig = configService.get('redis', { infer: true });
        return {
          connection: {
            host: rdConfig.host,
            port: rdConfig.port,
            username: rdConfig.username,
            password: rdConfig.password,
            db: rdConfig.db,
          },
        };
      },
    }),
    NestBull.registerQueue({
      name: 'CustomerQueue',
    }),
  ],
  providers: [
    {
      provide: 'CustomerQueue',
      useExisting: getQueueToken('CustomerQueue'),
    },
  ],
  exports: [NestBull, 'CustomerQueue'],
})
export class BullModule {}
