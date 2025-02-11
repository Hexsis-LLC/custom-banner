import {Page} from "@shopify/polaris";
import OnboardingInit from "../components/onbording";
import {useActionData, useNavigate, useSubmit} from "@remix-run/react";
import {json, LoaderFunctionArgs} from "@remix-run/node";
import {authenticate} from "../shopify.server";
import {completeOnboarding} from "../services/onboarding.server";
import {useEffect} from "react";

interface ActionData {
  success: boolean;
  error?: string;
}

export const action = async ({request}: LoaderFunctionArgs) => {
  const {session} = await authenticate.admin(request);

  try {
    const result = await completeOnboarding(session);
    if (result) {
      return json<ActionData>(result);
    }
    return json<ActionData>({
      success: false,
      error: "Failed to complete onboarding"
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return json<ActionData>({
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete onboarding"
    });
  }
};

export default function AppOnboardingStep2() {
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
