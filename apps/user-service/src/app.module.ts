import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HTTPLogger } from './middlewares/http-logger.middleware';
import { HTTPController } from './api/http.controller';
import { TCPController } from './api/tcp.controller';
import { UserService } from './services/user.service';

@Module({
  controllers: [HTTPController, TCPController],
  providers: [UserService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
