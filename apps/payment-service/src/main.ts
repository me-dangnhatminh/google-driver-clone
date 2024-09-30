declare const module: any;

import { ReflectionService } from '@grpc/reflection';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, Logger, VersioningType } from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';

import setupSwagger from './infa/docs';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Configs } from './config';
import { Server } from 'http';

const buildMicroservice = (app: INestApplication) => {
  const configService = app.get(ConfigService<Configs, true>);
  const grpcConfig = configService.get('grpc.payment', { infer: true });

  const service = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: grpcConfig.url,
      package: grpcConfig.package,
      protoPath: grpcConfig.protoPath,
      loader: grpcConfig.loader,
      credentials: grpc.ServerCredentials.createInsecure(),
      onLoadPackageDefinition: (pkg, server: grpc.Server) => {
        return new ReflectionService(pkg).addToServer(server);
      },
    },
  });
  service.listen().then(() => {
    Logger.log(`gRPC connected: ${grpcConfig.url}`, 'NestMicroservice');
  });
  return service;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });
  app.enableCors({
    origin: (origin, callback) => {
      Logger.warn(`Origin: ${origin}`);
      callback(null, origin);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  setupSwagger(app);

  await app
    .listen(process.env.PORT || 3000, process.env.HOST || 'localhost')
    .then((server: Server) => {
      const address = server.address() as { address: string; port: number };
      Logger.log(
        `Server started on http://${address.address}:${address.port}`,
        'NestApplication',
      );
    });

  buildMicroservice(app);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
