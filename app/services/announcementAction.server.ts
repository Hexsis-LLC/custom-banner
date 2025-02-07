import { AnnouncementService } from './announcement.server';
import type { AnnouncementBannerData } from '../types/announcement';
import type { NewAnnouncement } from './announcement.server';

export class AnnouncementAction {
  private announcementService: AnnouncementService;

  constructor() {
    this.announcementService = new AnnouncementService();
  }

  private mapSize(size: 'large' | 'medium' | 'small' | 'custom'): 'large' | 'small' | 'mid' | 'custom' {
    if (size === 'medium') return 'mid';
    return size;
  }

  async createFromFormData(formData: AnnouncementBannerData, shopId: string) {
    // Transform the form data into the database model
    const announcement: NewAnnouncement = {
      type: 'basic', // Default to basic type for now
      title: formData.basic.campaignTitle,
      shopId,
      size: this.mapSize(formData.basic.size),
      heightPx: formData.basic.size === 'custom' ? parseInt(formData.basic.sizeHeight) : undefined,
      widthPercent: formData.basic.size === 'custom' ? parseInt(formData.basic.sizeWidth) : undefined,
      startDate: this.getStartDate(formData.basic),
      endDate: this.getEndDate(formData.basic),
      showCloseButton: true,
      closeButtonPosition: formData.other.closeButtonPosition,
      timezone: 'UTC', // Default to UTC, can be made configurable
      isActive: true,
      texts: [
        {
          textMessage: formData.text.announcementText,
          textColor: formData.text.textColor,
          fontSize: formData.text.fontSize,
          customFont: formData.text.fontType !== 'site' ? formData.text.fontUrl : undefined,
          languageCode: 'en', // Default to English, can be made configurable
          callToActions: formData.cta.ctaType !== 'none' ? [
            {
              type: this.mapCtaType(formData.cta.ctaType),
              text: formData.cta.ctaText || '',
              link: formData.cta.ctaLink || '',
              bgColor: formData.cta.buttonBackgroundColor || '#000000',
              textColor: formData.cta.buttonFontColor || '#FFFFFF',
              buttonRadius: 4, // Default value, can be made configurable
              padding: this.formatPadding(formData.cta.padding),
            }
          ] : undefined,
        }
      ],
      background: {
        backgroundColor: formData.background.backgroundType === 'gradient' 
          ? `linear-gradient(${formData.background.color1}, ${formData.background.color2})`
          : formData.background.color1,
        backgroundPattern: formData.background.pattern !== 'none' ? formData.background.pattern : undefined,
        padding: this.formatPadding(formData.background.padding),
      },
      pagePatterns: formData.other.selectedPages,
    };

    // Create the announcement using the service
    return await this.announcementService.createAnnouncement(announcement);
  }

  private getStartDate(basic: AnnouncementBannerData['basic']): string {
    if (basic.startType === 'now') {
      return new Date().toISOString();
    }
    
    if (basic.startDate && basic.startTime) {
      const date = new Date(basic.startDate);
      const [hours, minutes] = basic.startTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      return date.toISOString();
    }
    
    return new Date().toISOString();
  }

  private getEndDate(basic: AnnouncementBannerData['basic']): string {
    if (basic.endType === 'until_stop') {
      // Set a far future date (e.g., 1 year from now)
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date.toISOString();
    }
    
    if (basic.endDate && basic.endTime) {
      const date = new Date(basic.endDate);
      const [hours, minutes] = basic.endTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      return date.toISOString();
    }
    
    // Default to 30 days from now if no valid end date is provided
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString();
  }

  private mapCtaType(ctaType: string): 'button' | 'text' {
    switch (ctaType) {
      case 'regular':
      case 'bar':
        return 'button';
      case 'link':
        return 'text';
      default:
        return 'button';
    }
  }

  private formatPadding(padding: { top: number; right: number; bottom: number; left: number }): string {
    return `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  }
} 