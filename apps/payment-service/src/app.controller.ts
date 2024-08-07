import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@Controller({ path: 'payment', version: '1' })
@ApiTags('payment')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('users')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('checkout')
  checkout(): string {
    return 'Checkout';
  }
}

// Idempotent: used to describe actions that can be performed multiple times without changing the result beyond the initial application.
