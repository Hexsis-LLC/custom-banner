import React from 'react';
import {BasicTab} from "./BasicTab";
import {CTATab} from "./CTATab";
import {BackgroundTab} from "./BackgroundTab";
import {OtherTab} from "./OtherTab";
import {AnnouncementTextTab} from "./AnnouncementTextTab";

interface AnnouncementTabsProps {
  selected: number;
  pages: Array<{
    title: string;
    handle: string;
  }>;
}

export function AnnouncementTabs({selected, pages}: AnnouncementTabsProps) {
  const pagesOptions = [
    { label: "All", value: "__global" },
    ...pages
      .filter((page) => page.title && page.title.trim().length > 0)
      .map((page) => ({
        label: page.title,
        value: page.handle,
      })),
  ];

  switch (selected) {
    case 0:
      return <BasicTab />;
    case 1:
      return <AnnouncementTextTab />;
    case 2:
      return <CTATab />;
    case 3:
      return <BackgroundTab />;
    case 4:
      return <OtherTab pagesOptions={pagesOptions} />;
    default:
      return null;
  }
} 