import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { expressJwtSecret } from 'jwks-rsa';
import { promisify } from 'util';
import { expressjwt as jwt } from 'express-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthorizedGuard implements CanActivate {
  private readonly AUTH0_AUDIENCE: string;
  private readonly AUTH0_DOMAIN: string;

  constructor(private readonly configService: ConfigService<any, true>) {
    this.AUTH0_AUDIENCE = this.configService.get<string>('AUTH0_AUDIENCE');
    this.AUTH0_DOMAIN = this.configService.get<string>('AUTH0_DOMAIN');
    if (!this.AUTH0_AUDIENCE || !this.AUTH0_DOMAIN) {
      throw new Error('Auth0 audience and domain must be provided');
    }
  }

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const checkJwt = promisify(
      jwt({
        secret: expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `https://${this.AUTH0_DOMAIN}/.well-known/jwks.json`,
        }) as any,
        audience: this.AUTH0_AUDIENCE,
        issuer: `https://${this.AUTH0_DOMAIN}/`,
        algorithms: ['RS256'],
      }),
    );

    try {
      await checkJwt(req, res);
      return true;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
