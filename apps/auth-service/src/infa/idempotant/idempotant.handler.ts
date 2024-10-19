import { Injectable } from '@nestjs/common';
import { IdempotentService } from './idempotant.service';

@Injectable()
export class IdempotentHandler {
  constructor(private readonly idempotentService: IdempotentService) {}

  async handle(): Promise<any> {}
}
