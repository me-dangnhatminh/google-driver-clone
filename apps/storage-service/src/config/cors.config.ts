import { registerAs } from '@nestjs/config';

export default registerAs('cors', () => ({
  enabled: process.env.CORS_ENABLED || true,
  origin: process.env.CORS_ORIGIN || '*',
}));
