import { registerAs } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import { GrpcOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

const config = registerAs('grpc', () => {
  const logger = new Logger('grpc.config');
  const includeDir = path.resolve(__dirname, '../../../protos');
  if (!fs.existsSync(includeDir)) {
    throw new Error(`Protos directory not found: ${includeDir}`);
  }

  const protoFiles = glob.sync('**/*.proto', {
    cwd: includeDir,
    absolute: true,
  });

  logger.log(`Found proto files: ${JSON.stringify(protoFiles, null, 2)}`);

  const packageName = 'nest.microservices';
  const loader: GrpcOptions['options']['loader'] = {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: false,
    oneofs: false,
    arrays: true,
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
      channelOptions: { retryPolicy },
    },
    storage: {
      package: packageName,
      protoPath: protoFiles,
      url: '0.0.0.0:40051',
      loader,
      channelOptions: { retryPolicy },
    },
    payment: {
      package: packageName,
      protoPath: protoFiles,
      url: '0.0.0.0:50051',
      loader,
      channelOptions: { retryPolicy },
    },
  } as const satisfies Record<string, GrpcOptions['options']>;
});

export default config;
