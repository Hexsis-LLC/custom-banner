import type {
  AnnouncementBannerData,
  CloseButtonPosition, BackgroundSettings, OtherSettings
} from "./announcement";
import type { CountdownFieldData } from "../schemas/schemas/CountdownFieldSchema";
import {BasicInfoFieldData} from "../schemas/schemas/BasicInfoFieldSchema";
import {AnnouncementTextFieldData} from "../schemas/schemas/AnnouncementTextFieldSchema";
import {CTAButtonFieldData} from "../schemas/schemas/CTAButtonFieldSchema";
import {BackgroundFieldData} from "../schemas/schemas/BackgroundFieldSchema";
import {OtherFieldData} from "../schemas/schemas/OtherFieldSchema";

// Form-specific version of AnnouncementBannerData
export type FormAnnouncementBannerData = Omit<AnnouncementBannerData, 'basic'> & {
  basic: Omit<AnnouncementBannerData['basic'], 'closeButtonPosition'> & {
    closeButtonPosition: CloseButtonPosition;
    closeButtonColor: string;
  };
  countdown?: CountdownFieldData;
};

/*export interface FormBasicSettings extends Omit<AnnouncementBannerData['basic'], 'closeButtonPosition'> {
  closeButtonPosition: CloseButtonPosition;
  closeButtonColor: string;
}*/

export interface FormState {
  basic: BasicInfoFieldData;
  text: AnnouncementTextFieldData;
  cta: CTAButtonFieldData;
  background: BackgroundFieldData;
  countdown?: CountdownFieldData;
  other: OtherFieldData;
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
export interface FormError {
  path: string[];
  message: string,
}
/*
export interface FormCountdownSettings {
  timerType: 'till_end_date' | 'duration' | 'daily_schedule';
  timeFormat: string;
  showDays: boolean;
  endDateTime?: string;
  endTime?: string;
  durationDays?: number;
  durationHours?: number;
  durationMinutes?: number;
  durationSeconds?: number;
  scheduleTime?: string;
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
}
*/
