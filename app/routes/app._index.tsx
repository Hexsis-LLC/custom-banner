import {
  Page,
  Link, Card, Text,
} from "@shopify/polaris";
import {TitleBar} from "@shopify/app-bridge-react";
import {useEffect, useState} from "react";
import {useNavigate, useOutletContext} from "@remix-run/react";
import OnboardingInit from "../component/onbording";

export default function Index() {
  const [isLoding, setIsLoding] = useState(false)

  const navigator = useNavigate()

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
