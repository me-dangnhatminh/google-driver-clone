import { Module } from '@nestjs/common';
import { TCPController } from './tcp.controller';
import { AppService } from './app.service';
import { PersistencesModule } from './persistence';

@Module({
  imports: [PersistencesModule],
  controllers: [TCPController],
  providers: [AppService],
})
export class AppModule {}
