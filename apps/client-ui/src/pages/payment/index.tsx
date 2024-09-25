import { useEffect, useState } from "react";
import StripePricingTable from "./stripe-pricing-table";
import { PaymentApi } from "@api";
import { useAuth0 } from "@auth0/auth0-react";

const env = import.meta.env;

const Header = () => {
  return (
    <header className="w-full h-16 bg-gray-800 flex items-center justify-center">
      <h1 className="text-2xl text-white">Billing</h1>
    </header>
  );
};

export default function Payment() {
  const { isAuthenticated: isAuth } = useAuth0();

  const [customerSession, setCustomerSession] = useState<string>();

  useEffect(() => {
    if (!isAuth) return;

    let expiresAt: Date;
    PaymentApi.createBillingSession().then(({ data }) => {
      setCustomerSession(data.clientSecret);
      expiresAt = data.expiresAt;

      setTimeout(() => {
        setCustomerSession(undefined);
      }, expiresAt.getTime() - new Date().getTime());
    });

    return () => {
      setCustomerSession(undefined);
    };
  }, [isAuth]);

  if (!isAuth) return null;
  if (!customerSession) return null;

  console.log(customerSession);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <Header />
      <div className="flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-500 mt-2">Downgrade or upgrade at any time.</p>
        <p className="text-gray-500">No contracts, cancel anytime.</p>
        <div className="w-full flex flex-col items-center justify-center bg-gray-100 p-2 space-y-2 rounded-md border-1">
          <p className="text-xl font-bold">Free</p>
          <ol className="w-full text-left">
            <li>2GB of storage</li>
          </ol>
        </div>
      </div>
      <div>
        <p>Credit Card: 4242 4242 4242 4242</p>
        <>Exp: any future date</>
        <p>CVV: any 3 digits</p>
        <a
          href="https://stripe.com/docs/testing#international-cards"
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:underline"
        >
          Test card numbers
        </a>
      </div>

      <div className="w-full h-full mt-4 xl:mt-16">
        <StripePricingTable
          pricingTableId={env.VITE_STRIPE_PRICING_TABLE_ID}
          publishableKey={env.VITE_STRIPE_PUBLISHABLE_KEY}
          customerSessionClientSecret={customerSession}
        />
      </div>
    </div>
  );
}
