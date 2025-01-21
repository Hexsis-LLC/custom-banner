import {
  Page,
  Card, Text,
} from "@shopify/polaris";
import {useEffect} from "react";
import {useOutletContext} from "@remix-run/react";
import OnboardingInit from "../component/onbording";

export default function Index() {
  const outletContext = useOutletContext<{ hideNav: boolean }>()


  useEffect(() => {
  }, [])
  return (
    <Page>
      {outletContext.hideNav ? (
        <Card><Text as={'h3'}>Loading...</Text></Card>
      ) : (
        <OnboardingInit></OnboardingInit>
      )}
    </Page>
  );
}
