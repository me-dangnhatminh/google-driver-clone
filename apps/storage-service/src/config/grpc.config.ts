import { registerAs } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as glob from 'glob';

const config = registerAs('grpc', () => {
  const includeDir = path.resolve(__dirname, '../../../../../protos');
  if (!fs.existsSync(includeDir)) {
    throw new Error(`Protos directory not found: ${includeDir}`);
  }

  const protoFiles = glob.sync('**/*.proto', { cwd: includeDir });
  const packageName = 'nest.microservices';
  const loader = {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [includeDir],
  };

  return {
    identity: {
      package: packageName,
      protoPath: protoFiles,
      url: '0.0.0.0:50051',
      loader,
    },
    storage: {
      package: packageName,
      protoPath: protoFiles,
      url: '0.0.0.0:40051',
      loader,
    },
  };
});

export default config;
