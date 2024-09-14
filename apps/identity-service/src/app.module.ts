import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

import { HTTPLogger } from 'lib/common';

import { controllers, Auth0Module, CacheModule } from 'src/infa';
import configs from 'src/config';
import { AuthClientModule } from 'lib/auth-client';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local'],
      load: configs,
      expandVariables: true,
      isGlobal: true,
      cache: true,
    }),
    TerminusModule,
    HttpModule,
    CacheModule,
    Auth0Module,
    AuthClientModule,
  ],
  controllers,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
