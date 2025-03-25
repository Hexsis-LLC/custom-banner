import {
  SkeletonPage,
  Layout,
  Card,
  SkeletonBodyText,
  SkeletonDisplayText,
  BlockStack,
  Box,
} from "@shopify/polaris";
import {HomeSkeletonLoader} from "./home";

interface SkeletonLoadingProps {
  title?: string;
  type?: 'default' | 'onboarding' | 'home';
}

export function SkeletonLoading({ title = "Loading...", type = 'default' }: SkeletonLoadingProps) {
  if (type === 'onboarding') {
    return (
      <SkeletonPage title={title}>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Box paddingBlockEnd="200">
                  <SkeletonDisplayText size="small" />
                </Box>
                <SkeletonBodyText lines={2} />
                <Box paddingBlockStart="200" paddingBlockEnd="200">
                  <SkeletonBodyText lines={1} />
                </Box>
                <BlockStack gap="400">
                  <Card>
                    <BlockStack gap="200">
                      <SkeletonDisplayText size="small" />
                      <SkeletonBodyText lines={3} />
                    </BlockStack>
                  </Card>
                  <Card>
                    <BlockStack gap="200">
                      <SkeletonDisplayText size="small" />
                      <SkeletonBodyText lines={3} />
                    </BlockStack>
                  </Card>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    );
  }

  if (type === 'home') {
    return (
      <HomeSkeletonLoader title={title}></HomeSkeletonLoader>
    );
  }

  return (
    <SkeletonPage title={title}>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={3} />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}
