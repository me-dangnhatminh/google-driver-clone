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

  const retryPolicy = {
    maxAttempts: 4,
    initialBackoff: '0.1s',
    maxBackoff: '1s',
    backoffMultiplier: 2,
    retryableStatusCodes: ['UNAVAILABLE'],
  };

  return {
    auth: {
      package: packageName,
      protoPath: protoFiles,
      url: '0.0.0.0:30051',
      loader,
      channelOptions: {
        retryPolicy,
      },
    },
    storage: {
      package: packageName,
      protoPath: protoFiles,
      url: '0.0.0.0:40051',
      loader,
      channelOptions: {
        retryPolicy,
      },
    },
  } satisfies Record<string, GrpcOptions['options']>;
});

export type GrpcConfig = ConfigType<typeof grpcConfig>;
export default grpcConfig;
