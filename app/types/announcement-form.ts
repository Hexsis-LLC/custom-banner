import type { 
  AnnouncementBannerData, 
  Size, 
  BannerType, 
  AnnouncementStatus, 
  FontType,
  CloseButtonPosition
} from "./announcement";

// Form-specific version of AnnouncementBannerData
export type FormAnnouncementBannerData = Omit<AnnouncementBannerData, 'basic'> & {
  basic: Omit<AnnouncementBannerData['basic'], 'closeButtonPosition'> & {
    closeButtonPosition: CloseButtonPosition;
    closeButtonColor: string;
  };
  countdown?: {
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
    };
  };
};

export interface FormBasicSettings extends Omit<AnnouncementBannerData['basic'], 'closeButtonPosition'> {
  closeButtonPosition: CloseButtonPosition;
  closeButtonColor: string;
}

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
    closeButtonPosition: CloseButtonPosition;
    closeButtonColor: string;
    status?: AnnouncementStatus;
    countdownEndTime?: string;
    timezone?: string;
  };
  text: {
    announcementText: string;
    textColor: string;
    fontSize: number;
    fontType: FontType;
    fontUrl?: string;
    textEntries?: Array<{
      id: string;
      announcementText: string;
      textColor: string;
      fontSize: number;
      fontType: FontType;
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
    gradientValue?: string;
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
  countdown?: {
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
    };
  };
  other: {
    closeButtonPosition: CloseButtonPosition;
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
  };
}
