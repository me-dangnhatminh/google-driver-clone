import {
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import {
  HTTPLogger,
  ResponseInterceptor,
  HttpExceptionFilter,
} from 'lib/common';

import { AuthClientModule } from 'lib/auth-client';

import config from 'src/config';
import { CacheModule, StripeModule } from 'src/infa/apdaters';
import { PersistencesModule } from 'src/infa/persistence';
import { controllers } from 'src/infa/controllers';
import { services } from 'src/app/services';

const providers: Provider[] = [];
providers.push(
  { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  { provide: APP_FILTER, useClass: HttpExceptionFilter },
);

providers.push(...services);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      expandVariables: true,
      load: config,
    }),
    CacheModule,
    PersistencesModule,
    StripeModule,

    AuthClientModule,
  ],
  controllers,
  providers,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
