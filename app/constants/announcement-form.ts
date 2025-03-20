import type { Size, FontType, CloseButtonPosition } from "../types/announcement";
import type { FormAnnouncementBannerData } from "../types/announcement-form";

export const TABS = [
  {id: 'basic', content: 'Basic'},
  {id: 'announcement-text', content: 'Announcement text'},
  {id: 'cta', content: 'CTA'},
  {id: 'background', content: 'Background'},
  {id: 'other', content: 'Other'},
];

export const DEFAULT_INITIAL_DATA: FormAnnouncementBannerData = {
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
    closeButtonPosition: 'right' as CloseButtonPosition,
    closeButtonColor: 'rgb(255, 255, 255)',
    status: 'draft',
  },
  text: {
    announcementText: '',
    textColor: '#FFFFFF',
    fontSize: 16,
    fontType: 'site' as FontType,
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
    type: 'button',
    text: 'Click Here',
    link: 'https://',
    bgColor: '#FFFFFF',
    textColor: '#000000',
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
    backgroundColor: '#000000',
    backgroundPattern: null,
  },
  countdown: {
    timerType: 'till_end_date',
    timeFormat: 'HH:mm:ss',
    showDays: true,
    endDateTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    afterTimerEnds: {
      action: 'hide',
    }
  },
  other: {
    displayBeforeDelay: 'none',
    showAfterClosing: 'none',
    showAfterCTA: 'none',
    selectedPages: ['__global'],
    campaignTiming: 'immediate',
  },
};
