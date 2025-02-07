import type { AnnouncementBannerData } from "../types/announcement";
import type { Size } from "../types/announcement";

export const TABS = [
  { id: 'basic', content: 'Basic' },
  { id: 'announcement-text', content: 'Announcement text' },
  { id: 'cta', content: 'CTA' },
  { id: 'background', content: 'Background' },
  { id: 'other', content: 'Other' },
];

export const DEFAULT_INITIAL_DATA: AnnouncementBannerData = {
  basic: {
    size: 'large' as Size,
    sizeHeight: "52",
    sizeWidth: "100",
    campaignTitle: '',
    startType: 'now',
    endType: 'until_stop',
    startDate: new Date(),
    endDate: new Date(),
    startTime: '12:30 AM',
    endTime: '1:30 PM',
  },
  text: {
    announcementText: '',
    textColor: '#FFFFFF',
    fontSize: 16,
    fontType: 'site',
    fontUrl: '',
  },
  cta: {
    ctaType: 'regular',
    ctaText: '',
    ctaLink: '',
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    fontType: 'site',
    fontUrl: '',
    buttonFontColor: '#FFFFFF',
    buttonBackgroundColor: '#FFFFFF',
  },
  background: {
    backgroundType: 'solid',
    color1: '',
    color2: '',
    pattern: 'none',
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
  other: {
    closeButtonPosition: 'right' as const,
    displayBeforeDelay: 'no-delay',
    showAfterClosing: 'never',
    showAfterCTA: 'no-delay',
    selectedPages: ['products'],
    campaignTiming: 'immediate',
  },
}; 