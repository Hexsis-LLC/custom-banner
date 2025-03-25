import {BlockStack, Box, Card} from "@shopify/polaris";
import {AnnouncementTitle} from "../fields/announcement-title";
import {useAnnouncementActions, useAnnouncementData} from "../../../stores/announcment.store";

export function BasicTab() {
  const announcement = useAnnouncementData()
  const {updateAnnouncement} = useAnnouncementActions()
  return <BlockStack gap="300">
    <Card roundedAbove="sm">
      <Box padding="400">
        <AnnouncementTitle value={announcement?.title ?? ''} onChange={(value) => {
          updateAnnouncement({title: value})
        }} errors={""}></AnnouncementTitle>
      </Box>
    </Card>
  </BlockStack>
}
