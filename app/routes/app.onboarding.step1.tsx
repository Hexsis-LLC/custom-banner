import {useNavigate, useLoaderData, useSubmit, useActionData} from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  ProgressBar,
  BlockStack,
  Box,
  Button,
  InlineStack,
  RadioButton,
  Grid,
  Image,
  Divider,
} from "@shopify/polaris";
import {useState, useCallback, useEffect} from "react";
import type {LoaderFunctionArgs, ActionFunctionArgs} from "@remix-run/node";
import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";
import {db} from "../db.server";
import {onboardingTable} from "../../drizzle/schema/onboarding";
import {eq} from "drizzle-orm";

import enableAppEmbed from "../assets/enable-app-embed-example.png";
import {StepIndicator} from "../component/StepIndicator";

interface LoaderData {
  shop: string;
  themeId: string;
  hasCompletedEmbed: boolean;
  hasCompletedCreateNewBanner: boolean;
}

interface ActionData {
  success: boolean;
  error?: string;
  action?: string;
}
interface BlockData {
  type: string; // E.g., 'shopify://apps/custom-banner/blocks/custom_banner_emb/...'
  disabled: boolean;
  settings: any;
}

interface Blocks {
  [blockId: string]: BlockData; // Each block is keyed by its unique ID
}


const findBlockByType = (blocks: Blocks, typeString: string) => {
  if (!blocks || typeof blocks !== 'object') {
    throw new Error("Invalid blocks data.");
  }

  const block = Object.entries(blocks).find(
    ([_, blockData]) => blockData.type === typeString
  );

  return block
    ? {blockId: block[0], blockData: block[1]}
    : null;
};

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {admin, session} = await authenticate.admin(request);

  // Fetch shop and theme data
  const response = await admin.graphql(
    `query {
      shop {
        myshopifyDomain
      }
      themes(first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }`
  );

  const data = await response.json();


  const assets = await admin.rest.resources.Asset.all({
    session: session,
    theme_id: data.data.themes.edges[0]?.node.id.replace('gid://shopify/OnlineStoreTheme/', ''),
    asset: {"key": "config/settings_data.json"},
  });
  const blocks: Blocks = JSON.parse(assets.data[0].value as string)['current']['blocks'];
  console.log(blocks)
  const block  = findBlockByType(blocks, 'shopify://apps/custom-banner/blocks/custom_banner_emb/e451d624-718c-470b-9466-778747ad40f5');
  if(block){
    await db.update(onboardingTable)
      .set({
        hasCompletedEmbed: !block?.blockData.disabled,
        updatedAt: new Date().toISOString()
      })
      .where(eq(onboardingTable.shop, session.shop))
      .run();
  }
  // Fetch onboarding status
  const onboardingStatus = await db.select({
    hasCompletedEmbed: onboardingTable.hasCompletedEmbed,
    hasCompletedCreateNewBanner: onboardingTable.hasCompletedCreateNewBanner,
  })
    .from(onboardingTable)
    .where(eq(onboardingTable.shop, session.shop))
    .get();

  return json<LoaderData>({
    shop: data.data.shop.myshopifyDomain,
    themeId: data.data.themes.edges[0]?.node.id.replace('gid://shopify/OnlineStoreTheme/', ''),
    hasCompletedEmbed: onboardingStatus?.hasCompletedEmbed ?? false,
    hasCompletedCreateNewBanner: onboardingStatus?.hasCompletedCreateNewBanner ?? false,
  });
};

export const action = async ({request}: ActionFunctionArgs) => {
  const {session} = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    if (action === "enable_embed") {
      await db.update(onboardingTable)
        .set({
          hasCompletedEmbed: true,
          updatedAt: new Date().toISOString()
        })
        .where(eq(onboardingTable.shop, session.shop))
        .run();

      return json<ActionData>({success: true, action: "enable_embed"});
    }

    if (action === "create_banner") {
      await db.update(onboardingTable)
        .set({
          hasCompletedCreateNewBanner: true,
          hasCompletedOnboarding: false,
          updatedAt: new Date().toISOString()
        })
        .where(eq(onboardingTable.shop, session.shop))
        .run();

      return json<ActionData>({success: true, action: "create_banner"});
    }

    if (action === "create_banner_skip") {
      await db.update(onboardingTable)
        .set({
          hasCompletedCreateNewBanner: true,
          hasCompletedOnboarding: false,
          updatedAt: new Date().toISOString()
        })
        .where(eq(onboardingTable.shop, session.shop))
        .run();

      return json<ActionData>({success: true, action: "create_banner_skip"});
    }

    return json<ActionData>({success: false, error: "Invalid action"});
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return json<ActionData>({success: false, error: errorMessage});
  }
};

