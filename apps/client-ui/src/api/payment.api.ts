import { AxiosRequestConfig } from "axios";
import Api from "./api";
import z from "zod";

const PaymentBillingSessionResponseSchema = z.object({
  data: z.object({
    clientSecret: z.string(),
    expiresAt: z.coerce.date(),
  }),
});

export class PaymentApi extends Api {
  static END_POINT = {
    BASE: "payment",
    CREATE_BILLING_SESSION: "payment/billing/customer-session",
  };

  static createBillingSession = (options?: AxiosRequestConfig) => {
    const url = PaymentApi.END_POINT.CREATE_BILLING_SESSION;
    return Api.get(url, null, options).then(({ data }) => {
      return PaymentBillingSessionResponseSchema.parse(data);
    });
  };
}
