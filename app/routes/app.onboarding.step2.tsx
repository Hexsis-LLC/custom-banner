import {Page} from "@shopify/polaris";
import OnboardingInit from "../component/onbording";
import {useActionData, useNavigate, useSubmit} from "@remix-run/react";
import {json, LoaderFunctionArgs} from "@remix-run/node";
import {authenticate} from "../shopify.server";
import {db} from "../db.server";
import {onboardingTable} from "../../drizzle/schema/onboarding";
import {useEffect} from "react";
import {CircleProgress} from "../component/CircleProgress";
import {StepIndicator} from "../component/StepIndicator";
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
      hasCompletedOnboarding: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).onConflictDoUpdate({
      target: onboardingTable.shop,
      set: {
        hasCompletedOnboarding: true,
        updatedAt: new Date().toISOString()
      }
    }).run();

    return json<ActionData>({success: true});
  } catch (error) {
    console.error("Database error:", error);
    return json<ActionData>({success: false, error: "Failed to initialize onboarding"});
  }
};

export default function AppOnboardingStep1() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const actionData = useActionData<ActionData>();

  // Handle navigation after successful form submission
  useEffect(() => {
    if (actionData?.success) {
      navigate("/app/");
    }
  }, [actionData, navigate]);

  const handleStart = () => {
    // Only submit the form - navigation will happen after success
    submit({}, {method: "post", action: "?index"});
  };
  return (
    <Page>
      <OnboardingInit onStart={handleStart} title={"Step 2"}></OnboardingInit>
    </Page>
  );
}
