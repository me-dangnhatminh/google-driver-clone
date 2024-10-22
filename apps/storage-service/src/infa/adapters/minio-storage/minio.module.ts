import * as Minio from 'minio';
import { Module } from '@nestjs/common';
import { ConfigService } from 'src/config';

@Module({
  providers: [
    {
      provide: Minio.Client,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const key = 'services.minio';
        const minioConfig = configService.infer(key);
        return new Minio.Client(minioConfig);
      },
    },
  ],
  exports: [Minio.Client],
})
export class MinioModule {}
export default MinioModule;
