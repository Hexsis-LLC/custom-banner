import { Outlet, useNavigate } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import { Page, Layout, Card, Text, BlockStack, Button, InlineStack, Icon, Grid } from "@shopify/polaris";
import { ExternalIcon } from "@shopify/polaris-icons";

export default function AppCampaign() {
  const navigate = useNavigate();

  const bannerTypes = [
    {
      id: 'basic',
      title: 'Announcement Bar',
      description: 'Display announcements, offers and special events',
    },
    {
      id: 'multi',
      title: 'Multi Announcements Bar',
      description: 'Display rotating multiple message types on the same bar',
    },
    {
      id: 'countdown',
      title: 'Countdown Timer Bar',
      description: 'Display announcements and offers with a countdown timer',
    },
    {
      id: 'shipping',
      title: 'Free Shipping Bar',
      description: 'Display a free shipping offer with updated card goals',
    },
    {
      id: 'email',
      title: 'Email Signup Bar',
      description: 'Display an expandable/collapsible email signup form',
    }
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
                          <Button onClick={() => navigate("/app/campaign/announcement")}>
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
