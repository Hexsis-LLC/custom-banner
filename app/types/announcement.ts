import {
  announcements,
  announcementText,
  bannerBackground,
  bannerForm,
  callToAction,
  pagePatterns,
  announcementsXPagePatterns
} from '../../drizzle/schema/announcement';
import type { InferSelectModel } from 'drizzle-orm';

export type BannerSize = 'large' | 'mid' | 'small' | 'custom';
export type BannerType = 'basic' | 'countdown' | 'email_signup' | 'multi_text';
export type CloseButtonPosition = 'right' | 'left' | 'center' | 'none';
export type AnnouncementStatus = 'draft' | 'published' | 'paused' | 'ended';
export type CTAType = 'text' | 'button';
export type FontType = 'site' | 'dynamic'| 'custom';

// Infer types directly from Drizzle schema
export type DbAnnouncement = InferSelectModel<typeof announcements>;
export type DbAnnouncementText = InferSelectModel<typeof announcementText>;
export type DbBannerBackground = InferSelectModel<typeof bannerBackground>;
export type DbBannerForm = InferSelectModel<typeof bannerForm>;
export type DbCallToAction = InferSelectModel<typeof callToAction>;
export type DbPagePattern = InferSelectModel<typeof pagePatterns>;
export type DbAnnouncementPagePatternLink = InferSelectModel<typeof announcementsXPagePatterns>;

// Base interfaces for common fields
interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface BaseNullableFields {
  heightPx: number | null;
  widthPercent: number | null;
  showCloseButton: boolean | null;
  countdownEndTime: string | null;
  timezone: string | null;
  isActive: boolean | null;
}


interface BaseBackground {
  backgroundColor: string;
  backgroundPattern: string | null;
}

// Form-specific interfaces
export interface BasicSettings {
  id?: number;
  size: BannerSize;
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
  closeButtonColor: string;
  countdownEndTime?: string;
  timezone?: string;
  status: AnnouncementStatus;
}

export interface TextEntry {
  id: string;
  announcementText: string;
  textColor: string;
  fontSize: number;
  fontType: FontType;
  fontUrl?: string;
  languageCode?: string;
}

export interface TextSettings {
  id?: number;
  announcementText: string;
  textColor: string;
  fontSize: number;
  fontType: FontType;
  fontUrl?: string;
  languageCode?: string;
  announcementId?: number;
  ctas?: CTASettings[];
  customFont?: string;
  textEntries?: TextEntry[];
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
  fontType: FontType;
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
  backgroundType: 'solid' | 'gradient';
  color1: string;
  color2: string;
  gradientValue?: string;
  pattern: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  announcementId?: number;
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
  size: BannerSize;
  startType: 'now' | 'specific';
  endType: 'until_stop' | 'specific';
  startDate: string;
  endDate: string;
  closeButtonPosition: CloseButtonPosition;
  closeButtonColor: string;
  status: AnnouncementStatus;
  texts: DbAnnouncementText[];
  background?: DbBannerBackground;
  pagePatternLinks: PagePatternLink[];
}

// KV Store types
export interface KVAnnouncement extends BaseEntity {
  type: BannerType;
  title: string;
  shopId: string;
  size: BannerSize;
  heightPx: number | null;
  widthPercent: number | null;
  startType: 'now' | 'specific';
  endType: 'until_stop' | 'specific';
  startDate: string;
  endDate: string;
  showCloseButton: boolean | null;
  closeButtonPosition: CloseButtonPosition;
  closeButtonColor: string;
  timezone: string | null;
  isActive: boolean | null;
  status: AnnouncementStatus;
  displayBeforeDelay: string | null;
  showAfterClosing: string | null;
  showAfterCTA: string | null;
  texts: Array<KVTextSettings>;
  background: KVBackgroundSettings | null;
  form: KVFormField | null;
}

export interface KVTextSettings {
  id: number;
  announcementId: number;
  textMessage: string;
  textColor: string;
  fontSize: number;
  customFont: string | null;
  fontType: string;
  languageCode: string;
  createdAt: string;
  updatedAt: string;
  ctas: KVCTASettings[];
}

