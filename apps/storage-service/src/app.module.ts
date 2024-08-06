import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersistencesModule } from './persistence';

@Module({
  imports: [PersistencesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
