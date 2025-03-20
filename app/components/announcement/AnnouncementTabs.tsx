import React from 'react';
import {BasicTab} from "./BasicTab";
import {CTATab} from "./CTATab";
import {OtherTab} from "./OtherTab";
import {AnnouncementTextTab} from "./AnnouncementTextTab";
import {CountdownTab} from "./CountdownTab";
import { useFormContext } from '../../contexts/AnnouncementFormContext';
import {AnnouncementBackgroundTab} from "./BackgroundTab";

interface AnnouncementTabsProps {
  selected: number;
  pages: Array<{
    title: string;
    handle: string;
  }>;
}

export function AnnouncementTabs({selected, pages}: AnnouncementTabsProps) {
  const { formData } = useFormContext();
  const isCountdownType = formData.basic.type === 'countdown';

  const pagesOptions = [
    { label: "All", value: "__global" },
    ...pages
      .filter((page) => page.title && page.title.trim().length > 0)
      .map((page) => ({
        label: page.title,
        value: page.handle,
      })),
  ];

  // For countdown type, we need to adjust tab indices after the text tab
  if (isCountdownType) {
    switch (selected) {
      case 0:
        return <BasicTab />;
      case 1:
        return <AnnouncementTextTab />;
      case 2:
        return <CountdownTab />;
      case 3:
        return <CTATab />;
      case 4:
        return <AnnouncementBackgroundTab />;
      case 5:
        return <OtherTab pagesOptions={pagesOptions} />;
      default:
        return null;
    }
  } else {
    // Regular announcement flow
    switch (selected) {
      case 0:
        return <BasicTab />;
      case 1:
        return <AnnouncementTextTab />;
      case 2:
        return <CTATab />;
      case 3:
        return <AnnouncementBackgroundTab />;
      case 4:
        return <OtherTab pagesOptions={pagesOptions} />;
      default:
        return null;
    }
  }
}
