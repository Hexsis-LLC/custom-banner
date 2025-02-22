import { AnnouncementService } from './announcement.server';
import type { AnnouncementBannerData } from '../types/announcement';

export class AnnouncementAction {
  private announcementService: AnnouncementService;

  constructor() {
    this.announcementService = new AnnouncementService();
  }


  private formatPadding(padding: { top: number; right: number; bottom: number; left: number }): string {
    return `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  }

  private getBackgroundData(formData: AnnouncementBannerData) {
    return {
      backgroundColor: formData.background.color1,
      backgroundPattern: formData.background.pattern === 'none' ? undefined : formData.background.pattern,
      padding: undefined,
    };
  }

  private mapCtaType(ctaType: string): 'button' | 'text' {
    if (ctaType === 'regular') return 'button';
    return 'text';
  }

  private getTextData(formData: AnnouncementBannerData) {
    return {
      textMessage: formData.text.announcementText,
      textColor: formData.text.textColor,
      fontSize: formData.text.fontSize,
      customFont: formData.text.fontType === 'site' ? undefined : formData.text.fontUrl,
      languageCode: undefined,
      callToActions: formData.cta.ctaType === 'none' ? [] : [{
        type: this.mapCtaType(formData.cta.ctaType),
        text: formData.cta.ctaText,
        link: formData.cta.ctaLink,
        bgColor: formData.cta.buttonBackgroundColor,
        textColor: formData.cta.buttonFontColor,
        buttonRadius: undefined,
        padding: undefined,
      }]
    };
  }


  private getStartDate(basic: AnnouncementBannerData['basic']) {
    return basic.startType === 'now' ? new Date().toISOString() : new Date(basic.startDate).toISOString();
  }

  private getEndDate(basic: AnnouncementBannerData['basic']) {
    return basic.endType === 'until_stop' ? new Date('2099-12-31').toISOString() : new Date(basic.endDate).toISOString();
  }

  private getCreateAnnouncementData(formData: AnnouncementBannerData, shopId: string) {
    return {
      type: 'basic' as const,
      title: formData.basic.campaignTitle,
      shopId,
      size: formData.basic.size,
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
      pagePatterns: formData.other.selectedPages || ['__global']
    };
  }

  private getUpdateAnnouncementData(formData: AnnouncementBannerData) {
    return {
      type: 'basic' as const,
      title: formData.basic.campaignTitle,
      size: formData.basic.size,
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
