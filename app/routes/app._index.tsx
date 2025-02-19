import {
  Page,
  Card, Text, Button,
} from "@shopify/polaris";
import {useOutletContext, useNavigate, useSubmit, useActionData, useNavigation, useLoaderData} from "@remix-run/react";
import OnboardingInit from "../components/onbording";
import {json, type LoaderFunctionArgs} from "@remix-run/node";
import {authenticate} from "../shopify.server";
import {initializeOnboarding} from "../services/onboarding.server";
import {useEffect} from "react";
import {SkeletonLoading} from "../components/SkeletonLoading";
import {TitleBar} from "@shopify/app-bridge-react";
import image from "../assets/onboarding.png";
import EmptyHome from "../components/home/empty_screen";
import BannerList from "../components/home/banner_list";
import {AnnouncementService} from "../services/announcement.server";
import { Announcement } from "app/types/announcement";

interface ActionData {
  success: boolean;
  error?: string;
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const announcetService = new AnnouncementService();
  const {session} = await authenticate.admin(request);
  const data = await announcetService.getAnnouncementsByShop(session.shop)

  return json({data});
};

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
  const outletContext = useOutletContext<{ hideNav: boolean }>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const {data} = useLoaderData<{data: Announcement[]}>();

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

  // Show skeleton loading during navigation or form submission
  if (navigation.state !== "idle") {
    return <SkeletonLoading type="home"/>;
  }

  return (

    <>

      {outletContext.hideNav ? (
        <>
          <BannerList data={data} />
        </>
      ) : (
        <OnboardingInit onStart={handleStart}></OnboardingInit>
      )}
    </>
  );
}
