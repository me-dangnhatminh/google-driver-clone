/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';

@Injectable()
export class IdempotentService {
  // private readonly redisService: RedisService,
  // private readonly queueService: QueueService,
  constructor() {}

  async check(key: string): Promise<boolean> {
    // Check if the key exists in the database
    return true;
  }

  async set(key: string): Promise<void> {
    // Store the key in the database
  }

  async delete(key: string): Promise<void> {
    // Delete the key from the database
  }
}

// CheckoutConsumer must cluster kafka messages
// in this, check: 'non-retryable' and 'retryable'
// listen: "payment.created" or "payment.updated"
// listen: "payment.succeeded", "payment.failed", "payment.canceled", "payment.retry"
// if "payment.succeeded" call noification service
// if "payment.failed" call noification service
// if "payment.canceled" call noification service
// if "payment.retry" call checkout retry consumer (3 times) or "payment.canceled"
