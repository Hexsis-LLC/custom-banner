import React from 'react';
import {BasicTab} from "./BasicTab";
import {CTATab} from "./CTATab";
import {AnnouncementTextTab} from "./AnnouncementTextTab";
import {BackgroundTab} from "./BackgroundTab";
import {OtherTab} from "./OtherTab";
import type {Size} from "../../types/announcement";
import {useFormContext} from "../../contexts/AnnouncementFormContext";

interface AnnouncementTabsProps {
  selected: number;
  pages: any[];
}

export function AnnouncementTabs({selected, pages}: AnnouncementTabsProps) {
  const {
    formData,
    handleFormChange,
    hasError,
    getFieldErrorMessage
  } = useFormContext();

  const commonProps = {
    hasError,
    getFieldErrorMessage,
  };

  switch (selected) {
    case 0:
      return (
        <BasicTab
          {...commonProps}
          size={formData.basic.size as Size}
          startType={formData.basic.startType}
          endType={formData.basic.endType}
          startDate={new Date(formData.basic.startDate)}
          endDate={new Date(formData.basic.endDate)}
          startTime={formData.basic.startTime}
          endTime={formData.basic.endTime}
          campaignTitle={formData.basic.campaignTitle}
          customHeight={formData.basic.sizeHeight}
          customWidth={formData.basic.sizeWidth}
          onCampaignTitleChange={(value) => handleFormChange('basic', { campaignTitle: value })}
          onSizeChange={(value) => handleFormChange('basic', { size: value as Size })}
          onStartTypeChange={(value) => handleFormChange('basic', { startType: value })}
          onEndTypeChange={(value) => handleFormChange('basic', { endType: value })}
          onStartDateChange={(value) => handleFormChange('basic', { startDate: value.toISOString() })}
          onEndDateChange={(value) => handleFormChange('basic', { endDate: value.toISOString() })}
          onStartTimeChange={(value) => handleFormChange('basic', { startTime: value })}
          onEndTimeChange={(value) => handleFormChange('basic', { endTime: value })}
          onCampaignCustomHeight={(value) => handleFormChange('basic', { sizeHeight: value })}
          onCampaignCustomWidth={(value) => handleFormChange('basic', { sizeWidth: value })}
        />
      );
    case 1:
      return (
        <AnnouncementTextTab
          {...formData.text}
          {...commonProps}
          onAnnouncementTextChange={(value) => handleFormChange('text', { announcementText: value })}
          onTextColorChange={(value) => handleFormChange('text', { textColor: value })}
          onFontTypeChange={(value) => handleFormChange('text', { fontType: value })}
          onFontSizeChange={(value) => handleFormChange('text', { fontSize: value })}
          onFontUrlChange={(value) => handleFormChange('text', { fontUrl: value })}
        />
      );
    case 2:
      return (
        <CTATab
          {...commonProps}
          ctaType={formData.cta.ctaType}
          ctaText={formData.cta.ctaText}
          ctaLink={formData.cta.ctaLink}
          fontSize={formData.text.fontSize}
          paddingTop={formData.cta.padding.top}
          paddingRight={formData.cta.padding.right}
          paddingBottom={formData.cta.padding.bottom}
          paddingLeft={formData.cta.padding.left}
          fontType={formData.cta.fontType}
          fontUrl={formData.cta.fontUrl}
          ctaButtonFontColor={formData.cta.buttonFontColor}
          ctaButtonBackgroundColor={formData.cta.buttonBackgroundColor}
          onCtaTypeChange={(value) => handleFormChange('cta', { ctaType: value })}
          onCtaTextChange={(value) => handleFormChange('cta', { ctaText: value })}
          onCtaLinkChange={(value) => handleFormChange('cta', { ctaLink: value })}
          onPaddingChange={(value, position) => {
            const newPadding = { ...formData.cta.padding, [position]: value };
            handleFormChange('cta', { padding: newPadding });
          }}
          onFontTypeChange={(value) => handleFormChange('cta', { fontType: value })}
          onFontUrlChange={(value) => handleFormChange('cta', { fontUrl: value })}
          onCtaButtonFontColorChange={(value) => handleFormChange('cta', { buttonFontColor: value })}
          onCtaButtonBackgroundColorChange={(value) => handleFormChange('cta', { buttonBackgroundColor: value })}
          onFontSizeChange={(value) => handleFormChange('text', { fontSize: value })}
        />
      );
    case 3:
      return (
        <BackgroundTab
          {...formData.background}
          {...commonProps}
          onBackgroundTypeChange={(value) => handleFormChange('background', { backgroundType: value })}
          onColor1Change={(value) => handleFormChange('background', { color1: value })}
          onColor2Change={(value) => handleFormChange('background', { color2: value })}
          onPatternChange={(value) => handleFormChange('background', { pattern: value })}
          onPaddingChange={(value, position) => {
            const newPadding = { ...formData.background.padding, [position]: value };
            handleFormChange('background', { padding: newPadding });
          }}
        />
      );
    case 4:
      return (
        <OtherTab
          {...formData.other}
          {...commonProps}
          pagesOptions={pages}
          startDate={new Date(formData.basic.startDate)}
          endDate={new Date(formData.basic.endDate)}
          startTime={formData.basic.startTime}
          endTime={formData.basic.endTime}
          closeButtonPosition={formData.other.closeButtonPosition as 'left' | 'right'}
          onCloseButtonPositionChange={(value) => handleFormChange('other', { closeButtonPosition: value as 'left' | 'right' })}
          onDisplayBeforeDelayChange={(value) => handleFormChange('other', { displayBeforeDelay: value })}
          onShowAfterClosingChange={(value) => handleFormChange('other', { showAfterClosing: value })}
          onShowAfterCTAChange={(value) => handleFormChange('other', { showAfterCTA: value })}
          onSelectedPagesChange={(value) => handleFormChange('other', { selectedPages: value })}
          onCampaignTimingChange={(value) => handleFormChange('other', { campaignTiming: value })}
          onStartDateChange={(value) => handleFormChange('basic', { startDate: value.toISOString() })}
          onEndDateChange={(value) => handleFormChange('basic', { endDate: value.toISOString() })}
          onStartTimeChange={(value) => handleFormChange('basic', { startTime: value })}
          onEndTimeChange={(value) => handleFormChange('basic', { endTime: value })}
        />
      );
    default:
      return null;
  }
} 