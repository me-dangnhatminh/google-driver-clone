/* eslint-disable @typescript-eslint/ban-types */
import { DynamicModule, Module } from '@nestjs/common';
import { UserInfoClient, ManagementClient } from 'auth0';

@Module({})
export class Auth0Module {
  static forRoot(options: {
    domain: string;
    clientId: string;
    clientSecret: string;
  }): DynamicModule {
    return {
      module: Auth0Module,
      providers: [
        { provide: UserInfoClient, useValue: new UserInfoClient(options) },
        {
          provide: ManagementClient,
          useValue: new ManagementClient(options),
        },
      ],
      exports: [UserInfoClient, ManagementClient],
    };
  }
}

export * from './auth0.module';
