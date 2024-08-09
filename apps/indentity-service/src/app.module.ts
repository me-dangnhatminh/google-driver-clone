import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HTTPController, TCPController } from './api';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      expandVariables: true,
      isGlobal: true,
    }),
  ],
  controllers: [HTTPController, TCPController],
  providers: [],
})
export class AppModule {}
