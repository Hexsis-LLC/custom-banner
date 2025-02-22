export type Size = 'large' | 'mid' | 'small' | 'custom';
export type BannerType = 'basic' | 'countdown' | 'email_signup' | 'multi_text';
export type CloseButtonPosition = 'right' | 'left' | 'center';
export type AnnouncementStatus = 'draft' | 'published' | 'paused' | 'ended';
export type CTAType = 'text' | 'button';

// Base interfaces for common fields
interface BaseEntity {
  id: number;
}

interface BaseNullableFields {
  heightPx: number | null;
  widthPercent: number | null;
  showCloseButton: boolean | null;
  countdownEndTime: string | null;
  timezone: string | null;
  isActive: boolean | null;
}

interface BaseText {
  textMessage: string;
  textColor: string;
  fontSize: number;
  customFont: string | null;
  languageCode: string | null;
}

interface BaseCTA {
  type: CTAType;
  text: string;
  link: string;
  bgColor: string;
  textColor: string;
  buttonRadius: number | null;
  padding: string | null;
}

interface BaseBackground {
  backgroundColor: string;
  backgroundPattern: string | null;
}

interface BaseForm {
  inputType: 'text' | 'email' | 'checkbox';
  placeholder: string | null;
  label: string | null;
  isRequired: boolean | null;
  validationRegex: string | null;
}

// Form-specific interfaces
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
  heightPx?: number;
  widthPercent?: number;
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
  customFont?: string;
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
  type: CTAType;
  text: string;
  link: string;
  bgColor: string;
  textColor: string;
}

export interface BackgroundSettings extends BaseBackground {
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

// Database-specific interfaces
export interface DatabaseTextSettings extends BaseEntity, BaseText {
  announcementId: number;
  ctas: Array<DatabaseCTASettings>;
}

export interface DatabaseCTASettings extends BaseEntity, BaseCTA {
  announcementTextId: number;
}

export interface DatabaseBackgroundSettings extends BaseEntity, BaseBackground {
  announcementId: number;
  padding: string | null;
}

export interface DatabaseFormField extends BaseEntity, BaseForm {
  announcementId: number;
}

// Main announcement interfaces
export interface AnnouncementBannerData {
  basic: BasicSettings;
  text: TextSettings;
  cta: CTASettings;
  background: BackgroundSettings;
  other: OtherSettings;
}

export interface Announcement extends BaseEntity, BaseNullableFields {
  type: BannerType;
  title: string;
  shopId: string;
  size: Size;
  startDate: string;
  endDate: string;
  closeButtonPosition: CloseButtonPosition;
  status: AnnouncementStatus;
  texts: DatabaseTextSettings[];
  background?: DatabaseBackgroundSettings;
  pagePatternLinks: PagePatternLink[];
}

// KV Store types
export interface KVAnnouncement extends BaseEntity, BaseNullableFields {
  type: BannerType;
  title: string;
  shopId: string;
  size: Size;
  startDate: string;
  endDate: string;
  closeButtonPosition: CloseButtonPosition;
  texts: Array<DatabaseTextSettings>;
  background: DatabaseBackgroundSettings | null;
  form: Array<DatabaseFormField>;
}

export interface AnnouncementKVData {
  global: KVAnnouncement[];
  __patterns: string[];
  [key: string]: KVAnnouncement[] | string[];
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
      type: CTAType;
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
  form?: Array<BaseForm>;
  pagePatterns?: string[];
}

export type DatabaseAnnouncement = Omit<Announcement, 'heightPx' | 'widthPercent' | 'showCloseButton' | 'countdownEndTime' | 'timezone' | 'isActive' | 'texts' | 'background'> & {
  heightPx: number | null;
  widthPercent: number | null;
  showCloseButton: boolean | null;
  countdownEndTime: string | null;
  timezone: string | null;
  isActive: boolean | null;
  texts: DatabaseTextSettings[];
  background: DatabaseBackgroundSettings | null;
  form: DatabaseFormField[];
};

export type TransformedAnnouncement = Omit<DatabaseAnnouncement, 'pagePatternLinks'>;

export interface GroupedAnnouncements {
  global: TransformedAnnouncement[];
  __patterns: string[];
  [key: string]: TransformedAnnouncement[] | string[];
}

export interface OtherSettings {
  closeButtonPosition: CloseButtonPosition;
  displayBeforeDelay: string;
  showAfterClosing: string;
  showAfterCTA: string;
  selectedPages: string[];
  campaignTiming: string;
}

export interface PagePattern extends BaseEntity {
  pattern: string;
}

export interface PagePatternLink {
  pagePatternsID: number;
  announcementsID: number;
  pagePattern: PagePattern;
}
