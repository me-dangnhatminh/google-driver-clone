import { Server } from 'http';
import { Logger, VersioningType } from '@nestjs/common';
import buildSwagger from './infa/docs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from './config';

export const buildHttpServer = async (app: NestExpressApplication) => {
  const configService = app.get(ConfigService);
  const appConfig = configService.infer('app');

  // ----- http server -----
  app.disable('x-powered-by');
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });
  buildSwagger(app);
  await app.listen(appConfig.port, appConfig.host).then((server: Server) => {
    const url = server.address() as { address: string; port: number };
    Logger.log(
      `Server is running on: ${url.address}:${url.port}`,
      'HttpServer',
    );
  });
};
export default buildHttpServer;
