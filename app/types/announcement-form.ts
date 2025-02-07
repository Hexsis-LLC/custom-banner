import type { AnnouncementBannerData } from "./announcement";

export interface FormState extends Omit<AnnouncementBannerData, 'basic'> {
  basic: Omit<AnnouncementBannerData['basic'], 'startDate' | 'endDate'> & {
    startDate: string;
    endDate: string;
  };
}

export interface LoaderData {
  initialData: FormState;
  fonts: { family: string }[];
}

export interface FieldError {
  path: (string | number)[];
  message: string;
}

export interface ValidationState {
  errors: FieldError[];
  errorFields: Set<string>;
} 