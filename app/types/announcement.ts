export type Size = 'large' | 'medium' | 'small' | 'custom';
export type BannerType = 'basic' | 'countdown' | 'email_signup' | 'multi_text';
export type CloseButtonPosition = 'right' | 'left' | 'center';

// Base settings interfaces
export interface BasicSettings {
  size: Size;
  sizeHeight: string;
  sizeWidth: string;
  campaignTitle: string;
  startType: 'now' | 'specific';
  endType: 'until_stop' | 'specific';
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  type: BannerType;
  isActive: boolean;
  showCloseButton?: boolean;
  closeButtonPosition: CloseButtonPosition;
  countdownEndTime?: string;
  timezone?: string;
}

export interface TextSettings {
  id?: number;
  announcementText: string;
  textColor: string;
  fontSize: number;
  fontType: 'site' | string;
  fontUrl?: string;
  languageCode?: string;
  announcementId?: number;
}

export interface CTASettings {
  id?: number;
  ctaType: 'button' | 'text';
  ctaText: string;
  ctaLink: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontType: 'site' | string;
  fontUrl?: string;
  buttonFontColor: string;
  buttonBackgroundColor: string;
  buttonRadius?: number;
  announcementTextId?: number;
}

export interface BackgroundSettings {
  id?: number;
  backgroundType: 'solid' | string;
  color1: string;
  color2: string;
  pattern: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  announcementId?: number;
}

export interface PagePattern {
  id: number;
  pattern: string;
}

export interface PagePatternLink {
  pagePatternsID: number;
  announcementsID: number;
  pagePattern: PagePattern;
}

export interface OtherSettings {
  closeButtonPosition: CloseButtonPosition;
  displayBeforeDelay: string;
  showAfterClosing: string;
  showAfterCTA: string;
  selectedPages: string[];
  campaignTiming: string;
}

// Main announcement interfaces
export interface AnnouncementBannerData {
  basic: BasicSettings;
  text: TextSettings;
  cta: CTASettings;
  background: BackgroundSettings;
  other: OtherSettings;
}

export interface Announcement {
  id: number;
  type: BannerType;
  title: string;
  shopId: string;
  size: Size;
  heightPx?: number;
  widthPercent?: number;
  startDate: string;
  endDate: string;
  showCloseButton?: boolean;
  closeButtonPosition: CloseButtonPosition;
  countdownEndTime?: string;
  timezone?: string;
  isActive: boolean;
  texts: TextSettings[];
  background?: BackgroundSettings;
  pagePatternLinks: PagePatternLink[];
}

// Form-specific types
export interface FormState extends Omit<AnnouncementBannerData, 'basic'> {
  basic: Omit<AnnouncementBannerData['basic'], 'startDate' | 'endDate'> & {
    startDate: string;
    endDate: string;
  };
}

export interface LoaderData {
  initialData: FormState;
  pages: { title: string; handle: string }[];
}

export interface FieldError {
  path: (string | number)[];
  message: string;
}

export interface ValidationState {
  errors: FieldError[];
  errorFields: Set<string>;
} 