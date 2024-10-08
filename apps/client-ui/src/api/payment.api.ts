import { AxiosRequestConfig } from "axios";
import Api from "./api";
import z from "zod";

const PaymentBillingSessionResponseSchema = z.object({
  clientSecret: z.string(),
  expiresAt: z.coerce.date(),
});

const CustomerBilligPortalResponse = z.object({
  id: z.string(),
  url: z.string(),
});
type CustomerBilligPortalResponse = z.infer<
  typeof CustomerBilligPortalResponse
>;

export class PaymentApi extends Api {
  static END_POINT = {
    BASE: "payment",
    CREATE_BILLING_SESSION: "payment/billing/customer-session",
    CUSTOMER_BILLING_PORTAL: "payment/customer/billing-portal",
  };

  static createBillingSession = (options?: AxiosRequestConfig) => {
    const url = PaymentApi.END_POINT.CREATE_BILLING_SESSION;
    return Api.get(url, null, options).then(({ data }) => {
      // TODO: fix
      return {
        clientSecret: "",
        expiresAt: new Date(),
      };
    });
  };

  static getCustomerBillingPortal = (
    req?: { return_url: string },
    options?: AxiosRequestConfig
  ) => {
    const url = PaymentApi.END_POINT.CUSTOMER_BILLING_PORTAL;
    return Api.get(url, req, options)
      .then(({ data }) => data)
      .then((data) => {
        // TODO: fix
        return { id: "", url: "" };
      });
  };
}
