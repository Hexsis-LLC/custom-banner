import {AnnouncementService} from './announcement.server';
import type {
  AnnouncementBannerData,
  CreateAnnouncementInput,
  DbCallToAction
} from '../types/announcement';

export class AnnouncementAction {
  private announcementService: AnnouncementService;

  constructor() {
    this.announcementService = new AnnouncementService();
  }

  private formatPadding(padding: { top: number; right: number; bottom: number; left: number }): string {
    return `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  }

  private getBackgroundData(formData: AnnouncementBannerData): CreateAnnouncementInput['background'] & {
    backgroundColor?: string;
    backgroundType?: string;
    backgroundPattern?: string;
    padding?: string;
  } {
    const { background } = formData;
    return {
      // Fields for CreateAnnouncementInput
      type: background.backgroundType === 'gradient' ? 'gradient' : 'color',
      color: background.backgroundType === 'solid' ? background.color1 : undefined,
      gradientStart: background.backgroundType === 'gradient' ? background.color1 : undefined,
      gradientEnd: background.backgroundType === 'gradient' ? background.color2 : undefined,
      gradientDirection: background.backgroundType === 'gradient' ? '90deg' : undefined,
      gradientValue: background.backgroundType === 'gradient' ? background.gradientValue : undefined,
      imageUrl: background.pattern === 'none' ? undefined : background.pattern,
      imagePosition: undefined,
      imageSize: undefined,
      
      // Original fields needed for other parts of the application
      backgroundColor: background.backgroundType === 'solid' ? background.color1 : '',
      backgroundType: background.backgroundType,
      backgroundPattern: background.pattern === 'none' ? undefined : background.pattern,
      padding: this.formatPadding(background.padding)
    };
  }

  private mapCtaType(ctaType: string): 'button' | 'text' {
    if (ctaType === 'regular') return 'button';
    return 'text';
  }

  private getTextData(formData: AnnouncementBannerData): CreateAnnouncementInput['texts'][0] & {
    callToActions?: Array<{
      type?: 'button' | 'text';
      text?: string;
      link?: string;
      bgColor?: string;
      textColor?: string;
      buttonRadius?: number;
      padding?: string;
      fontType?: string;
      fontUrl?: string;
    }>;
  } {
    return {
      textMessage: formData.text.announcementText,
      textColor: formData.text.textColor,
      fontSize: formData.text.fontSize,
      customFont: formData.text.fontType === 'site' ? undefined : formData.text.fontUrl,
      fontType: formData.text.fontType,
      languageCode: undefined,
      callToActions: formData.cta.ctaType === 'none' ? [] : [{
        // Fields for CreateAnnouncementInput
        text: formData.cta.ctaText || '',
        url: formData.cta.ctaLink || '',
        textColor: formData.cta.buttonFontColor || '',
        buttonColor: formData.cta.buttonBackgroundColor || '',
        openInNewTab: true,
        position: 0,
        
        // Original fields needed for other parts of the application
        type: this.mapCtaType(formData.cta.ctaType),
        link: formData.cta.ctaLink,
        bgColor: formData.cta.buttonBackgroundColor,
        buttonRadius: undefined,
        padding: undefined,
        fontType: formData.cta.fontType,
        fontUrl: formData.cta.fontType === 'site' ? undefined : formData.cta.fontUrl,
      }]
    };
  }

  private getStartDate(basic: AnnouncementBannerData['basic']) {
    if (basic.startType === 'now') {
      return new Date().toISOString();
    }
    
    // For specific date/time, combine the date and time
    const date = new Date(basic.startDate);
    if (basic.startTime) {
      // Parse time in 12-hour format
      const [time, period] = basic.startTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let hour24 = hours;
      
      if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
      }
      
      date.setHours(hour24, minutes, 0, 0);
    }
    return date.toISOString();
  }

  private getEndDate(basic: AnnouncementBannerData['basic']) {
    if (basic.endType === 'until_stop') {
      return new Date('2099-12-31').toISOString();
    }
    
    // For specific date/time, combine the date and time
    const date = new Date(basic.endDate);
    if (basic.endTime) {
      // Parse time in 12-hour format
      const [time, period] = basic.endTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let hour24 = hours;
      
      if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
      }
      
      date.setHours(hour24, minutes, 0, 0);
    }
    return date.toISOString();
  }

  private getCreateAnnouncementData(formData: AnnouncementBannerData, shopId: string): CreateAnnouncementInput {
    return {
      type: 'basic' as const,
      title: formData.basic.campaignTitle,
      shopId,
      size: formData.basic.size,
      heightPx: formData.basic.size === 'custom' ? parseInt(formData.basic.sizeHeight) : undefined,
      widthPercent: formData.basic.size === 'custom' ? parseInt(formData.basic.sizeWidth) : undefined,
      startType: formData.basic.startType,
      endType: formData.basic.endType,
      startDate: this.getStartDate(formData.basic),
      endDate: this.getEndDate(formData.basic),
      showCloseButton: formData.basic.showCloseButton,
      closeButtonPosition: formData.basic.closeButtonPosition,
      closeButtonColor: formData.basic.closeButtonColor,
      timezone: 'UTC',
      isActive: true,
      status: formData.basic.status,
      displayBeforeDelay: formData.other.displayBeforeDelay,
      showAfterClosing: formData.other.showAfterClosing,
      showAfterCTA: formData.other.showAfterCTA,
      texts: [this.getTextData(formData)],
      background: this.getBackgroundData(formData),
      pagePatterns: formData.other.selectedPages || ['__global']
    };
  }

  private getUpdateAnnouncementData(formData: AnnouncementBannerData): Partial<CreateAnnouncementInput> {
    return {
      type: 'basic' as const,
      title: formData.basic.campaignTitle,
      size: formData.basic.size,
      heightPx: formData.basic.size === 'custom' ? parseInt(formData.basic.sizeHeight) : undefined,
      widthPercent: formData.basic.size === 'custom' ? parseInt(formData.basic.sizeWidth) : undefined,
      startType: formData.basic.startType,
      endType: formData.basic.endType,
      startDate: this.getStartDate(formData.basic),
      endDate: this.getEndDate(formData.basic),
      showCloseButton: formData.basic.showCloseButton,
      closeButtonPosition: formData.basic.closeButtonPosition,
      closeButtonColor: formData.basic.closeButtonColor,
      timezone: 'UTC',
      isActive: true,
      status: formData.basic.status,
      displayBeforeDelay: formData.other.displayBeforeDelay,
      showAfterClosing: formData.other.showAfterClosing,
      showAfterCTA: formData.other.showAfterCTA,
      texts: [this.getTextData(formData)],
      background: this.getBackgroundData(formData),
      pagePatterns: formData.other.selectedPages || ['__global']
    };
  }

  async createBasicBannerFormData(formData: AnnouncementBannerData, shopId: string) {
    const announcement = this.getCreateAnnouncementData(formData, shopId);
    return await this.announcementService.createAnnouncement(announcement);
  }

  async updateBasicBannerFormData(id: number, formData: AnnouncementBannerData, shopId: string) {
    const announcement = this.getUpdateAnnouncementData(formData);
    return await this.announcementService.updateAnnouncement(id, announcement);
  }
}
