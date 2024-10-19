import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { AuthService } from 'src/app';

const SERVICE_NAME = 'AuthService';
@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod(SERVICE_NAME, 'ping')
  ping() {
    return { message: 'pong' };
  }

  @GrpcMethod(SERVICE_NAME, 'verify')
  async verifyToken(request) {
    const value = await this.authService.verify(request);
    return value;
  }

  @GrpcMethod(SERVICE_NAME, 'validate')
  async validate(request) {
    const value = await this.authService.validate(request);
    return value;
  }
}

// try {
//   const result = await this.userInfo
//     .getUserInfo(request.token)
//     .then(({ data }) => data)
//     .then((user) => ({
//       ...user,
//       id: user.sub,
//       roles: user.roles ?? [],
//       permissions: user.permissions ?? [],
//       metadata: Object.assign({}, user.custom_metadata),
//     }))
//     .then((u) => UserSchema.parse(u));
//   return result;
//   return await this.handleIdempotency(result, metadata);
// } catch (error) {
//   if (error instanceof ResponseError) {
//     const status = error.statusCode;
//     if (status === 401) {
//       const headers = error.headers;
//       const wwwAuth = headers.get('www-authenticate');
//       if (!wwwAuth) throw new Error('www-authenticate header not found');
//       const detail = wwwAuthToJson(wwwAuth);
//       throw new RpcException(`Unauthorized: ${detail.error_description}`);
//     }
//     throw new RpcException(error.message);
//   }
//   if (error instanceof Error) {
//     throw new RpcException(`Error: ${error.message}`);
//   }
//   throw error;
// }

// private async handleIdempotency<T>(value: T, metadata: Metadata): Promise<T> {
//   const idempotencyKey = metadata.get('idempotency-key')[0] ?? null;
//   const idempotencyTtl = metadata.get('idempotency-ttl')[0] ?? null;
//   if (!idempotencyKey) return value;
//   const ok = await this.idempotentService.set(
//     String(idempotencyKey),
//     JSON.stringify(value),
//     'PX',
//     Number(idempotencyTtl ?? 24 * 60 * 60 * 1000),
//     'NX',
//   );
//   if (ok !== 'OK') {
//     throw new RpcException(`Duplicate request with key: ${idempotencyKey}`);
//   }
//   return value;
// }
