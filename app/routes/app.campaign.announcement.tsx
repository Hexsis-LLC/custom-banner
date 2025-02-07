import {
  Page,
  Tabs,
  Box,
} from "@shopify/polaris";
import {useNavigate} from "@remix-run/react";
import {useState, useCallback} from "react";
import {BasicTab} from "app/components/announcement/BasicTab";
import {CTATab} from "app/components/announcement/CTATab";
import {AnnouncementTextTab} from "app/components/announcement/AnnouncementTextTab";
import {BackgroundTab} from "app/components/announcement/BackgroundTab";
import {OtherTab} from "app/components/announcement/OtherTab";
import type {LoaderFunctionArgs} from "@remix-run/node";
import {authenticate, unauthenticated} from "../shopify.server";
import CustomFonts from "../utils/google-fonts";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {session} = await authenticate.admin(request);
  const fonts = new CustomFonts()

  const rendomfont = fonts.getRandomFont()
  console.log(rendomfont)

  //await unauthenticated.storefront(session.shop);

  /*if (!storefront) {
    return null;
  }
  const response = await storefront.graphql(`
    {
  page {
    handle
  }
}`);
  console.log(response)*/
  return null
}
export default function AnnouncementBanner() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const [size, setSize] = useState('large');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState('12:30');
  const [endTime, setEndTime] = useState('14:30');
  const [ctaType, setCtaType] = useState('regular');
  const [fontSize, setFontSize] = useState(16);
  const [fontType, setFontType] = useState('site');
  const [paddingTop, setPaddingTop] = useState(0);
  const [paddingRight, setPaddingRight] = useState(0);
  const [paddingBottom, setPaddingBottom] = useState(0);
  const [paddingLeft, setPaddingLeft] = useState(0);

  const [ctaFontSize, ctaSetFontSize] = useState(16);
  const [ctaFontType, ctaSetFontType] = useState('site');

  // New state for background tab
  const [backgroundType, setBackgroundType] = useState('solid');
  const [color1, setColor1] = useState('');
  const [color2, setColor2] = useState('');
  const [color3, setColor3] = useState('');
  const [pattern, setPattern] = useState('stripe-green');
  const [backgroundPaddingRight, setBackgroundPaddingRight] = useState(80);

  // Other tab state
  const [closeButtonPosition, setCloseButtonPosition] = useState('right');
  const [displayBeforeDelay, setDisplayBeforeDelay] = useState('no-delay');
  const [showAfterClosing, setShowAfterClosing] = useState('never');
  const [showAfterCTA, setShowAfterCTA] = useState('no-delay');
  const [selectedPages, setSelectedPages] = useState(['products']);
  const [campaignTiming, setCampaignTiming] = useState('immediate');

  const tabs = [
    {
      id: 'basic',
      content: 'Basic',
    },
    {
      id: 'announcement-text',
      content: 'Announcement text',
    },
    {
      id: 'cta',
      content: 'CTA',
    },
    {
      id: 'background',
      content: 'Background',
    },
    {
      id: 'other',
      content: 'Other',
    },
  ];

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );

  const handlePaddingChange = (value: number, position: 'top' | 'right' | 'bottom' | 'left') => {
    switch (position) {
      case 'top':
        setPaddingTop(value);
        break;
      case 'right':
        setPaddingRight(value);
        break;
      case 'bottom':
        setPaddingBottom(value);
        break;
      case 'left':
        setPaddingLeft(value);
        break;
    }
  };

  const renderContent = () => {
    switch (selected) {
      case 0:
        return (
          <BasicTab
            size={size}
            startDate={startDate}
            endDate={endDate}
            startTime={startTime}
            endTime={endTime}
            onSizeChange={setSize}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        );
      case 1:
        return (
          <AnnouncementTextTab
            fontType={fontType}
            fontSize={fontSize}
            onFontTypeChange={setFontType}
            onFontSizeChange={setFontSize}
          />
        );
      case 2:
        return (
          <CTATab
            ctaType={ctaType}
            paddingTop={paddingTop}
            paddingRight={paddingRight}
            paddingBottom={paddingBottom}
            paddingLeft={paddingLeft}
            onCtaTypeChange={setCtaType}
            onPaddingChange={handlePaddingChange}
            fontType={ctaFontType}
            fontSize={ctaFontSize}
            onFontTypeChange={ctaSetFontType}
            onFontSizeChange={ctaSetFontSize}
          />
        );
      case 3:
        return (
          <BackgroundTab
            backgroundType={backgroundType}
            color1={color1}
            color2={color2}
            color3={color3}
            pattern={pattern}
            paddingRight={backgroundPaddingRight}
            onBackgroundTypeChange={setBackgroundType}
            onColor1Change={setColor1}
            onColor2Change={setColor2}
            onColor3Change={setColor3}
            onPatternChange={setPattern}
            onPaddingRightChange={setBackgroundPaddingRight}
          />
        );
      case 4:
        return (
          <OtherTab
            closeButtonPosition={closeButtonPosition}
            displayBeforeDelay={displayBeforeDelay}
            showAfterClosing={showAfterClosing}
            showAfterCTA={showAfterCTA}
            selectedPages={selectedPages}
            campaignTiming={campaignTiming}
            startDate={startDate}
            endDate={endDate}
            startTime={startTime}
            endTime={endTime}
            onCloseButtonPositionChange={setCloseButtonPosition}
            onDisplayBeforeDelayChange={setDisplayBeforeDelay}
            onShowAfterClosingChange={setShowAfterClosing}
            onShowAfterCTAChange={setShowAfterCTA}
            onSelectedPagesChange={setSelectedPages}
            onCampaignTimingChange={setCampaignTiming}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Page
      title="Announcement Bar"
      backAction={{content: "Banner Types", url: "/app/campaign/banner_type"}}
      primaryAction={{
        content: "Publish",
        onAction: () => {
          console.log("Banner published");
        },
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: () => navigate("/app/campaign/banner_type"),
        },
      ]}
    >
      <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
        <Box padding="200">{renderContent()}</Box>
      </Tabs>
    </Page>
  );
}
