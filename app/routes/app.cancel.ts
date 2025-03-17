import {LoaderFunctionArgs, redirect} from "@remix-run/node";
import {authenticate, PRO_MONTHLY_PLAN, PRO_YEARLY_PLAN} from "../shopify.server";


export const loader =  async ({ request }: LoaderFunctionArgs) => {
  const { billing } = await authenticate.admin(request);
  const url = new URL(request.url);
  const planType = url.searchParams.get("newPlan") || "pro_monthly";
  const billingCheck = await billing.require({
    plans: [PRO_MONTHLY_PLAN,PRO_YEARLY_PLAN] as never[],
    onFailure: async () => billing.request({ plan: PRO_MONTHLY_PLAN as never }),
  });

  const subscription = billingCheck.appSubscriptions[0];
  await billing.cancel({
    subscriptionId: subscription.id,
    isTest: true,
    prorate: true,
  });
// App logic
  return redirect("/app/pricing");
};
