import { type AnnouncementKVData, type GroupedAnnouncements, type TransformedAnnouncement } from '../types/announcement';
import { bannerBackground, bannerForm, callToAction, announcementText } from '../../drizzle/schema/announcement';
import type { SQL } from 'drizzle-orm';

/**
 * Converts a pattern string to a safe key for object properties
 */
export function sanitizePatternForKey(pattern: string): string {
  return pattern.replace('/', '_0x2F_').replace('*', '_0x2A_');
}

/**
 * Converts GroupedAnnouncements to AnnouncementKVData format
 */
export function convertToKVData(groupedAnnouncements: GroupedAnnouncements): AnnouncementKVData {
  // Convert each announcement to the expected format
  const convertAnnouncement = (announcement: TransformedAnnouncement) => {
    const anyAnnouncement = announcement as any;

    // Create a KVAnnouncement object
    return {
      id: announcement.id,
      type: announcement.type,
      title: announcement.title,
      shopId: announcement.shopId,
      size: announcement.size,
      heightPx: announcement.heightPx,
      widthPercent: announcement.widthPercent,
      startType: announcement.startType,
      endType: announcement.endType,
      startDate: announcement.startDate,
      endDate: announcement.endDate,
      showCloseButton: announcement.showCloseButton,
      closeButtonPosition: announcement.closeButtonPosition,
      closeButtonColor: announcement.closeButtonColor,
      timezone: announcement.timezone,
      isActive: announcement.isActive,
      status: announcement.status,
      displayBeforeDelay: announcement.displayBeforeDelay,
      showAfterClosing: announcement.showAfterClosing,
      showAfterCTA: announcement.showAfterCTA,
      // Map createdAt/updatedAt if they exist, otherwise use current date
      createdAt: anyAnnouncement.createdAt || new Date().toISOString(),
      updatedAt: anyAnnouncement.updatedAt || new Date().toISOString(),

      // Map text settings with new KVTextSettings interface
      texts: announcement.texts.map(text => {
        const anyText = text as any;

        return {
          id: text.id,
          announcementId: text.announcementId,
          textMessage: text.textMessage,
          textColor: text.textColor,
          fontSize: text.fontSize,
          customFont: text.customFont,
          fontType: anyText.fontType || 'site',
          languageCode: text.languageCode || 'en',
          createdAt: anyText.createdAt || new Date().toISOString(),
          updatedAt: anyText.updatedAt || new Date().toISOString(),

          // Map CTA settings with new KVCTASettings interface
          ctas: (text as any).ctas.map((cta: any) => {
            const anyCtaOld = cta;
            const anyCtaNew = cta;

            return {
              id: cta.id,
              announcementTextId: text.id,
              text: cta.text,
              url: anyCtaNew.url || anyCtaOld.link || '',
              textColor: cta.textColor,
              buttonColor: anyCtaNew.buttonColor || anyCtaOld.bgColor || '',
              openInNewTab: anyCtaNew.openInNewTab || true,
              position: anyCtaNew.position || 0,
              createdAt: anyCtaNew.createdAt || new Date().toISOString(),
              updatedAt: anyCtaNew.updatedAt || new Date().toISOString()
            };
          })
        };
      }),

      // Map background settings with new KVBackgroundSettings interface
      background: announcement.background ? (() => {
        const anyBgOld = announcement.background as any;
        const anyBgNew = announcement.background as any;

        return {
          id: announcement.background.id,
          announcementId: announcement.background.announcementId,
          type: (anyBgNew.type || (anyBgOld.backgroundType === 'gradient' ? 'gradient' : 'color')) as 'color' | 'gradient' | 'image',
          color: anyBgNew.color || anyBgOld.backgroundColor || '',
          gradientStart: anyBgNew.gradientStart || null,
          gradientEnd: anyBgNew.gradientEnd || null,
          gradientDirection: anyBgNew.gradientDirection || null,
          imageUrl: anyBgNew.imageUrl || anyBgOld.backgroundPattern || null,
          imagePosition: anyBgNew.imagePosition || null,
          imageSize: anyBgNew.imageSize || null,
          createdAt: anyBgNew.createdAt || new Date().toISOString(),
          updatedAt: anyBgNew.updatedAt || new Date().toISOString()
        };
      })() : null,

      // Map form settings with new KVFormField interface
      form: announcement.form ? (() => {
        const anyFormOld = announcement.form as any;
        const anyFormNew = announcement.form as any;

        return {
          id: announcement.form.id,
          announcementId: announcement.form.announcementId,
          formType: (anyFormNew.formType || (anyFormOld.inputType === 'email' ? 'email' : 'phone')) as 'email' | 'phone' | 'both',
          buttonText: anyFormNew.buttonText || anyFormOld.label || '',
          buttonColor: anyFormNew.buttonColor || '#000000',
          buttonTextColor: anyFormNew.buttonTextColor || '#FFFFFF',
          placeholderText: anyFormNew.placeholderText || anyFormOld.placeholder || null,
          successMessage: anyFormNew.successMessage || null,
          errorMessage: anyFormNew.errorMessage || null,
          createdAt: anyFormNew.createdAt || new Date().toISOString(),
          updatedAt: anyFormNew.updatedAt || new Date().toISOString()
        };
      })() : null
    };
  };

  // Convert each group of announcements
  return {
    global: groupedAnnouncements.global.map(convertAnnouncement) as any,
    __patterns: groupedAnnouncements.__patterns,
    ...Object.fromEntries(
      Object.entries(groupedAnnouncements)
        .filter(([key]) => key !== 'global' && key !== '__patterns')
        .map(([key, value]) => [
          key,
          (value as TransformedAnnouncement[]).map(convertAnnouncement)
        ])
    )
  };
}

/**
 * Creates background values for database insertion
 */
export function createBackgroundValues(background: any, announcementId: number): Omit<typeof bannerBackground.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    backgroundColor: background.color || 'rgba(0,0,0,0)',
    backgroundType: (background.type === 'gradient' ? 'gradient' : 'solid') as 'solid' | 'gradient',
    gradientValue: background.gradientValue || (background.gradientStart && background.gradientEnd
      ? `linear-gradient(${background.gradientDirection || '90deg'}, ${background.gradientStart}, ${background.gradientEnd})`
      : undefined),
    backgroundPattern: background.imageUrl,
    padding: '10px 15px', // Default value
    announcementId
  };
}

/**
 * Creates form values for database insertion
 */
export function createFormValues(form: any, announcementId: number): Omit<typeof bannerForm.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    inputType: (form.formType === 'email' ? 'email' : 'text') as 'text' | 'email' | 'checkbox',
    placeholder: form.placeholderText,
    label: form.buttonText,
    isRequired: true,
    validationRegex: null,
    announcementId
  };
}

/**
 * Creates text values for database insertion
 */
export function createTextValues(textData: any, announcementId: number): Omit<typeof announcementText.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    textMessage: textData.textMessage,
    textColor: textData.textColor,
    fontSize: textData.fontSize,
    customFont: textData.customFont,
    fontType: textData.fontType || 'site',
    languageCode: textData.languageCode || 'en',
    announcementId
  };
}

/**
 * Creates CTA values for database insertion
 */
export function createCtaValues(cta: any, announcementTextId: number): Omit<typeof callToAction.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    type: 'button' as const,
    text: cta.text,
    link: cta.url,
    bgColor: cta.buttonColor,
    textColor: cta.textColor,
    buttonRadius: 4,
    padding: '10px 20px',
    announcementTextId
  };
} 