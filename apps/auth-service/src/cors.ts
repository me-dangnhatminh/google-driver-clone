import { INestApplication, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configs } from './config';

export const buildCors = (app: INestApplication) => {
  const configService = app.get(ConfigService<Configs, true>);
  const corsConfig = configService.get('cors', { infer: true });

  if (corsConfig.enabled) {
    const originMap: Set<string> = new Set<string>();
    corsConfig.origin
      .split(',')
      .map((origin) => origin.trim())
      .forEach(originMap.add, originMap);

    app.enableCors({
      origin: (origin, callback) => {
        const allowed = corsConfig.origin === '*' || originMap.has(origin);
        if (allowed) return callback(null, origin);
        return callback(new ForbiddenException('Not allowed by CORS'));
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  }
};

export default buildCors;
