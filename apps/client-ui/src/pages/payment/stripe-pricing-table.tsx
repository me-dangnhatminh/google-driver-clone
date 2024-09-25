import React, { useEffect } from "react";
const StripePricingTable = (props: {
  className?: string;
  pricingTableId: string;
  publishableKey: string;
  customerSessionClientSecret?: string;
}) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  // FIXME: Add the correct props
  return React.createElement("stripe-pricing-table", {
    "pricing-table-id": props.pricingTableId,
    "publishable-key": props.publishableKey,
    "customer-session-client-secret": props.customerSessionClientSecret,
  });
};
export default StripePricingTable;
