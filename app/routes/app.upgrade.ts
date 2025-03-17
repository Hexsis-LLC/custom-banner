import { authenticate } from "../shopify.server";
import { LoaderFunctionArgs } from "@remix-run/node";

// Define plan configurations
const PLANS = {
  free: {
    name: "Free Plan",
    amount: 0,
    interval: "EVERY_30_DAYS"
  },
  pro_monthly: {
    name: "Pro Monthly Plan",
    amount: 10,
    interval: "EVERY_30_DAYS"
  },
  pro_annual: {
    name: "Pro Annual Plan",
    amount: 100,
    interval: "ANNUAL"
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session, redirect } = await authenticate.admin(request);
  let { shop } = session;
  let myShop = shop.replace(".myshopify.com", "");

  // Get plan from URL query parameters
  const url = new URL(request.url);
  const planType = url.searchParams.get("plan") || "pro_monthly";

  // Get plan configuration or default to pro_monthly
  const plan = PLANS[planType as keyof typeof PLANS] || PLANS.pro_monthly;

  try {
    // Use GraphQL directly to create a subscription
    const response = await admin.graphql(
      `#graphql
      mutation AppSubscriptionCreate($name: String!, $returnUrl: URL!, $test: Boolean!, $amount: Decimal!, $interval: AppPricingInterval!) {
        appSubscriptionCreate(
          name: $name
          returnUrl: $returnUrl
          test: $test
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                  price: { amount: $amount, currencyCode: USD }
                  interval: $interval
                }
              }
            }
          ]
        ) {
          confirmationUrl
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          name: plan.name,
          returnUrl: `https://admin.shopify.com/store/${myShop}/apps/hexstore/app/pricing`,
          test: true,
          amount: plan.amount,
          interval: plan.interval
        },
      }
    );

    // If we get here, the request was successful
    const responseJson = await response.json();

    // Check for errors
    if (responseJson.data?.appSubscriptionCreate?.userErrors?.length > 0) {
      console.error("GraphQL errors:", responseJson.data.appSubscriptionCreate.userErrors);
      return redirect("/app/pricing?error=subscription_creation_failed");
    }

    // Get the confirmation URL and redirect to it
    const confirmationUrl = responseJson.data?.appSubscriptionCreate?.confirmationUrl;
    if (!confirmationUrl) {
      console.error("No confirmation URL returned");
      return redirect("/app/pricing?error=no_confirmation_url");
    }

    // Redirect to the Shopify payment confirmation URL
    return redirect(confirmationUrl, { target: "_parent" });
  } catch (error) {
    console.error("Error creating subscription:", error);

    // Check if the error is a Response object with a 401 status
    if (error instanceof Response && error.status === 401) {
      // Extract the reauthorize URL from the headers
      const reauthorizeUrl = error.headers.get('X-Shopify-API-Request-Failure-Reauthorize-Url');

      if (reauthorizeUrl) {
        console.log("Redirecting to reauthorize URL:", reauthorizeUrl);
        // Redirect to the reauthorize URL
        return redirect(reauthorizeUrl, { target: "_parent" });
      }
    }

    // If we couldn't extract a reauthorize URL, redirect to the pricing page with an error
    return redirect("/app/pricing?error=subscription_error");
  }
};
