import { Module } from '@nestjs/common';
import { IdempotentHandler } from './idempotant.handler';
import { IdempotentService } from './idempotant.service';

@Module({})
export class IdempotentModule {
  static forRoot() {
    return {
      module: IdempotentModule,
      providers: [IdempotentService, IdempotentHandler],
      exports: [IdempotentService, IdempotentHandler],
    };
  }
}

export default IdempotentModule;
