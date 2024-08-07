import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppService } from './app.service';
import { HTTPLogger } from './middlewares/http-logger.middleware';
import { HTTPController } from './api/http.controller';
import { TCPController } from './api/tcp.controller';

@Module({
  controllers: [HTTPController, TCPController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
