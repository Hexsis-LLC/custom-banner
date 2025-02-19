import { AnnouncementService } from './announcement.server';
import type { AnnouncementBannerData } from '../types/announcement';

export class AnnouncementAction {
  private announcementService: AnnouncementService;

  constructor() {
    this.announcementService = new AnnouncementService();
  }

  private mapSize(size: 'large' | 'medium' | 'small' | 'custom'): 'large' | 'small' | 'custom' {
    if (size === 'medium') return 'small';
    return size;
  }

  private formatPadding(padding: { top: number; right: number; bottom: number; left: number }): string {
    return `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  }

  private getBackgroundData(formData: AnnouncementBannerData) {
    return {
      backgroundColor: formData.background.backgroundType === 'gradient'
        ? `linear-gradient(${formData.background.color1}, ${formData.background.color2})`
        : formData.background.color1,
      backgroundPattern: formData.background.pattern !== 'none' ? formData.background.pattern : undefined,
      padding: this.formatPadding(formData.background.padding),
    };
  }

  private getTextData(formData: AnnouncementBannerData) {
    return {
      textMessage: formData.text.announcementText,
      textColor: formData.text.textColor,
      fontSize: formData.text.fontSize,
      customFont: formData.text.fontType !== 'site' ? formData.text.fontUrl : undefined,
      languageCode: 'en',
      callToActions: this.getCallToActions(formData.cta),
    };
  }

  private getCallToActions(cta: AnnouncementBannerData['cta']) {
    if (cta.ctaType === 'none') return undefined;

    return [{
      type: this.mapCtaType(cta.ctaType),
      text: cta.ctaText || '',
      link: cta.ctaLink || '',
      bgColor: cta.buttonBackgroundColor || '#000000',
      textColor: cta.buttonFontColor || '#FFFFFF',
      buttonRadius: 4,
      padding: this.formatPadding(cta.padding),
    }];
  }

  private getCreateAnnouncementData(formData: AnnouncementBannerData, shopId: string) {
    return {
      type: 'basic' as const,
      title: formData.basic.campaignTitle,
      shopId,
      size: this.mapSize(formData.basic.size),
      heightPx: formData.basic.size === 'custom' ? parseInt(formData.basic.sizeHeight) : undefined,
      widthPercent: formData.basic.size === 'custom' ? parseInt(formData.basic.sizeWidth) : undefined,
      startDate: this.getStartDate(formData.basic),
      endDate: this.getEndDate(formData.basic),
      showCloseButton: true,
      closeButtonPosition: formData.other.closeButtonPosition,
      timezone: 'UTC',
      isActive: true,
      status: formData.basic.status,
      texts: [this.getTextData(formData)],
      background: this.getBackgroundData(formData),
      pagePatternLinks: [],
    };
  }

  private getUpdateAnnouncementData(formData: AnnouncementBannerData) {
    return {
      type: 'basic' as const,
      title: formData.basic.campaignTitle,
      size: this.mapSize(formData.basic.size),
      heightPx: formData.basic.size === 'custom' ? parseInt(formData.basic.sizeHeight) : undefined,
      widthPercent: formData.basic.size === 'custom' ? parseInt(formData.basic.sizeWidth) : undefined,
      startDate: this.getStartDate(formData.basic),
      endDate: this.getEndDate(formData.basic),
      showCloseButton: true,
      closeButtonPosition: formData.other.closeButtonPosition,
      timezone: 'UTC',
      isActive: true,
      status: formData.basic.status,
      texts: [this.getTextData(formData)],
      background: this.getBackgroundData(formData),
    };
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

    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString();
  }

  private mapCtaType(ctaType: string): 'button' | 'text' {
    return ctaType === 'text' ? 'text' : 'button';
  }

  async createBasicBannerFormData(formData: AnnouncementBannerData, shopId: string) {
    const announcement = this.getCreateAnnouncementData(formData, shopId);
    return await this.announcementService.createAnnouncement(announcement);
  }

  async updateBasicBannerFormData(id: number, formData: AnnouncementBannerData, shopId: string) {
    const announcement = this.getUpdateAnnouncementData(formData);
    const result = await this.announcementService.updateAnnouncement(id, announcement);
    await this.announcementService.updateKv(shopId);
    return result;
  }
}