export default function AppOnboardingStep1() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const actionData = useActionData<ActionData>();
  const {shop, themeId, hasCompletedEmbed, hasCompletedCreateNewBanner} = useLoaderData<LoaderData>();
  const [selectedStep, setSelectedStep] = useState<string | null>(() => {
    // If embed is completed, select banner step, otherwise select embed step
    return hasCompletedEmbed ? "banner" : "embed";
  });

  useEffect(() => {
    // Update selected step when completion status changes
    if (hasCompletedEmbed && !hasCompletedCreateNewBanner) {
      setSelectedStep("banner");
    }
    if(hasCompletedEmbed && hasCompletedCreateNewBanner){
      navigate('/app/onboarding/step2');
    }
  }, [hasCompletedEmbed, hasCompletedCreateNewBanner]);

  // Handle navigation after successful banner creation
  useEffect(() => {
    if (actionData?.success && actionData.action === "create_banner") {
      navigate("/app/campaign/announcement");
    }
  }, [actionData, navigate]);

  useEffect(() => {
    if (actionData?.success && actionData.action === "create_banner_skip") {
      navigate("/app/onboarding/step2");
    }
  }, [actionData, navigate]);


  const handleEnableAppEmbed = useCallback(() => {
    const shopName = shop.replace('.myshopify.com', '');
    console.log('Shop:', shop);
    console.log('Shop Name:', shopName);
    console.log('Theme ID:', themeId);
    window.open(`https://admin.shopify.com/store/${shopName}/themes/${themeId}/editor?context=apps&appEmbed=e451d624-718c-470b-9466-778747ad40f5`);
    const formData = new FormData();
    formData.append('action', 'enable_embed');
    submit(formData, {method: 'post'});
  }, [shop, themeId, submit]);

  const handleCreateBanner = useCallback(() => {
    const formData = new FormData();
    formData.append('action', 'create_banner');
    submit(formData, {method: 'post'});
  }, [submit]);
  const handleCreateBannerSkip = useCallback(() => {
    const formData = new FormData();
    formData.append('action', 'create_banner_skip');
    submit(formData, {method: 'post'});
  }, [submit]);

  const completedSteps = [hasCompletedEmbed, hasCompletedCreateNewBanner].filter(Boolean).length;
  const progress = (completedSteps / 2) * 100;

  const handleStepSelect = useCallback((step: string) => {
    // Only allow selecting banner if embed is completed
    if (step === "banner" && !hasCompletedEmbed) return;
    // Don't allow selecting embed if it's completed
    if (step === "embed" && hasCompletedEmbed) return;
    setSelectedStep(step);
  }, [hasCompletedEmbed]);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {/* Title Card */}
            <Card>
              <BlockStack gap="200">
                <Box paddingBlockEnd="200">
                  <InlineStack align="space-between">
                    <Text variant="headingLg" as="h2">
                      Welcome to Custom Banner
                    </Text>
                    <Button variant="plain" accessibilityLabel="More options">
                      ⋮
                    </Button>
                  </InlineStack>
                </Box>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Complete the onboarding process to get started
                </Text>
                <Box paddingBlockStart="200" paddingBlockEnd={"400"}>
                  <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <Text as="p" variant="bodyMd">
                      {completedSteps} out of 2 steps are completed
                    </Text>
                    <Box width="75%">
                      <ProgressBar progress={progress} size="small"/>
                    </Box>
                  </div>
                </Box>
                <Divider/>
                <BlockStack gap="500">
                  {/* Enable App Embed */}
                  <Box paddingBlockStart={"200"}>
                    {selectedStep !== "embed" &&
                      <InlineStack gap="200" align="center" blockAlign="center">
                        <div style={{paddingLeft: '14px'}}>
                          <StepIndicator selected={selectedStep !== "embed" && hasCompletedEmbed} ></StepIndicator>
                        </div>
                        <div style={{flex: 1}}>
                          <BlockStack>
                            <Text variant="headingMd" as="h3" tone={hasCompletedEmbed ? "success" : undefined}>
                              Enable App Embed {hasCompletedEmbed && "✓"}
                            </Text>
                          </BlockStack>
                        </div>
                      </InlineStack>
                    }
                    {selectedStep === "embed" &&
                      <Card background="bg-fill-secondary">
                        <Grid>
                          <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 8, xl: 8}}>
                            <InlineStack gap="200" align="start" blockAlign="start">
                              <StepIndicator selected={selectedStep !== "embed" && hasCompletedEmbed} ></StepIndicator>
                              <div style={{flex: 1}}>
                                <BlockStack gap={"200"}>
                                  <Text variant="headingMd" as="h3">
                                    Enable App Embed
                                  </Text>
                                  <Text variant="bodyMd" as="p" tone="subdued">
                                    The button below will open a new window with app embed enabled. You only need to
                                    click
                                    Save in that window then come back here to continue.
                                  </Text>
                                  <Box paddingBlockStart="200" paddingBlockEnd="200">
                                    <InlineStack gap="200">
                                      <Button
                                        variant="primary"
                                        onClick={handleEnableAppEmbed}
                                        disabled={hasCompletedEmbed}
                                      >
                                        {hasCompletedEmbed ? "Enabled" : "Enable app embed"}
                                      </Button>
                                    </InlineStack>
                                  </Box>
                                </BlockStack>
                              </div>
                            </InlineStack>
                          </Grid.Cell>
                          <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 4, xl: 4}}>
                            <Box>
                              <Image
                                source={enableAppEmbed}
                                alt="App embed preview"
                                style={{borderRadius: '12px', boxShadow: '0px 1px 0px 0px rgba(26, 26, 26, 0.07)'}}
                              />
                            </Box>
                          </Grid.Cell>
                        </Grid>
                      </Card>
                    }
                  </Box>
                  {/* Create Banner */}
                  <BlockStack gap="400">
                    {selectedStep !== "banner" &&
                      <InlineStack gap="200" align="center" blockAlign="center">
                        <div style={{paddingLeft: '14px'}}>
                          <StepIndicator selected={selectedStep !== "banner" && hasCompletedCreateNewBanner} ></StepIndicator>
                        </div>
                        <div style={{flex: 1}}>
                          <BlockStack>
                            <Text variant="headingMd" as="h3"
                                  tone={hasCompletedCreateNewBanner ? "success" : undefined}>
                              Create your first banner {hasCompletedCreateNewBanner && "✓"}
                            </Text>
                          </BlockStack>
                        </div>
                      </InlineStack>
                    }
                    {selectedStep === "banner" &&
                      <Card background="bg-fill-secondary">
                        <Grid>
                          <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 8, xl: 8}}>
                            <InlineStack gap="200" align="start" blockAlign="start">
                              <StepIndicator selected={selectedStep !== "banner" && hasCompletedCreateNewBanner} ></StepIndicator>
                              <div style={{flex: 1}}>
                                <BlockStack gap={"200"}>
                                  <Text variant="headingMd" as="h3">
                                    Create your first banner
                                  </Text>
                                  <Text variant="bodyMd" as="p" tone="subdued">
                                    Create your first announcement banner to engage with your customers.
                                  </Text>
                                  <Box paddingBlockStart="200" paddingBlockEnd="200">
                                    <InlineStack gap="200">
                                      <Button
                                        variant="primary"
                                        onClick={handleCreateBanner}
                                        disabled={!hasCompletedEmbed || hasCompletedCreateNewBanner}
                                      >
                                        {hasCompletedCreateNewBanner ? "Banner Created" : "Create banner"}
                                      </Button>
                                      <Button
                                        onClick={handleCreateBannerSkip}
                                      >
                                        Skip
                                      </Button>
                                    </InlineStack>
                                  </Box>
                                </BlockStack>
                              </div>
                            </InlineStack>
                          </Grid.Cell>
                          <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 4, xl: 4}}>
                            <Box>
                              <Image
                                source={enableAppEmbed}
                                alt="App embed preview"
                                style={{borderRadius: '12px', boxShadow: '0px 1px 0px 0px rgba(26, 26, 26, 0.07)'}}
                              />
                            </Box>
                          </Grid.Cell>
                        </Grid>
                      </Card>}
                  </BlockStack>
                </BlockStack>
              </BlockStack>
            </Card>
            {/* Expert Card */}
            <Card>
              <BlockStack gap="200">
                <Text variant="headingMd" as="h3">
                  Talk to Our Experts
                </Text>
                <Text variant="bodyMd" as="p">
                  Hey, guess what! We have some marketing experts in the house. Want to book a one and one session with
                  team? It's completely FREE.
                </Text>
                <Box paddingBlockStart="200">
                  <Button>Talk to marketing expert</Button>
                </Box>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
