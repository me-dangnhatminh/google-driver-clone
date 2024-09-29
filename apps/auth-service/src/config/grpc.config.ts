import { registerAs } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import { GrpcOptions } from '@nestjs/microservices';

const config = registerAs('grpc', () => {
  const includeDir = path.resolve(__dirname, '../../../protos');
  if (!fs.existsSync(includeDir)) {
    throw new Error(`Protos directory not found: ${includeDir}`);
  }

  const protoFiles = glob.sync('**/*.proto', { cwd: includeDir });

  const packageName = 'nest.microservices';
  const loader: GrpcOptions['options']['loader'] = {
    keepCase: true,
    longs: String,
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
        hello: 'world',
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
  } as const satisfies Record<string, GrpcOptions['options']>;
});

export default config;
