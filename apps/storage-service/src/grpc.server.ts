import { INestApplication, Logger } from '@nestjs/common';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import * as grpc from '@grpc/grpc-js';

import { ConfigService } from './config';

export const buildGrpcServer = async (app: INestApplication) => {
  const configService = app.get(ConfigService);

  const grpcConfig = configService.infer('grpc.storage');

  const service = app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      ...grpcConfig,
      credentials: grpc.ServerCredentials.createInsecure(),
      onLoadPackageDefinition: (pkg, server: grpc.Server) => {
        new ReflectionService(pkg).addToServer(server);
      },
    },
  });
  return service.listen().then(() => {
    Logger.log(
      `gRPC server is running on: ${grpcConfig.url}`,
      'NestMicroservice',
    );
  });
};

export default buildGrpcServer;
