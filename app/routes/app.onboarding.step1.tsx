import {useNavigate} from "@remix-run/react";
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
  Banner,
} from "@shopify/polaris";
import {useState} from "react";

import enableAppEmbed from "../assets/enable-app-embed-example.png";

export default function AppOnboardingStep1() {
  const navigate = useNavigate();
  const [selectedStep, setSelectedStep] = useState<string | null>("embed");
  const [showAppEmbed, setShowAppEmbed] = useState(true);

  const handleNext = () => {
    navigate("/app/campaign");
  };

  const handleBack = () => {
    navigate("/app/onboarding");
  };

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
                      0 out of 2 steps are completed
                    </Text>
                    <Box width="75%">
                      <ProgressBar progress={0} size="small"/>
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
                          <RadioButton
                            label=""
                            checked={selectedStep === "embed"}
                            onChange={() => setSelectedStep("embed")}
                          />
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
                              <RadioButton
                                label=""
                                checked={selectedStep === "embed"}
                                onChange={() => setSelectedStep("embed")}
                              />
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
                                      <Button variant="primary"
                                              onClick={() => {
                                               // window.open(`https://admin.shopify.com/store/${shopName}/themes/${themeEditorId}/editor?context=apps&template=index&activateAppId=${EXTENSTION_ID}/${EXTENSTION_FILE_NAME}`, '_blank');
                                              }}
                                              disabled={selectedStep !== "embed"}
                                      >
                                        Enable app embed
                                      </Button>
                                      <Button
                                        onClick={handleBack}
                                      >
                                        Back
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
                  </Box>
                  {/* Create Banner */}
                  <BlockStack gap="400">
                    {selectedStep !== "banner" &&
                      <InlineStack gap="200" align="center" blockAlign="center">
                        <div style={{paddingLeft: '14px'}}>
                          <RadioButton
                            label=""
                            checked={selectedStep === "banner"}
                            onChange={() => setSelectedStep("banner")}
                          />
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
                              <RadioButton
                                label=""
                                checked={selectedStep === "banner"}
                                onChange={() => setSelectedStep("banner")}
                              />
                              <div style={{flex: 1}}>
                                <BlockStack gap={"200"}>

                                  <Text variant="headingMd" as="h3">
                                    Create your first banner
                                  </Text>
                                  <Text variant="bodyMd" as="p" tone="subdued">
                                    The button below will open a new window with app embed enabled. You only need to
                                    click
                                    Save in that window then come back here to continue.
                                  </Text>
                                  <Box paddingBlockStart="200" paddingBlockEnd="200">
                                    <InlineStack gap="200">
                                      <Button variant="primary"
                                              onClick={() => setShowAppEmbed(true)}

                                      >
                                        Enable app embed
                                      </Button>
                                      <Button
                                        onClick={handleBack}
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
