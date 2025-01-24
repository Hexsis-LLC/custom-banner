import { Page,} from "@shopify/polaris";


export default function AnnouncementBanner() {
  return (
    <Page
      title="Announcement Banner"
      backAction={{ content: "Banner Types", url: "/app/campaign/banner_type" }}
      primaryAction={{
        content: "Save Banner",
        onAction: () => {
          console.log("Banner saved");
        },
      }}
    >
    </Page>
  );
}
