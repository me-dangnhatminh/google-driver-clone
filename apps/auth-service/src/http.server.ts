import { Server } from 'http';
import { Logger, VersioningType } from '@nestjs/common';
import buildSwagger from './infa/docs';
import { NestExpressApplication } from '@nestjs/platform-express';

export const buildHttpServer = async (app: NestExpressApplication) => {
  // ----- http server -----
  app.disable('x-powered-by');
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });
  buildSwagger(app);
  await app
    .listen(process.env.PORT || 3000, process.env.HOST || 'localhost')
    .then((server: Server) => {
      const url = server.address() as { address: string; port: number };
      Logger.log(
        `Server is running on: ${url.address}:${url.port}`,
        'NestApplication',
      );
    });
};
export default buildHttpServer;
