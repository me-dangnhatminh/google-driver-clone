import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserInfoClient, ManagementClient } from 'auth0';

@Module({
  providers: [
    {
      provide: UserInfoClient,
      inject: [ConfigService],
      useFactory: () => {
        return new UserInfoClient({ domain: process.env.AUTH0_DOMAIN ?? '' });
      },
    },
    {
      provide: ManagementClient,
      inject: [ConfigService],
      useFactory: () => {
        return new ManagementClient({
          domain: process.env.AUTH0_DOMAIN ?? '',
          clientId: process.env.AUTH0_CLIENT_ID ?? '',
          clientSecret: process.env.AUTH0_CLIENT_SECRET ?? '',
        });
      },
    },
  ],
  exports: [UserInfoClient, ManagementClient],
})
export class Auth0Module {}
