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
  Grid,
  Image,
  Divider,
} from "@shopify/polaris";
import {useState, useCallback, useEffect} from "react";
import type {LoaderFunctionArgs, ActionFunctionArgs} from "@remix-run/node";
import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";
import {StepIndicator} from "../component/StepIndicator";
import type {LoaderData, ActionData} from "../types/onboarding";
import {
  getOnboardingStatus,
  updateEmbedStatus,
  updateBannerStatus,
  findAppBlock,
} from "../services/onboarding.server";

import enableAppEmbed from "../assets/enable-app-embed-example.png";
import {getShopInfo, getThemeAssets} from "../services/shopify.server";
import {getAppEmbedUrl} from "../utils/funtion_utils";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {admin, session} = await authenticate.admin(request);

  const data = await getShopInfo(admin);
  //const themeId = data.themeId;

  // Check theme assets for app embed status
  const blocks = await getThemeAssets(admin, session, data.themeId);
  const block = findAppBlock(blocks,);

  if (block) {
    await updateEmbedStatus(session.shop, !block.blockData.disabled);
  }

  // Get current onboarding status
  const onboardingStatus = await getOnboardingStatus(session.shop);

  return json<LoaderData>({
    shop: data.shopDomain,
    themeId: data.themeId,
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
      await updateEmbedStatus(session.shop, true);
      return json<ActionData>({success: true, action: "enable_embed"});
    }

    if (action === "create_banner") {
      await updateBannerStatus(session.shop);
      return json<ActionData>({success: true, action: "create_banner"});
    }

    if (action === "create_banner_skip") {
      await updateBannerStatus(session.shop, true);
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
    return hasCompletedEmbed ? "banner" : "embed";
  });

  useEffect(() => {
    if (hasCompletedEmbed && !hasCompletedCreateNewBanner) {
      setSelectedStep("banner");
    }
    if (hasCompletedEmbed && hasCompletedCreateNewBanner) {
      navigate('/app/onboarding/step2');
    }
  }, [hasCompletedEmbed, hasCompletedCreateNewBanner, navigate]);

  useEffect(() => {
    if (actionData?.success && actionData.action === "create_banner") {
      navigate("/app/campaign/announcement");
    }
    if (actionData?.success && actionData.action === "create_banner_skip") {
      navigate("/app/onboarding/step2");
    }
  }, [actionData, navigate]);

  const handleEnableAppEmbed = useCallback(() => {
    window.open(getAppEmbedUrl(shop, themeId), '_blank');
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
                          <StepIndicator selected={selectedStep !== "embed" && hasCompletedEmbed}/>
                        </div>
                        <div style={{flex: 1}}>
                          <BlockStack>
                            <Text variant="headingMd" as="h3">
                              Enable App Embed
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
                              <StepIndicator selected={selectedStep !== "embed" && hasCompletedEmbed}/>
                              <div style={{flex: 1}}>
                                <BlockStack gap={"200"}>
                                  <Text variant="headingMd" as="h3">
                                    Enable App Embed
                                  </Text>
                                  <Text variant="bodyMd" as="p" tone="subdued">
                                    The button below will open a new window with app embed enabled. You only need to
                                    click Save in that window then come back here to continue.
                                  </Text>
                                  <Box paddingBlockStart="200" paddingBlockEnd="200">
                                    <InlineStack gap="200">
                                      <Button
                                        variant="primary"
                                        onClick={handleEnableAppEmbed}
                                        disabled={hasCompletedEmbed}
                                      >
                                        Enable App Embed
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
                          <StepIndicator selected={selectedStep !== "banner" && hasCompletedCreateNewBanner}/>
                        </div>
                        <div style={{flex: 1}}>
                          <BlockStack>
                            <Text variant="headingMd" as="h3">
                              Create your first banner
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
                              <StepIndicator selected={selectedStep !== "banner" && hasCompletedCreateNewBanner}/>
                              <div style={{flex: 1}}>
                                <BlockStack gap={"200"}>
                                  <Text variant="headingMd" as="h3">
                                    Create your first banner
                                  </Text>
                                  <Text variant="bodyMd" as="p" tone="subdued">
                                    The button below will open a new window with app embed enabled. You only need to
                                    click Save in that window then come back here to continue.
                                  </Text>
                                  <Box paddingBlockStart="200" paddingBlockEnd="200">
                                    <InlineStack gap="200">
                                      <Button
                                        variant="primary"
                                        onClick={handleCreateBanner}
                                        disabled={!hasCompletedEmbed || hasCompletedCreateNewBanner}
                                      >
                                        Create Banner
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
