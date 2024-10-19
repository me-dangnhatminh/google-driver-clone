export * from 'auth0';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserInfoClient, ManagementClient } from 'auth0';

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
      useFactory: (configService: ConfigService) => {
        const domain = configService.getOrThrow('AUTH0_DOMAIN');
        return new UserInfoClient({ domain });
      },
    },
    {
      provide: ManagementClient,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const domain = configService.getOrThrow('AUTH0_DOMAIN');
        const clientId = configService.getOrThrow('AUTH0_CLIENT_ID');
        const clientSecret = configService.getOrThrow('AUTH0_CLIENT_SECRET');
        return new ManagementClient({
          domain,
          clientId,
          clientSecret,
        });
      },
    },
  ],
  exports: [UserInfoClient, ManagementClient],
})
export class Auth0Module {}
