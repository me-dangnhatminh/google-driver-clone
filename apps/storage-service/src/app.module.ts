import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { services } from './app';

import { RabbitCQRSModule } from './infa/adapters';
import { PersistencesModule } from './infa/persistence';
import { controllers } from './infa/controllers';
import { HTTPLogger } from './infa/middlewares';

@Module({
  imports: [PersistencesModule, RabbitCQRSModule],
  controllers,
  providers: [...services],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
