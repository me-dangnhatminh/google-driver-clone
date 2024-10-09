import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

import { ConfigModule } from './config';
import { AuthClientModule } from 'libs/auth-client';
import { controllers, Auth0Module, CacheModule, LoggerModule } from 'src/infa';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    CacheModule,
    Auth0Module,
    AuthClientModule,

    // for health check
    HttpModule,
    TerminusModule,
  ],
  controllers,
})
export class AppModule {}
export default AppModule;
