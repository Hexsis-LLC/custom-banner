import type { FieldError } from "../types/announcement-form";

export const getTabNameFromPath = (path: (string | number)[]): string => {
  const section = path[0].toString();
  const tabMap: Record<string, string> = {
    basic: 'Basic Settings',
    text: 'Announcement Text',
    cta: 'Call to Action',
    background: 'Background',
    other: 'Other Settings',
  };
  return tabMap[section] || section;
};

export const getFieldName = (path: (string | number)[]): string => {
  const fieldMap: Record<string, string> = {
    size: 'Banner Size',
    sizeHeight: 'Height',
    sizeWidth: 'Width',
    campaignTitle: 'Campaign Title',
    startDate: 'Start Date',
    endDate: 'End Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    announcementText: 'Announcement Text',
    textColor: 'Text Color',
    fontSize: 'Font Size',
    fontType: 'Font Type',
    ctaType: 'CTA Type',
    ctaText: 'CTA Text',
    ctaLink: 'CTA Link',
    buttonFontColor: 'Button Text Color',
    buttonBackgroundColor: 'Button Background Color',
    backgroundType: 'Background Type',
    color1: 'Primary Color',
    color2: 'Secondary Color',
    pattern: 'Pattern',
    closeButtonPosition: 'Close Button Position',
    displayBeforeDelay: 'Display Delay',
    showAfterClosing: 'Show After Closing',
    showAfterCTA: 'Show After CTA Click',
    selectedPages: 'Selected Pages',
    campaignTiming: 'Campaign Timing',
  };
  const field = path[path.length - 1].toString();
  return fieldMap[field] || field;
};

export const getErrorMessage = (error: FieldError): string => {
  const tabName = getTabNameFromPath(error.path);
  const fieldName = getFieldName(error.path);
  
  if (error.message.includes('Required')) {
    return `${fieldName} is required in ${tabName} tab`;
  }
  
  if (error.message.includes('Invalid url')) {
    return `${fieldName} must be a valid URL in ${tabName} tab`;
  }
  
  if (error.message.includes('min')) {
    return `${fieldName} is too small in ${tabName} tab`;
  }
  
  if (error.message.includes('max')) {
    return `${fieldName} is too large in ${tabName} tab`;
  }

  if (error.message.includes('date')) {
    return `Please enter a valid date for ${fieldName} in ${tabName} tab`;
  }

  return `${fieldName} in ${tabName} tab: ${error.message.charAt(0).toUpperCase() + error.message.slice(1)}`;
}; 