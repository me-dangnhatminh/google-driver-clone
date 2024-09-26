import { registerAs } from '@nestjs/config';

const stripeConfig = registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY,
  publicKey: process.env.STRIPE_PUBLIC_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  successUrl: process.env.STRIPE_SUCCESS_URL,
  cancelUrl: process.env.STRIPE_CANCEL_URL,
  product: {
    free: 'prod_QunWlpxOwTEByc',
    basic: 'prod_QuYysnLE9SOf6J',
    standard: 'prod_QuYz0Z3Z2Z2Z2Z',
    premium: 'prod_QuYz1Z3Z2Z2Z2Z',
  },
}));

export default stripeConfig;
