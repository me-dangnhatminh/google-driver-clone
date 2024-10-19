import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule } from './config';
import { AuthClientModule } from '@app/auth-client';
import {
  controllers,
  Auth0Module,
  CacheModule,
  LoggerModule,
  IdempotentModule,
} from 'src/infa';
import services from './app';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    CacheModule,
    JwtModule.register({}),
    IdempotentModule.forRoot(),

    Auth0Module,
    AuthClientModule,
    // for health check
    HttpModule,
    TerminusModule,
  ],
  providers: [...services],
  controllers,
})
export class AppModule {}
export default AppModule;
