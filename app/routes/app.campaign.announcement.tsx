import React, {useEffect} from "react";
import {Form, useLoaderData, useNavigate} from "@remix-run/react";
import {Badge, BlockStack, Box, Page, Tabs} from "@shopify/polaris";

import {LoaderFunctionArgs} from "@remix-run/node";
import PrimaryAnnouncementAction from "../components/announcement/primary-action";
import {
  useAnnouncementActiveTab,
  useAnnouncementTabActions,
  useAnnouncementTabs
} from "../stores/announcement-tabs.store";
import {ANNOUNCEMENT_TYPE, EAnnouncementTabs, EAnnouncementType} from "../types/announcement";
import {AnnouncementTabs} from "../components/announcement/tabs";

interface ServerProps {
  announcementType: EAnnouncementType,
  announcementId: string | null,
  returnUrl: string | null
}


export const loader = async ({request, params}: LoaderFunctionArgs): Promise<ServerProps> => {
  const url = new URL(request.url);
  const announcementType = (url.searchParams.get('type') || 'basic') as EAnnouncementType;
  const announcementId = url.searchParams.get('id');
  const returnUrl = url.searchParams.get('fromUrl');
  console.log(returnUrl)
  return {
    announcementType,
    announcementId,
    returnUrl
  };
}

// Main component
export default function AnnouncementBanner() {
  const navigate = useNavigate();
  const loaderData = useLoaderData<ServerProps>();
  const activeTab = useAnnouncementActiveTab();
  const tabs = useAnnouncementTabs();
  const {switchTab,announcementType}= useAnnouncementTabActions();
  useEffect(() => {
    announcementType(ANNOUNCEMENT_TYPE.COUNTDOWN);
  }, [loaderData.announcementType]);
  const secondaryActions = [
    {
      content: 'Cancel',
      onAction: () => navigate(loaderData.returnUrl ?? "/app/campaign/banner_type"),
      //disabled: isSubmitting,
    }
  ];

  return (
    <><Form method="post" action="/api/announcements" onSubmit={(e) => {
      e.preventDefault();
      // handleFormSubmit(actionType || 'draft');
    }}>
      <Page
        title={"New Announcement"}
        backAction={{content: "Banner Types", url: loaderData.returnUrl ?? "/app/campaign/banner_type"}}
        primaryAction={(
          <PrimaryAnnouncementAction
          onPublish={async () => {}}
          onSaveAsDraft={async () => {}}
          isLoading={true}
          onLoading={(isLoading) => {}}
          ></PrimaryAnnouncementAction>
        )}
        titleMetadata={(
          <Badge tone="new">
            {"Draft"}
          </Badge>
        )}
        secondaryActions={secondaryActions}
      >
        <BlockStack gap="400">
          <Tabs tabs={tabs} selected={activeTab} onSelect={switchTab}>
            <Box padding="200">
             <AnnouncementTabs tabId={tabs[activeTab].id as EAnnouncementTabs}></AnnouncementTabs>
            </Box>
          </Tabs>
        </BlockStack>
      </Page>
    </Form></>
  );
}
