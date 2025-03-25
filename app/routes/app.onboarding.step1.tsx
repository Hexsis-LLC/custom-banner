import {useNavigate, useLoaderData, useSubmit, useActionData, useNavigation} from "@remix-run/react";
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
import {StepIndicator} from "../components/StepIndicator";
import {
  getShopAndThemeData,
  checkAppEmbed,
  updateOnboardingStep,
  getOnboardingStatus
} from "../services/onboarding.server";
import enableAppEmbed from "../assets/enable-app-embed-example.png";
import {SkeletonLoading} from "../components/loader/SkeletonLoading";

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

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {admin, session} = await authenticate.admin(request);

  try {
    // Get shop and theme data
    const shopAndThemeData = await getShopAndThemeData(admin);
    if(!shopAndThemeData) {
      return json<LoaderData>({
        shop: '',
        themeId: '',
        hasCompletedEmbed: false,
        hasCompletedCreateNewBanner: false,
      });
    }

    const {shop, themeId} = shopAndThemeData;
    // Check app embed status and update if needed
    await checkAppEmbed(admin, session, themeId);

    // Get current onboarding status
    const status = await getOnboardingStatus(session);

    return json<LoaderData>({
      shop,
      themeId,
      hasCompletedEmbed: status?.hasCompletedEmbed ?? false,
      hasCompletedCreateNewBanner: status?.hasCompletedCreateNewBanner ?? false,
    });

  } catch (error) {
    console.error("Error loading data:", error);
    return json<LoaderData>({
      shop: '',
      themeId: '',
      hasCompletedEmbed: false,
      hasCompletedCreateNewBanner: false,
    });
  }
};

export const action = async ({request}: ActionFunctionArgs) => {
  const {session} = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action") as string;

  try {
    switch (action) {
      case "enable_embed":
        await updateOnboardingStep(session, {hasCompletedEmbed: true});
        return json<ActionData>({success: true, action: "enable_embed"});

      case "create_banner":
        await updateOnboardingStep(session, {
          hasCompletedCreateNewBanner: true,
          hasCompletedEmbed: true
        });
        return json<ActionData>({success: true, action: "create_banner"});

      case "create_banner_skip":
        await updateOnboardingStep(session, {
          hasCompletedCreateNewBanner: true,
          hasCompletedEmbed: true
        });
        return json<ActionData>({success: true, action: "create_banner_skip"});

      default:
        return json<ActionData>({success: false, error: "Invalid action"});
    }
  } catch (error) {
    console.error("Error processing action:", error);
    return json<ActionData>({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    });
  }
};

export default function AppOnboardingStep1() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const actionData = useActionData<ActionData>();
  const {shop, themeId, hasCompletedEmbed, hasCompletedCreateNewBanner} = useLoaderData<LoaderData>();
  const navigation = useNavigation();

  const [selected, setSelected] = useState<string | null>(() => {
    return hasCompletedEmbed ? "banner" : "embed";
  });

  useEffect(() => {
    if (hasCompletedEmbed && !hasCompletedCreateNewBanner) {
      setSelected("banner");
    }
    if (hasCompletedEmbed && hasCompletedCreateNewBanner) {
      navigate('/app/onboarding/step2');
    }
  }, [hasCompletedEmbed, hasCompletedCreateNewBanner]);

  useEffect(() => {
    if (actionData?.success) {
      if (actionData.action === "create_banner") {
        navigate("/app/campaign/announcement");
      } else if (actionData.action === "create_banner_skip") {
        navigate("/app/onboarding/step2");
      }
    }
  }, [actionData, navigate]);

  const handleEnableAppEmbed = useCallback(() => {
    const shopName = shop.replace('.myshopify.com', '');
    window.open(`https://admin.shopify.com/store/${shopName}/themes/${themeId}/editor?context=apps&appEmbed=e451d624-718c-470b-9466-778747ad40f5`);
    submit({action: 'enable_embed'}, {method: 'post'});
  }, [shop, themeId, submit]);

  const handleCreateBanner = useCallback(() => {
    submit({action: 'create_banner'}, {method: 'post'});
  }, [submit]);

  const handleCreateBannerSkip = useCallback(() => {
    submit({action: 'create_banner_skip'}, {method: 'post'});
  }, [submit]);

  const completedSteps = [hasCompletedEmbed, hasCompletedCreateNewBanner].filter(Boolean).length;
  const progress = (completedSteps / 2) * 100;

  // Show skeleton loading during navigation or form submission
  if (navigation.state !== "idle") {
    return <SkeletonLoading type="onboarding" title="Loading Onboarding..." />;
  }

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
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
                    {selected !== "embed" &&
                      <InlineStack gap="200" align="center" blockAlign="center">
                        <div style={{paddingLeft: '14px'}}>
                          <StepIndicator selected={selected !== "embed" && hasCompletedEmbed} />
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
                    {selected === "embed" &&
                      <Card background="bg-fill-secondary">
                        <Grid>
                          <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 8, xl: 8}}>
                            <InlineStack gap="200" align="start" blockAlign="start">
                              <StepIndicator selected={selected !== "embed" && hasCompletedEmbed} />
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
                    {selected !== "banner" &&
                      <InlineStack gap="200" align="center" blockAlign="center">
                        <div style={{paddingLeft: '14px'}}>
                          <StepIndicator selected={selected !== "banner" && hasCompletedCreateNewBanner} />
                        </div>
                        <div style={{flex: 1}}>
                          <BlockStack>
                            <Text variant="headingMd" as="h3" tone={hasCompletedCreateNewBanner ? "success" : undefined}>
                              Create your first banner {hasCompletedCreateNewBanner && "✓"}
                            </Text>
                          </BlockStack>
                        </div>
                      </InlineStack>
                    }
                    {selected === "banner" &&
                      <Card background="bg-fill-secondary">
                        <Grid>
                          <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 8, xl: 8}}>
                            <InlineStack gap="200" align="start" blockAlign="start">
                              <StepIndicator selected={selected !== "banner" && hasCompletedCreateNewBanner} />
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
                                      <Button onClick={handleCreateBannerSkip}>
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
                      </Card>
                    }
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
