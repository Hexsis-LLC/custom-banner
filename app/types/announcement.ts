export type Size = 'large' | 'medium' | 'small' | 'custom';

export interface BasicSettings {
  size: Size;
  sizeHeight: string;
  sizeWidth: string;
  campaignTitle: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
}

export interface TextSettings {
  announcementText: string;
  textColor: string;
  fontSize: number;
  fontType: 'site' | string;
}

export interface CTASettings {
  ctaType: 'regular' | string;
  ctaText: string;
  ctaLink: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontType: 'site' | string;
  buttonFontColor: string;
  buttonBackgroundColor: string;
}

export interface BackgroundSettings {
  backgroundType: 'solid' | string;
  color1: string;
  color2: string;
  color3: string;
  pattern: string;
  paddingRight: number;
}

export interface OtherSettings {
  closeButtonPosition: 'right' | 'left';
  displayBeforeDelay: string;
  showAfterClosing: string;
  showAfterCTA: string;
  selectedPages: string[];
  campaignTiming: string;
}

export interface AnnouncementBannerData {
  basic: BasicSettings;
  text: TextSettings;
  cta: CTASettings;
  background: BackgroundSettings;
  other: OtherSettings;
} 