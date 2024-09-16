// import * as common from '@nestjs/common';
// import * as swagger from '@nestjs/swagger';
// import { Response } from 'express';

// import { UUID } from 'src/domain';
// import { CreatePlanDTO, PlanDTO } from 'src/app/dtos';
// import { PaymentService } from 'src/app/services';

// import { AuthRequired } from '../decorators';
// import { useZod } from '../pipes';
// import { CreatePlanOperation, GetPlanByIdOperation } from '../docs';

// @AuthRequired()
// @common.Controller({ path: 'payment', version: '1' })
// @swagger.ApiTags('payment')
// @swagger.ApiBearerAuth()
// export class PaymentRestController {
//   constructor(private readonly paymentService: PaymentService) {}

//   @common.Get('plans')
//   async listPlans() {
//     return await this.paymentService.listPlans();
//   }

//   @common.Post('plans')
//   @swagger.ApiOperation(CreatePlanOperation)
//   async createPlan(
//     @common.Body(useZod(CreatePlanDTO)) dto,
//     @common.Res({ passthrough: true }) res: Response,
//   ) {
//     const plan = await this.paymentService.createPlan(dto);
//     res.setHeader('Location', `${res.req.url}/${plan.id}`);
//     return PlanDTO.parse(plan);
//   }

//   @common.Get('plans/:id')
//   @swagger.ApiOperation(GetPlanByIdOperation)
//   async getPlanById(@common.Param('id', useZod(UUID)) id) {
//     return await this.paymentService.getPlanById(id);
//   }
// }
// // @common.UseGuards(AuthGuard)
// // @common.Get('users')
// // getHello(): string {
// //   return 'Hello World!';
// // }

// // @common.Get('subscribe')
// // subscribe() {
// //   return 'Subscribe';
// // }

// // @common.Get('unsubscribe')
// // unsubscribe() {
// //   return 'Unsubscribe';
// // }

// // @common.Get('invoices')
// // invoices() {
// //   return 'Invoices';
// // }

// // @common.Get('invoices/:id')
// // invoiceById() {
// //   return 'Invoice by ID';
// // }

// // @common.Get('subscriptions')
// // subscriptions() {
// //   return 'Subscriptions';
// // }

// // @common.Get('subscriptions/:id')
// // subscriptionById() {
// //   return 'Subscription by ID';
// // }

// // @common.Get('subscriptions/:id/invoices')
// // subscriptionInvoices() {
// //   return 'Subscription invoices';
// // }

// // @common.Get('subscriptions/:id/invoices/:invoiceId')
// // subscriptionInvoiceById() {
// //   return 'Subscription invoice by ID';
// // }

// // @common.Get('subscriptions/:id/usage')
// // subscriptionUsage() {
// //   return 'Subscription usage';
// // }

// // @common.Get('subscriptions/:id/usage/:usageId')
// // subscriptionUsageById() {
// //   return 'Subscription usage by ID';
// // }

// // @common.Get('subscriptions/:id/usage/:usageId/invoices')
// // subscriptionUsageInvoices() {
// //   return 'Subscription usage invoices';
// // }
