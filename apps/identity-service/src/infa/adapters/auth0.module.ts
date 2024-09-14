import { Module } from '@nestjs/common';
import { UserInfoClient, ManagementClient } from 'auth0';

@Module({
  providers: [
    {
      provide: UserInfoClient,
      useValue: new UserInfoClient({
        domain: process.env.AUTH0_DOMAIN ?? '',
      }),
    },
    {
      provide: ManagementClient,
      useValue: new ManagementClient({
        domain: process.env.AUTH0_DOMAIN ?? '',
        clientId: process.env.AUTH0_CLIENT_ID ?? '',
        clientSecret: process.env.AUTH0_SECRET ?? '',
      }),
    },
  ],
  exports: [UserInfoClient, ManagementClient],
})
export class Auth0Module {}
