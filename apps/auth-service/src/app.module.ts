import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

import { ConfigModule } from './config';
import { AuthClientModule } from '@app/auth-client';
import {
  controllers,
  Auth0Module,
  CacheModule,
  LoggerModule,
  IdempotentModule,
} from 'src/infa';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    CacheModule,
    IdempotentModule,
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
