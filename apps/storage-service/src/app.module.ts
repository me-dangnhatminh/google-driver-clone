import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import configs from './configs';
import providers from './app';

import { RabbitCQRSModule } from './infa/adapters';
import { PersistencesModule } from './infa/persistence';
import { controllers } from './infa/controllers';
import { HTTPLogger } from './infa/middlewares';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
    PersistencesModule,
    RabbitCQRSModule,
  ],
  controllers,
  providers,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
