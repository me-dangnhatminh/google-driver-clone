import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PersistencesModule } from './persistence';
import { RabbitCQRSModule } from './adapters';

import { TCPController } from './controllers/tcp.controller';
import { HTTPController } from './controllers/http.controller';

@Module({
  imports: [RabbitCQRSModule, PersistencesModule],
  controllers: [TCPController, HTTPController],
  providers: [AppService],
})
export class AppModule {}
