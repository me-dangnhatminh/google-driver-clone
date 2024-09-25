import { ReflectionService } from '@grpc/reflection';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, Logger, VersioningType } from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';

import setupSwagger from './infa/docs';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Configs } from './config';

const connectGRPC = async (app: INestApplication) => {
  const logger = new Logger('bootstrap');
  const configService = app.get(ConfigService<Configs, true>);

  const grpcConfig = configService.get('grpc.payment', { infer: true });
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        url: grpcConfig.url,
        package: grpcConfig.package,
        protoPath: grpcConfig.protoPath,
        loader: grpcConfig.loader,
        credentials: grpc.ServerCredentials.createInsecure(),
        onLoadPackageDefinition: (pkg, server: grpc.Server) => {
          const reflection = new ReflectionService(pkg);
          return reflection.addToServer(server);
        },
      },
    },
    { inheritAppConfig: true },
  );
  logger.log(`gRPC connected: ${grpcConfig.url}`);
  await app.startAllMicroservices();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const logger = new Logger('bootstrap');

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  setupSwagger(app);

  const host = '0.0.0.0';
  const port = 5000;
  const appName = 'Payment Service';

  await connectGRPC(app);
  await app.listen(port, host);
  logger.log(`${appName} started at http://${host}:${port}`);
}
bootstrap();
