import type {AnnouncementBannerData, Size} from "../types/announcement";

export const TABS = [
  {id: 'basic', content: 'Basic'},
  {id: 'announcement-text', content: 'Announcement text'},
  {id: 'cta', content: 'CTA'},
  {id: 'background', content: 'Background'},
  {id: 'other', content: 'Other'},
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
    type: 'basic',
    isActive: true,
    showCloseButton: true,
    closeButtonPosition: 'right',
    status: 'draft',
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
    ctaText: 'Click Here',
    ctaLink: 'https://',
    padding: {
      top: 8,
      right: 16,
      bottom: 8,
      left: 16,
    },
    fontType: 'site',
    fontUrl: '',
    buttonFontColor: '#000000',
    buttonBackgroundColor: '#FFFFFF',
  },
  background: {
    backgroundType: 'solid',
    color1: '#000000',
    color2: '',
    pattern: 'none',
    padding: {
      top: 12,
      right: 16,
      bottom: 12,
      left: 16,
    },
  },
  other: {
    closeButtonPosition: 'right',
    displayBeforeDelay: 'no-delay',
    showAfterClosing: 'never',
    showAfterCTA: 'no-delay',
    selectedPages: ['__global'],
    campaignTiming: 'immediate',
  },
};
