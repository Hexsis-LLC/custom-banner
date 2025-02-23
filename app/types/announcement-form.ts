import type { AnnouncementBannerData, Size, BannerType, AnnouncementStatus } from "./announcement";

// Extend CloseButtonPosition to include 'none'
export type FormCloseButtonPosition = 'right' | 'left' | 'center' | 'none';

// Form-specific version of AnnouncementBannerData
export type FormAnnouncementBannerData = Omit<AnnouncementBannerData, 'basic'> & {
  basic: Omit<AnnouncementBannerData['basic'], 'closeButtonPosition'> & {
    closeButtonPosition: FormCloseButtonPosition;
  };
};

export interface FormState {
  basic: {
    id?: number;
    size: Size;
    sizeHeight: string;
    sizeWidth: string;
    campaignTitle: string;
    startType: 'now' | 'specific';
    endType: 'until_stop' | 'specific';
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    type: BannerType;
    isActive: boolean;
    showCloseButton: boolean;
    closeButtonPosition: FormCloseButtonPosition;
    status?: AnnouncementStatus;
    countdownEndTime?: string;
    timezone?: string;
  };
  text: {
    announcementText: string;
    textColor: string;
    fontSize: number;
    fontType: string;
    fontUrl?: string;
    textEntries?: Array<{
      id: string;
      announcementText: string;
      textColor: string;
      fontSize: number;
      fontType: string;
      fontUrl?: string;
      languageCode?: string;
    }>;
    languageCode?: string;
  };
  cta: {
    ctaType: 'regular' | 'bar' | 'link' | 'none';
    ctaText?: string;
    ctaLink?: string;
    buttonFontColor?: string;
    buttonBackgroundColor?: string;
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    fontType: string;
    fontUrl?: string;
    type?: 'button' | 'text';
    text?: string;
    link?: string;
    bgColor?: string;
    textColor?: string;
  };
  background: {
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
    backgroundColor?: string;
    backgroundPattern?: string | null;
  };
  other: {
    closeButtonPosition: FormCloseButtonPosition;
    displayBeforeDelay: string;
    showAfterClosing: string;
    showAfterCTA: string;
    selectedPages: string[];
    campaignTiming: string;
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

export type ActionData = {
  errors?: string[];
  success?: boolean;
};
