import {Button, Card, Page,} from "@shopify/polaris";
import {useNavigate} from "@remix-run/react";


export default function AnnouncementBanner() {
  const navigate = useNavigate();
  const handleEnableAppEmbed = () => {
    navigate("/app/onboarding/step2");
  }
  return (
    <Page
      title="Announcement Banner"
      backAction={{content: "Banner Types", url: "/app/campaign/banner_type"}}
      primaryAction={{
        content: "Save Banner",
        onAction: () => {
          console.log("Banner saved");
        },
      }}
    >
      <Card> <Button
        variant="primary"
        onClick={handleEnableAppEmbed}
      >
        {"Save"}
      </Button></Card>
    </Page>
  );
}
