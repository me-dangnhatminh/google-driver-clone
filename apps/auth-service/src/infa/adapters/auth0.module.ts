export * from 'auth0';
import { Module } from '@nestjs/common';
import { UserInfoClient, ManagementClient } from 'auth0';

import { ConfigService } from '@nestjs/config';

export const wwwAuthToJson = (wwwAuth: string) => {
  const parts = wwwAuth.split(',');
  const detail: any = {};
  parts.forEach((part) => {
    const [key, value] = part.split('=');
    detail[key.trim()] = value.replace(/"/g, '');
  });
  return detail;
};

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
