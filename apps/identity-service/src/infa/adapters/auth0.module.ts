/* eslint-disable @typescript-eslint/ban-types */
import { DynamicModule, Module } from '@nestjs/common';
import { UserInfoClient } from 'auth0';

@Module({})
export class Auth0Module {
  static forRoot(options: {
    domain: string;
    clientId?: string;
    clientSecret?: string;
  }): DynamicModule {
    return {
      module: Auth0Module,
      providers: [
        { provide: UserInfoClient, useValue: new UserInfoClient(options) },
      ],
      exports: [UserInfoClient],
    };
  }
}

export * from './auth0.module';
