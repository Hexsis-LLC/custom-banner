import {
  Page,
  Card, Text,
} from "@shopify/polaris";
import {useOutletContext, useNavigate, useSubmit, useActionData} from "@remix-run/react";
import OnboardingInit from "../component/onbording";
import {json, LoaderFunctionArgs} from "@remix-run/node";
import {authenticate} from "../shopify.server";
import {db} from "../db.server";
import {onboardingTable} from "../../drizzle/schema/onboarding";
import {useEffect} from "react";

interface ActionData {
  success: boolean;
  error?: string;
}

export const action = async ({request}: LoaderFunctionArgs) => {
  const {session} = await authenticate.admin(request);

  try {
    // Insert or update onboarding record
    await db.insert(onboardingTable).values({
      shop: session.shop,
      hasCompletedOnboarding: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).onConflictDoUpdate({
      target: onboardingTable.shop,
      set: {
        hasCompletedOnboarding: false,
        updatedAt: new Date().toISOString()
      }
    }).run();

    return json<ActionData>({success: true});
  } catch (error) {
    console.error("Database error:", error);
    return json<ActionData>({success: false, error: "Failed to initialize onboarding"});
  }
};

export default function Index() {
  const outletContext = useOutletContext<{ hideNav: boolean }>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const actionData = useActionData<ActionData>();

  // Handle navigation after successful form submission
  useEffect(() => {
    if (actionData?.success) {
      navigate("/app/onboarding/step1");
    }
  }, [actionData, navigate]);

  const handleStart = () => {
    // Only submit the form - navigation will happen after success
    submit({}, {method: "post", action: "?index"});
  };

  return (
    <Page>
      {outletContext.hideNav ? (
        <Card><Text as={'h3'}>Loading...</Text></Card>
      ) : (
        <OnboardingInit onStart={handleStart}></OnboardingInit>
      )}
    </Page>
  );
}
