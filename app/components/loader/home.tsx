import {BlockStack, Card, Layout, SkeletonBodyText, SkeletonDisplayText, SkeletonPage} from "@shopify/polaris";

export function HomeSkeletonLoader({ title = "Loading..." }: { title?: string }) {
  return (
    <>
      return (
      <SkeletonPage title={title}>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="200">
                <SkeletonDisplayText size="medium" />
                <SkeletonBodyText lines={2} />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </SkeletonPage>
      );
    </>
  );
}
