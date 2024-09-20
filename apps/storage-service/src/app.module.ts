import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import configs from 'src/config';
import providers from 'src/app';

import { PersistencesModule } from './infa/persistence';
import { controllers } from './infa/controllers';
import { CacheModule, MulterModule } from './infa/adapters';

import { HTTPLogger } from 'libs/common';
import { AuthClientModule } from 'libs/auth-client';
import { StorageClientModule } from 'libs/storage-client';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local'],
      load: configs,
      expandVariables: true,
      isGlobal: true,
      cache: true,
    }),
    CqrsModule,
    CacheModule,
    PersistencesModule,
    MulterModule,
    // ===================== GRPC CLIENT MODULES =====================
    AuthClientModule,
    StorageClientModule,
  ],
  controllers,
  providers,
})
export class AppModule implements NestModule {
  constructor() {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
