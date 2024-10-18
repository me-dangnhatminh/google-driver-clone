import { GrpcOptions } from '@nestjs/microservices';
import { registerAs } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import { Logger } from '@nestjs/common';

const config = registerAs('grpc', () => {
  const includeDir = path.resolve(__dirname, '../../../protos');
  if (!fs.existsSync(includeDir)) {
    throw new Error(`Protos directory not found: ${includeDir}`);
  }

  const protoFiles = glob.sync('**/*.proto', {
    cwd: includeDir,
    absolute: true,
  });

  Logger.log(`Found proto files: ${JSON.stringify(protoFiles, null, 2)}`);

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
    },
    payment: {
      package: packageName,
      protoPath: protoFiles,
      url: '0.0.0.0:50051',
      loader,
    },
  } as const satisfies Record<string, GrpcOptions['options']>;
});

export default config;
