import {
  Page,
  Card,
  Tabs,
  Box,
} from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";
import { useState, useCallback } from "react";
import { BasicTab } from "app/components/announcement/BasicTab";
import { CTATab } from "app/components/announcement/CTATab";
import { AnnouncementTextTab } from "app/components/announcement/AnnouncementTextTab";

export default function AnnouncementBanner() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const [size, setSize] = useState('large');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState('12:30 PM');
  const [endTime, setEndTime] = useState('2:30 PM');
  const [ctaType, setCtaType] = useState('regular');
  const [fontSize, setFontSize] = useState(16);
  const [fontType, setFontType] = useState('site');
  const [paddingTop, setPaddingTop] = useState(0);
  const [paddingRight, setPaddingRight] = useState(0);
  const [paddingBottom, setPaddingBottom] = useState(0);
  const [paddingLeft, setPaddingLeft] = useState(0);

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
