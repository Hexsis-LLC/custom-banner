import { useNavigate } from "@remix-run/react";
import { Page, Layout, Card, Text, BlockStack, Button, InlineStack, Grid } from "@shopify/polaris";
import { ExternalIcon } from "@shopify/polaris-icons";
import type { BannerType } from "../types/announcement";

export default function AppCampaign() {
  const navigate = useNavigate();

  const bannerTypes: Array<{
    id: BannerType;
    title: string;
    description: string;
  }> = [
    {
      id: 'basic',
      title: 'Basic Announcement Bar',
      description: 'Create a simple announcement bar with text and optional call-to-action button.',
    },
    {
      id: 'multi_text',
      title: 'Multi-text Announcements Bar',
      description: 'Create an announcement bar with multiple text messages that rotate.',
    },
    {
      id: 'countdown',
      title: 'Countdown Timer Bar',
      description: 'Create an announcement bar with a countdown timer for sales or events.',
    },
    {
      id: 'email_signup',
      title: 'Email Signup Bar',
      description: 'Create an announcement bar with an email signup form.',
    },
  ];

  return (
    <Page
      title="Select banner type"
      backAction={{ content: "Campaigns", onAction: () => navigate("/app") }}
    >
      <Layout>
        <Layout.Section>
          <Grid>
            {bannerTypes.map((type) => (
              <Grid.Cell key={type.id} columnSpan={{xs: 6, sm: 3, md: 6, lg: 6, xl: 6}}>
                <Card padding="500">
                  <BlockStack gap="400">
                    <InlineStack gap="500" align="start">
                      <BlockStack gap="200">
                        <Text variant="headingMd" as="h2">
                          {type.title}
                        </Text>
                        <Text variant="bodyMd" as="p" tone="subdued">
                          {type.description}
                        </Text>
                        <InlineStack gap="300">
                          <Button onClick={() => navigate(`/app/campaign/announcement?type=${type.id}`)}>
                            Select
                          </Button>
                          <Button
                            variant="plain"
                            icon={ExternalIcon}
                            onClick={() => {}}
                          >
                            See Example
                          </Button>
                        </InlineStack>
                      </BlockStack>
                    </InlineStack>
                  </BlockStack>
                </Card>
              </Grid.Cell>
            ))}
          </Grid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
