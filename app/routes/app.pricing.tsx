import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  Page,
  BlockStack,
  InlineStack,
  Box,
  Text,
  Button,
  ButtonGroup,
  Divider,
} from "@shopify/polaris";
import { useState, useEffect } from "react";

// Server-side imports (only used in loader)
import { authenticate, FREE_PLAN, PRO_MONTHLY_PLAN, PRO_YEARLY_PLAN } from "../shopify.server";

// Define plan types
export type PlanType = "PRO_MONTHLY_PLAN" | "PRO_YEARLY_PLAN" | "FREE_PLAN";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { billing } = await authenticate.admin(request);
  // Attempt to check if the shop has an active payment for any plan
  try {
    // Make sure we're checking for both plan types, including the correct name for the yearly plan
    const result : string[] = [PRO_MONTHLY_PLAN, PRO_YEARLY_PLAN, "Pro Annual Plan"];
    const billingCheck = await billing.require({
      plans: result as never[],
      isTest: true,
      // Instead of redirecting on failure, just catch the error
      onFailure: async (e) => {
        return new Response(e, { status: 200 });
      },
    });
    console.log("billingCheck", billingCheck);
    // If the shop has an active subscription, log and return the details
    const subscription = billingCheck?.appSubscriptions[0];
    console.log("subscription", subscription);
    if (subscription) {
      // Check for both Pro Monthly Plan and Pro Annual Plan
      const isPro = subscription?.name === PRO_MONTHLY_PLAN || 
                    subscription?.name === PRO_YEARLY_PLAN || 
                    subscription?.name === "Pro Annual Plan";
      
      return json({
        billing,
        plan: subscription,
        isPro,
        currentPlan: subscription?.name || FREE_PLAN,
        planConstants: {
          FREE_PLAN,
          PRO_MONTHLY_PLAN,
          PRO_YEARLY_PLAN
        }
      });
    }
  } catch (error: any) {
    console.log("error", error);
    return json({
      billing,
      plan: { name: FREE_PLAN },
      isPro: false,
      currentPlan: FREE_PLAN,
      planConstants: {
        FREE_PLAN,
        PRO_MONTHLY_PLAN,
        PRO_YEARLY_PLAN
      }
    });
  }

  return json({
    billing,
    plan: { name: FREE_PLAN },
    isPro: false,
    currentPlan: FREE_PLAN,
    planConstants: {
      FREE_PLAN,
      PRO_MONTHLY_PLAN,
      PRO_YEARLY_PLAN
    }
  });
};

