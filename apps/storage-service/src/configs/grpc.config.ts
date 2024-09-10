import { registerAs } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs-extra';

const config = registerAs('grpc', () => {
  const includeDir = path.resolve(__dirname, '../../../../protos');
  if (!fs.existsSync(includeDir)) {
    throw new Error(`Protos directory not found: ${includeDir}`);
  }

  return {
    identity: {
      package: 'identity',
      protoPath: ['identity.proto'],
      url: '0.0.0.0:50051',
    },
    storage: {
      package: 'storage',
      protoPath: ['storage.proto'],
      url: '0.0.0.0:50051',
    },
    loader: {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [includeDir],
    },
  };
});

export default config;
