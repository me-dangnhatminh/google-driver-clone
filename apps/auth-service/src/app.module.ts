import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

import { ConfigModule } from './config';
import { HTTPLogger } from 'libs/common';
import { AuthClientModule } from 'libs/auth-client';
import { controllers, Auth0Module, CacheModule } from 'src/infa';

@Module({
  imports: [
    ConfigModule,
    CacheModule,
    Auth0Module,
    AuthClientModule,

    // for health check
    HttpModule,
    TerminusModule,
  ],
  controllers,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
export default AppModule;
