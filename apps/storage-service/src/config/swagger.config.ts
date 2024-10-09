import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  enabled: Boolean(process.env.SWAGGER_ENABLED || true),
  title: process.env.SWAGGER_TITLE || 'NestJS API',
  description: process.env.SWAGGER_DESCRIPTION || 'API Documentation',
  prefix: process.env.SWAGGER_PREFIX || 'docs',
  version: process.env.SWAGGER_VERSION || '1.0',
  gateway: process.env.SWAGGER_GATEWAY || 'http://localhost',
}));
