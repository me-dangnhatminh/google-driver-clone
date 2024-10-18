import { ConfigType, registerAs } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import { GrpcOptions } from '@nestjs/microservices';

const grpcConfig = registerAs('grpc', () => {
  const protosDir = process.env.PROTOS_DIR || 'protos';
  const includeDir = path.resolve(__dirname, '..', protosDir);
  if (!fs.existsSync(includeDir)) {
    throw new Error(`Protos directory not found: ${includeDir}`);
  }

  const protoFiles = glob.sync('**/*.proto', { cwd: includeDir });

  const packageName = 'nest.microservices';
  const loader: GrpcOptions['options']['loader'] = {
    keepCase: true,
    longs: Number,
    enums: String,
    defaults: false,
    oneofs: false,
    arrays: true,
    json: true,
    includeDirs: [includeDir],
  };

  return {
    auth: {
      package: packageName,
      protoPath: protoFiles,
      url: '0.0.0.0:30051',
      loader,
    },
    storage: {
      package: packageName,
      protoPath: protoFiles,
      url: '0.0.0.0:40051',
      loader,
    },
    payment: {
      package: packageName,
      protoPath: protoFiles,
      url: '0.0.0.0:50051',
      loader,
    },
  } satisfies Record<string, GrpcOptions['options']>;
});

export type GrpcConfig = ConfigType<typeof grpcConfig>;
export default grpcConfig;
