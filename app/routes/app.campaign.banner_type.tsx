import { Outlet, useNavigate } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import { Page } from "@shopify/polaris";

export default function AppCampaign() {
  const navigate = useNavigate();
  return (
    <Page
      title="Campaign Type"
      backAction={{ content: "Campaigns", url: "/app/campaign" }}
      primaryAction={{
        content: "Create Announcement Banner",
        onAction: () => {
          navigate("/app/campaign/announcement");
        },
      }}
    >
    </Page>
  );
}
