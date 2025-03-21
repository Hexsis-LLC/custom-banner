import {AnnouncementService} from './announcement.server';
import type {
  AnnouncementBannerData,
  CreateAnnouncementInput,
  DbCallToAction,
  FormState,
  BasicSettings,
} from '../types/announcement';
import { afterTimerEnds, countdownSettings, announcements } from '../../drizzle/schema/announcement';
import { db } from '../db.server';
import { eq } from 'drizzle-orm';

export class AnnouncementAction {
  private announcementService: AnnouncementService;

  constructor() {
    this.announcementService = new AnnouncementService();
  }

  private formatPadding(padding: { top: number; right: number; bottom: number; left: number }): string {
    return `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  }

  private getBackgroundData(formData: AnnouncementBannerData | FormState): CreateAnnouncementInput['background'] & {
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

  private getTextData(formData: AnnouncementBannerData | FormState): CreateAnnouncementInput['texts'][0] & {
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

  private getStartDate(basic: FormState['basic'] | BasicSettings): string {
    if (basic.startType === 'now') {
      return new Date().toISOString();
    }
    
    // For FormState, the startDate is already a string
    if (typeof basic.startDate === 'string') {
      const date = new Date(basic.startDate);
      
      // Parse time in 12-hour format
      if (basic.startTime) {
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
    
    // For BasicSettings, startDate is a Date object
    if (basic.startDate instanceof Date) {
      // If it has time, combine the date and time
      if (basic.startTime) {
        const date = new Date(basic.startDate);
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
        return date.toISOString();
      }
      
      return basic.startDate.toISOString();
    }
    
    // Fallback
    return new Date().toISOString();
  }

  private getEndDate(basic: FormState['basic'] | BasicSettings): string {
    if (basic.endType === 'until_stop') {
      return new Date('2099-12-31').toISOString();
    }
    
    // For FormState, the endDate is already a string
    if (typeof basic.endDate === 'string') {
      const date = new Date(basic.endDate);
      
      // Parse time in 12-hour format
      if (basic.endTime) {
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
    
    // For BasicSettings, endDate is a Date object
    if (basic.endDate instanceof Date) {
      // If it has time, combine the date and time
      if (basic.endTime) {
        const date = new Date(basic.endDate);
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
        return date.toISOString();
      }
      
      return basic.endDate.toISOString();
    }
    
    // Fallback
    return new Date('2099-12-31').toISOString();
  }

  private getCreateAnnouncementData(formData: FormState, shopId: string): CreateAnnouncementInput {
    // Default to basic announcement type
    const type = formData.basic.type || 'basic';
    
    return {
      type: type as any,
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
      status: formData.basic.status || 'draft',
      displayBeforeDelay: formData.other.displayBeforeDelay,
      showAfterClosing: formData.other.showAfterClosing,
      showAfterCTA: formData.other.showAfterCTA,
      texts: [this.getTextData(formData)],
      background: this.getBackgroundData(formData),
      pagePatterns: formData.other.selectedPages || ['__global']
    };
  }

  private getUpdateAnnouncementData(formData: FormState): Partial<CreateAnnouncementInput> {
    // Default to basic announcement type
    const type = formData.basic.type || 'basic';
    
    return {
      type: type as any,
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
      status: formData.basic.status || 'draft',
      displayBeforeDelay: formData.other.displayBeforeDelay,
      showAfterClosing: formData.other.showAfterClosing,
      showAfterCTA: formData.other.showAfterCTA,
      texts: [this.getTextData(formData)],
      background: this.getBackgroundData(formData),
      pagePatterns: formData.other.selectedPages || ['__global']
    };
  }

  // Legacy methods (keeping for backward compatibility)
  async createBasicBannerFormData(formData: AnnouncementBannerData, shopId: string) {
    // Convert AnnouncementBannerData to FormState
    const formStateData: FormState = {
      ...formData as any,
      basic: {
        ...formData.basic,
        startDate: formData.basic.startDate.toISOString(),
        endDate: formData.basic.endDate.toISOString(),
      }
    };
    return this.createBannerFormData(formStateData, shopId);
  }

  async updateBasicBannerFormData(id: number, formData: AnnouncementBannerData, shopId: string) {
    // Convert AnnouncementBannerData to FormState
    const formStateData: FormState = {
      ...formData as any,
      basic: {
        ...formData.basic,
        startDate: formData.basic.startDate.toISOString(),
        endDate: formData.basic.endDate.toISOString(),
      }
    };
    return this.updateBannerFormData(id, formStateData, shopId);
  }

  async createBannerFormData(formData: FormState, shopId: string) {
    const announcementData = this.getCreateAnnouncementData(formData, shopId);
    const announcement = await this.announcementService.createAnnouncement(announcementData);
    
    // Handle countdown settings if this is a countdown type announcement
    if (formData.basic.type === 'countdown' && formData.countdown) {
      await this.addCountdownSettings(announcement.id, formData.countdown);
    }
    
    return announcement;
  }

  async updateBannerFormData(id: number, formData: FormState, shopId: string) {
    const announcementData = this.getUpdateAnnouncementData(formData);
    const announcement = await this.announcementService.updateAnnouncement(id, announcementData);
    
    // Handle countdown settings if this is a countdown type announcement
    if (formData.basic.type === 'countdown' && formData.countdown) {
      await this.updateCountdownSettings(id, formData.countdown);
    }
    
    return announcement;
  }
  
  // Specialized methods for countdown announcements
  private async addCountdownSettings(announcementId: number, countdownData: NonNullable<FormState['countdown']>) {
    // Insert countdown settings
    await db.insert(countdownSettings).values({
      announcementId,
      timerType: countdownData.timerType,
      timeFormat: countdownData.timeFormat,
      showDays: countdownData.showDays,
      endDateTime: countdownData.endDateTime,
      durationDays: countdownData.durationDays,
      durationHours: countdownData.durationHours,
      durationMinutes: countdownData.durationMinutes,
      durationSeconds: countdownData.durationSeconds,
      dailyStartTime: countdownData.dailyStartTime,
      dailyEndTime: countdownData.dailyEndTime,
    });
    
    // Insert after timer ends settings if specified
    if (countdownData.afterTimerEnds) {
      const childId = countdownData.afterTimerEnds.nextAnnouncementId ? 
        parseInt(countdownData.afterTimerEnds.nextAnnouncementId) : undefined;
      
      await db.insert(afterTimerEnds).values({
        announcementId,
        action: countdownData.afterTimerEnds.action,
        childAnnouncementId: childId,
      });
      
      // If there's a child announcement, update the parent announcement reference too
      if (childId) {
        await db.update(announcements)
          .set({ childAnnouncementId: childId })
          .where(eq(announcements.id, announcementId));
      }
    }
  }
  
  private async updateCountdownSettings(announcementId: number, countdownData: NonNullable<FormState['countdown']>) {
    // Check if countdown settings exist
    const existingSettings = await db.query.countdownSettings.findFirst({
      where: eq(countdownSettings.announcementId, announcementId)
    });
    
    if (existingSettings) {
      // Update existing countdown settings
      await db.update(countdownSettings)
        .set({
          timerType: countdownData.timerType,
          timeFormat: countdownData.timeFormat,
          showDays: countdownData.showDays,
          endDateTime: countdownData.endDateTime,
          durationDays: countdownData.durationDays,
          durationHours: countdownData.durationHours,
          durationMinutes: countdownData.durationMinutes,
          durationSeconds: countdownData.durationSeconds,
          dailyStartTime: countdownData.dailyStartTime,
          dailyEndTime: countdownData.dailyEndTime,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(countdownSettings.announcementId, announcementId));
    } else {
      // Insert new countdown settings if not exist
      await this.addCountdownSettings(announcementId, countdownData);
      return;
    }
    
    // Check if after timer ends settings exist
    if (countdownData.afterTimerEnds) {
      const childId = countdownData.afterTimerEnds.nextAnnouncementId ? 
        parseInt(countdownData.afterTimerEnds.nextAnnouncementId) : null;
      
      const existingAfterTimer = await db.query.afterTimerEnds.findFirst({
        where: eq(afterTimerEnds.announcementId, announcementId)
      });
      
      if (existingAfterTimer) {
        // Update existing after timer ends settings
        await db.update(afterTimerEnds)
          .set({
            action: countdownData.afterTimerEnds.action,
            childAnnouncementId: childId,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(afterTimerEnds.announcementId, announcementId));
      } else {
        // Insert new after timer ends settings
        await db.insert(afterTimerEnds).values({
          announcementId,
          action: countdownData.afterTimerEnds.action,
          childAnnouncementId: childId,
        });
      }
      
      // Update the parent announcement reference too
      await db.update(announcements)
        .set({ 
          childAnnouncementId: childId,
          updatedAt: new Date().toISOString()
        })
        .where(eq(announcements.id, announcementId));
    }
  }
}
