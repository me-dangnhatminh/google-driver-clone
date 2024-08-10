import { Module } from '@nestjs/common';
import { TCPController } from './tcp.controller';
import { AppService } from './app.service';
import { PersistencesModule } from './persistence';
import { RabbitCQRSModule } from './adapters';
import { HTTPController } from './http.controller';

@Module({
  imports: [RabbitCQRSModule, PersistencesModule],
  controllers: [TCPController, HTTPController],
  providers: [AppService],
})
export class AppModule {}
