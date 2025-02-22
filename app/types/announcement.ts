export type Size = 'large' | 'mid' | 'small' | 'custom';
export type BannerType = 'basic' | 'countdown' | 'email_signup' | 'multi_text';
export type CloseButtonPosition = 'right' | 'left' | 'center';
export type AnnouncementStatus = 'draft' | 'published' | 'paused' | 'ended';

// Base settings interfaces
export interface BasicSettings {
  id?: number;
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
  status: AnnouncementStatus;
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
  ctas?: CTASettings[];
}

export interface CTASettings {
  id?: number;
  ctaType: 'regular' | 'bar' | 'link' | 'none';
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
  status: AnnouncementStatus;
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

export interface CreateAnnouncementInput {
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
  isActive?: boolean;
  status: AnnouncementStatus;
  texts: Array<{
    textMessage: string;
    textColor: string;
    fontSize: number;
    customFont?: string;
    languageCode?: string;
    callToActions?: Array<{
      type: 'button' | 'text';
      text: string;
      link: string;
      bgColor: string;
      textColor: string;
      buttonRadius?: number;
      padding?: string;
    }>;
  }>;
  background?: {
    backgroundColor: string;
    backgroundPattern?: string;
    padding?: string;
  };
  form?: Array<{
    inputType: 'email' | 'text' | 'checkbox';
    placeholder?: string;
    label?: string;
    isRequired?: boolean;
    validationRegex?: string;
  }>;
  pagePatterns?: string[];
}

export type AnnouncementCallToAction = NonNullable<CreateAnnouncementInput['texts'][number]['callToActions']>[number];
export type AnnouncementFormField = NonNullable<CreateAnnouncementInput['form']>[number];


export interface KVAnnouncement {
  id: number;
  type: BannerType;
  title: string;
  shopId: string;
  size: Size;
  heightPx: number | null;
  widthPercent: number | null;
  startDate: string;
  endDate: string;
  showCloseButton: boolean | null;
  closeButtonPosition: CloseButtonPosition;
  countdownEndTime: string | null;
  timezone: string | null;
  isActive: boolean | null;
  texts: Array<{
    id: number;
    announcementId: number;
    textMessage: string;
    textColor: string;
    fontSize: number;
    customFont: string | null;
    languageCode: string | null;
    ctas: Array<{
      id: number;
      announcementTextId: number;
      type: 'text' | 'button';
      text: string;
      link: string;
      bgColor: string;
      textColor: string;
      buttonRadius: number | null;
      padding: string | null;
    }>;
  }>;
  background: {
    id: number;
    announcementId: number;
    backgroundColor: string;
    backgroundPattern: string | null;
    padding: string | null;
  } | null;
  form: Array<{
    id: number;
    announcementId: number;
    inputType: 'text' | 'email' | 'checkbox';
    placeholder: string | null;
    label: string | null;
    isRequired: boolean | null;
    validationRegex: string | null;
  }>;
}
