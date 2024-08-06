import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersistencesModule } from './persistence';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3000 },
      },
    ]),
    PersistencesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
