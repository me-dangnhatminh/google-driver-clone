import { GrpcOptions } from '@nestjs/microservices';
import { registerAs } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as glob from 'glob';

const config = registerAs('grpc', () => {
  const includeDir = path.resolve(__dirname, '../../../protos');
  if (!fs.existsSync(includeDir)) {
    throw new Error(`Protos directory not found: ${includeDir}`);
  }

  const protoFiles = glob.sync('**/*.proto', { cwd: includeDir });

  const packageName = 'nest.microservices';
  const loader: GrpcOptions['options']['loader'] = {
    keepCase: false,
    longs: String,
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
    payment: {
      package: packageName,
      protoPath: protoFiles,
      url: '0.0.0.0:50051',
      loader,
    },
  } as const satisfies Record<string, GrpcOptions['options']>;
});

export default config;