// Client component - no server imports
export default function PricingPage() {
  const { isPro, currentPlan, planConstants } = useLoaderData<typeof loader>();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Log billing cycle changes
  useEffect(() => {
    console.log("Billing cycle changed to:", billingCycle);
    console.log("Billing cycle changed to:", currentPlan);
  }, [billingCycle]);

  // Define plan details
  const PLANS = {
    FREE_PLAN: {
      name: "Free Plan",
      price: "Free",
      priceTag: "*No card required",
      billingCycle: "monthly",
      features: [
        "Something",
        "Something",
        "Something",
        "Something",
        "Something",
      ],
    },
    PRO_MONTHLY_PLAN: {
      name: "Pro Plan",
      price: "$9.99",
      priceTag: "",
      billingCycle: "monthly",
      features: [
        "Something",
        "Something",
        "Something",
        "Something",
        "Something",
      ],
    },
    PRO_YEARLY_PLAN: {
      name: "Pro Plan",
      price: "$99.99",
      priceTag: "*15% off on Yearly Package",
      billingCycle: "yearly",
      features: [
        "Something",
        "Something",
        "Something",
        "Something",
        "Something",
      ],
    },
  };

  const isOnFreePlan = !isPro;
  const isOnProPlan = isPro;

  // Calculate the upgrade URL based on the billing cycle
  const upgradeUrl = `/app/upgrade?plan=${billingCycle === "monthly" ? "pro_monthly" : "pro_annual"}`;

  // Custom styles for the card shadow
  const cardStyle = {
    boxShadow: "0px 1px 0px 0px rgba(26, 26, 26, 0.07), inset 0px 1px 0px 0px rgba(204, 204, 204, 0.5), inset 0px -1px 0px 0px rgba(0, 0, 0, 0.17), inset -1px 0px 0px 0px rgba(0, 0, 0, 0.13), inset 1px 0px 0px 0px rgba(0, 0, 0, 0.13)"
  };

  return (
    <Page
      title="Pricing"
    >
      <BlockStack gap="500">
        <InlineStack gap="500" blockAlign="start" wrap={false}>
          {/* Free Plan Card */}
          <Box
              background="bg-surface"
              borderRadius="200"
              width="500px"
              padding="0"
              overflowX="hidden"
              overflowY="hidden"
            >
              <BlockStack gap="0">
                {/* Card Header */}
                <Box padding="400">
                  <BlockStack gap="100">
                    <InlineStack align="space-between">
                      <Text as="h2" fontWeight="bold">
                        {PLANS.FREE_PLAN.name}
                      </Text>
                      <Text as="h2" fontWeight="bold">
                        {PLANS.FREE_PLAN.price}
                      </Text>
                    </InlineStack>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {PLANS.FREE_PLAN.priceTag}
                    </Text>
                  </BlockStack>
                </Box>

                <Divider />

                {/* Features List */}
                <Box padding="400">
                  <BlockStack gap="300">
                    {PLANS.FREE_PLAN.features.map((feature, index) => (
                      <InlineStack gap="200" key={index} blockAlign="center">
                        <img
                          src="/images/check-icon.svg"
                          alt="Check"
                          width="16"
                          height="16"
                          style={{ color: "#4A4A4A" }}
                        />
                        <Text as="span" variant="bodyMd" tone="subdued">
                          {feature}
                        </Text>
                      </InlineStack>
                    ))}
                  </BlockStack>
                </Box>

                <Divider />

                {/* Button Section */}
                <Box padding="400">
                  <Button
                    variant="primary"
                    fullWidth
                    disabled={!isPro}
                    url={isPro ? '/app/cancel' : undefined}
                  >
                    {!isPro ? "Subscribed" : "Downgrade"}
                  </Button>
                </Box>
              </BlockStack>
            </Box>

          {/* Pro Plan Card */}
          <Box
              background="bg-surface"
              borderRadius="200"
              width="500px"
              padding="0"
              borderWidth="025"
              borderColor="border"
              overflowX="hidden"
              overflowY="hidden"
            >
              <BlockStack gap="0">
                {/* Card Header */}
                <Box padding="400">
                  <BlockStack gap="100">
                    <InlineStack align="space-between">
                      <Text as="h2" fontWeight="bold">
                        {PLANS.PRO_MONTHLY_PLAN.name}
                      </Text>
                      <Text as="h2" fontWeight="bold">
                        {billingCycle === "monthly" ? PLANS.PRO_MONTHLY_PLAN.price : PLANS.PRO_YEARLY_PLAN.price}
                      </Text>
                    </InlineStack>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {billingCycle === "monthly" ? PLANS.PRO_MONTHLY_PLAN.priceTag : PLANS.PRO_YEARLY_PLAN.priceTag}
                    </Text>
                  </BlockStack>
                </Box>

                {/* Billing Cycle Toggle */}
                <Box padding="400">
                  <ButtonGroup variant="segmented" fullWidth>
                    <Button
                      pressed={billingCycle === "monthly"}
                      onClick={() => setBillingCycle("monthly")}
                    >
                      Monthly
                    </Button>
                    <Button
                      pressed={billingCycle === "yearly"}
                      onClick={() => setBillingCycle("yearly")}
                    >
                      Yearly
                    </Button>
                  </ButtonGroup>
                </Box>

                <Divider />

                {/* Features List */}
                <Box padding="400">
                  <BlockStack gap="300">
                    {PLANS.PRO_MONTHLY_PLAN.features.map((feature, index) => (
                      <InlineStack gap="200" key={index} blockAlign="center">
                        <img
                          src="/images/check-icon.svg"
                          alt="Check"
                          width="16"
                          height="16"
                          style={{ color: "#4A4A4A" }}
                        />
                        <Text as="span" variant="bodyMd" tone="subdued">
                          {feature}
                        </Text>
                      </InlineStack>
                    ))}
                  </BlockStack>
                </Box>

                <Divider />

                {/* Button Section */}
                <Box padding="400">
                  <Button
                    variant="primary"
                    fullWidth
                    disabled={isPro && (
                      (billingCycle === "monthly" && currentPlan === planConstants.PRO_MONTHLY_PLAN) ||
                      (billingCycle === "yearly" && [planConstants.PRO_YEARLY_PLAN, "Pro Annual Plan"].includes(currentPlan))
                    )}
                    url={upgradeUrl}
                  >
                    {(() => {
                      if ((billingCycle === "monthly" && currentPlan === planConstants.PRO_MONTHLY_PLAN) ||
                          (billingCycle === "yearly" && [planConstants.PRO_YEARLY_PLAN, "Pro Annual Plan"].includes(currentPlan))) {
                        return "Subscribed";
                      }
                      if (currentPlan === planConstants.FREE_PLAN) return "Upgrade";
                      if (billingCycle === "yearly" && currentPlan === planConstants.PRO_MONTHLY_PLAN) return "Upgrade";
                      if (billingCycle === "monthly" && [planConstants.PRO_YEARLY_PLAN, "Pro Annual Plan"].includes(currentPlan)) return "Downgrade";
                      return "Subscribe";
                    })()}
                  </Button>
                </Box>
              </BlockStack>
            </Box>
        </InlineStack>
      </BlockStack>
    </Page>
  );
}
