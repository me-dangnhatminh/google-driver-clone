import { Catch, ExceptionFilter } from '@nestjs/common';
import { AppError, IssueCode } from 'src/common/app-error';
import Stripe from 'stripe';

@Catch(Stripe.errors.StripeError)
export class StripeExceptionFilter
  implements ExceptionFilter<Stripe.errors.StripeError>
{
  catch(error: Stripe.errors.StripeError) {
    const code = error.code;
    if (code === 'product_already_exists') {
      throw new AppError([
        {
          code: IssueCode.conflict,
          message: 'Product already exists',
          path: ['product'],
        },
      ]);
    }
  }
}
