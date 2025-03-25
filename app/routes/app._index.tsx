
import {useOutletContext, useNavigate, useSubmit, useActionData, useNavigation} from "@remix-run/react";
import OnboardingInit from "../components/onbording";
import {json, type LoaderFunctionArgs} from "@remix-run/node";
import {authenticate} from "../shopify.server";
import {initializeOnboarding} from "../services/onboarding.server";
import {useEffect} from "react";
import {SkeletonLoading} from "../components/loader/SkeletonLoading";
import AppCampaign from "./app.campaign.banner_type";

interface ActionData {
  success: boolean;
  error?: string;
}


export const action = async ({request}: LoaderFunctionArgs) => {
  const {session} = await authenticate.admin(request);

  try {
    await initializeOnboarding(session);
    return json<ActionData>({
      success: true,
      error: "Successfully initialized onboarding"
    });
  } catch (error) {
    console.error("Error initializing onboarding:", error);
    return json<ActionData>({
      success: false,
      error: error instanceof Error ? error.message : "Failed to initialize onboarding"
    });
  }
};

export default function Index() {
  const outletContext = useOutletContext<{ hideNav: boolean, isLoading: boolean }>();
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
    <>
       {outletContext.hideNav ? (
        <>
          <AppCampaign />
        </>
      ) : (
        <OnboardingInit onStart={handleStart}></OnboardingInit>
      )}
    </>
  );
}
