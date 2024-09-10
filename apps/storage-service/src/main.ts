import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';

import * as grpc from '@grpc/grpc-js';

import { AppModule } from 'src/app.module';
import { AppConfig, Configs } from './configs';
import setupSwagger from './infa/docs';

const connectGRPC = (app: INestApplication) => {
  const logger = new Logger('bootstrap');
  const configService = app.get(ConfigService<Configs, true>);

  const grpcConfig = configService.get('grpc', { infer: true });

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: grpcConfig.storage.package,
      protoPath: grpcConfig.storage.protoPath,
      loader: grpcConfig.loader,
      onLoadPackageDefinition: (pkg, server: grpc.Server) => {
        server.bindAsync(
          grpcConfig.storage.url,
          grpc.ServerCredentials.createInsecure(),
          (err, port) => {
            if (err) return logger.error(err);
            logger.log(`gRPC listening on ${port}`);
          },
        );

        const reflection = new ReflectionService(pkg);
        return reflection.addToServer(server);
      },
    },
  });
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('bootstrap');

  const configService = app.get(ConfigService<Configs, true>);
  const appConfig = configService.get<AppConfig>('app');

  const doc = setupSwagger(app).docPrefix;

  connectGRPC(app);

  await app.startAllMicroservices();
  await app.listen(appConfig.port, appConfig.host).then(() => {
    const appRunning = `${appConfig.name} is running: `;
    const docRunning = `Documentation is running on ${doc}`;
    const apiRunning = `REST API is running on ${appConfig.host}:${appConfig.port}`;
    const msg = [appRunning, docRunning, apiRunning].join('\n');
    logger.log(msg);
  });
}

bootstrap();