export interface KVCTASettings {
  id: number;
  announcementTextId: number;
  text: string;
  url: string;
  textColor: string;
  buttonColor: string;
  openInNewTab: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface KVBackgroundSettings {
  id: number;
  announcementId: number;
  type: 'color' | 'gradient' | 'image';
  color: string;
  gradientStart: string | null;
  gradientEnd: string | null;
  gradientDirection: string | null;
  imageUrl: string | null;
  imagePosition: string | null;
  imageSize: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KVFormField {
  id: number;
  announcementId: number;
  formType: 'email' | 'phone' | 'both';
  buttonText: string;
  buttonColor: string;
  buttonTextColor: string;
  placeholderText: string | null;
  successMessage: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
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
  countdown?: {
    timerType: 'till_end_date' | 'duration' | 'daily_schedule';
    timeFormat: string;
    showDays: boolean;
    endDateTime?: string;
    durationDays?: number;
    durationHours?: number;
    durationMinutes?: number;
    durationSeconds?: number;
    dailyStartTime?: string;
    dailyEndTime?: string;
    afterTimerEnds?: {
      action: 'hide' | 'show_zeros' | 'create_announcement';
      nextAnnouncementId?: string;
      message?: string;
      textColor?: string;
      fontSize?: number;
      ctaType?: 'link' | 'button' | 'none';
      ctaText?: string;
      ctaLink?: string;
      buttonBackground?: string;
      buttonTextColor?: string;
      fontType?: 'site' | 'dynamic' | 'custom';
      fontUrl?: string;
      ctaFontType?: 'site' | 'dynamic' | 'custom';
      ctaFontUrl?: string;
      childAnnouncementId?: string;
    };
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
  size: BannerSize;
  heightPx?: number;
  widthPercent?: number;
  startType: 'now' | 'specific';
  endType: 'until_stop' | 'specific';
  startDate: string;
  endDate: string;
  showCloseButton?: boolean;
  closeButtonPosition: CloseButtonPosition;
  closeButtonColor: string;
  timezone?: string;
  isActive?: boolean;
  status: AnnouncementStatus;
  displayBeforeDelay?: string;
  showAfterClosing?: string;
  showAfterCTA?: string;
  childAnnouncementId?: number;
  texts: Array<{
    textMessage: string;
    textColor: string;
    fontSize: number;
    customFont?: string;
    fontType?: string;
    languageCode?: string;
    callToActions?: Array<{
      text: string;
      url: string;
      textColor: string;
      buttonColor: string;
      openInNewTab?: boolean;
      position?: number;
    }>;
  }>;
  background?: {
    type: 'color' | 'gradient' | 'image';
    color?: string;
    gradientStart?: string;
    gradientEnd?: string;
    gradientDirection?: string;
    gradientValue?: string;
    imageUrl?: string;
    imagePosition?: string;
    imageSize?: string;
  };
  form?: {
    formType: 'email' | 'phone' | 'both';
    buttonText: string;
    buttonColor: string;
    buttonTextColor: string;
    placeholderText?: string;
    successMessage?: string;
    errorMessage?: string;
  };
  pagePatterns?: string[];
}

// Use the Drizzle types directly instead of duplicating them
export type TransformedAnnouncement = Omit<DbAnnouncement & {
  texts: DbAnnouncementText[];
  background: DbBannerBackground | null;
  form: DbBannerForm | null;
  pagePatternLinks: PagePatternLink[];
}, 'pagePatternLinks'>;

export interface GroupedAnnouncements {
  global: TransformedAnnouncement[];
  __patterns: string[];
  [key: string]: TransformedAnnouncement[] | string[];
}

export interface OtherSettings {
  displayBeforeDelay: string;
  showAfterClosing: string;
  showAfterCTA: string;
  selectedPages: string[];
  campaignTiming: string;
}

// Use the Drizzle type directly
export interface PagePatternLink {
  pagePatternsID: number;
  announcementsID: number;
  pagePattern: DbPagePattern;
}
