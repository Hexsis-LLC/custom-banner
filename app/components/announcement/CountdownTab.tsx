import React, { useMemo, useCallback } from 'react';
import { BlockStack } from '@shopify/polaris';
import { useFormContext } from '../../contexts/AnnouncementFormContext';
import { CountdownField } from './form-fields/CountdownField';
import { CTAButtonField } from "./form-fields/CTAButtonField";
import { AnnouncementTextField } from "./form-fields/AnnouncementTextField";
import type { CountdownFieldData } from '../../schemas/schemas/CountdownFieldSchema';
import type { FormCountdownSettings } from '../../types/announcement-form';

// Define the type for afterTimerEnds for the UI
interface AfterTimerEndsSettings {
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
    fontUrl?: string;
}

export function CountdownTab() {
    const { formData, handleFormChange } = useFormContext();

    // Format the context data for the CountdownField component
    const initialCountdownData = useMemo(() => {
        if (!formData.countdown) return {};

        // Cast to CountdownFieldData to match the schema
        return {
            timerType: formData.countdown.timerType,
            timeFormat: formData.countdown.timeFormat,
            showDays: formData.countdown.showDays,
            endDateTime: formData.countdown.endDateTime,
            durationDays: formData.countdown.durationDays,
            durationHours: formData.countdown.durationHours,
            durationMinutes: formData.countdown.durationMinutes,
            durationSeconds: formData.countdown.durationSeconds,
            // Cast additional properties that might be in the form data but not in the schema
            ...(formData.countdown as any).dailyStartTime && { dailyStartTime: (formData.countdown as any).dailyStartTime },
            ...(formData.countdown as any).dailyEndTime && { dailyEndTime: (formData.countdown as any).dailyEndTime },
            afterTimerEnds: formData.countdown.afterTimerEnds,
        } as CountdownFieldData;
    }, [formData.countdown]);

    // Handle data changes from the CountdownField component
    const handleCountdownDataChange = useCallback((data: CountdownFieldData, isValid: boolean) => {
        handleFormChange('countdown', data as unknown as FormCountdownSettings);
    }, [handleFormChange]);

    // Get afterTimerEnds data for the UI components
    const afterTimerEnds = useMemo<AfterTimerEndsSettings>(() => {
        if (!formData.countdown?.afterTimerEnds) {
            return {
                action: 'hide',
                message: '',
                textColor: '#FFFFFF',
                fontSize: 20,
                ctaType: 'none',
                ctaText: '',
                ctaLink: '',
                buttonBackground: '#000000',
                buttonTextColor: '#FFFFFF',
                fontType: 'site',
            };
        }

        // Cast to access extended properties that might exist in runtime but not in type definition
        const timerEndsData = formData.countdown.afterTimerEnds as unknown as AfterTimerEndsSettings;

        return {
            action: timerEndsData.action,
            nextAnnouncementId: timerEndsData.nextAnnouncementId,
            message: timerEndsData.message || '',
            textColor: timerEndsData.textColor || '#FFFFFF',
            fontSize: timerEndsData.fontSize || 20,
            ctaType: timerEndsData.ctaType || 'none',
            ctaText: timerEndsData.ctaText || '',
            ctaLink: timerEndsData.ctaLink || '',
            buttonBackground: timerEndsData.buttonBackground || '#000000',
            buttonTextColor: timerEndsData.buttonTextColor || '#FFFFFF',
            fontType: timerEndsData.fontType || 'site',
            fontUrl: timerEndsData.fontUrl || '',
        };
    }, [formData.countdown?.afterTimerEnds]);

    // Check if we should show announcement settings
    const showAnnouncementSettings = afterTimerEnds.action === 'create_announcement';

    // Handle data changes from the AnnouncementTextField component
    const handleTextFieldDataChange = useCallback((data: any, isValid: boolean) => {
        if (!formData.countdown) return;

        // We need to cast afterTimerEnds to allow additional properties
        const currentAfterTimerEnds = formData.countdown.afterTimerEnds as unknown as AfterTimerEndsSettings;

        handleFormChange('countdown', {
            ...formData.countdown,
            afterTimerEnds: {
                ...currentAfterTimerEnds,
                message: data.announcementText,
                textColor: data.textColor,
                fontSize: data.fontSize,
                fontType: data.fontType as 'site' | 'dynamic' | 'custom',
                fontUrl: data.fontUrl,
            }
        });
    }, [formData.countdown, handleFormChange]);

    // Handle data changes from the CTAButtonField component
    const handleCTADataChange = useCallback((data: any, isValid: boolean) => {
        if (!formData.countdown) return;

        // Create a mapping between CTAButtonField types and afterTimerEnds types
        let ctaType: 'link' | 'button' | 'none' | undefined = 'none';
        if (data.ctaType === 'regular') {
            ctaType = 'button';
        } else if (data.ctaType === 'link') {
            ctaType = 'link';
        } else if (data.ctaType === 'none') {
            ctaType = 'none';
        }

        // We need to cast afterTimerEnds to allow additional properties
        const currentAfterTimerEnds = formData.countdown.afterTimerEnds as unknown as AfterTimerEndsSettings;

        handleFormChange('countdown', {
            ...formData.countdown,
            afterTimerEnds: {
                ...currentAfterTimerEnds,
                ctaType,
                ctaText: data.ctaText,
                ctaLink: data.ctaLink,
                buttonTextColor: data.buttonFontColor,
                buttonBackground: data.buttonBackgroundColor,
                fontType: data.fontType as 'site' | 'dynamic' | 'custom',
                fontUrl: data.fontUrl,
            }
        });
    }, [formData.countdown, handleFormChange]);

    return (
        <BlockStack gap="400">
            <CountdownField
                initialData={initialCountdownData}
                onDataChange={handleCountdownDataChange}
                externalErrors={{}}
            />

            {showAnnouncementSettings && (
                <BlockStack gap="400">
                    <AnnouncementTextField
                        isMultiText={false}
                        initialData={{
                            announcementText: afterTimerEnds.message || '',
                            textColor: afterTimerEnds.textColor || '#FFFFFF',
                            fontSize: afterTimerEnds.fontSize || 20,
                            fontType: afterTimerEnds.fontType || 'site',
                            fontUrl: afterTimerEnds.fontUrl,
                        }}
                        onDataChange={handleTextFieldDataChange}
                        externalErrors={{}}
                    />

                    <CTAButtonField
                        initialData={{
                            ctaType: afterTimerEnds.ctaType === 'button' ? 'regular' : (afterTimerEnds.ctaType || 'none') as 'link' | 'none',
                            ctaText: afterTimerEnds.ctaText || 'Go to link',
                            ctaLink: afterTimerEnds.ctaLink || 'www.google.com',
                            buttonFontColor: afterTimerEnds.buttonTextColor || '#FFFFFF',
                            buttonBackgroundColor: afterTimerEnds.buttonBackground || '#000000',
                            fontType: afterTimerEnds.fontType || 'site',
                            fontUrl: afterTimerEnds.fontUrl,
                            padding: {
                                top: 8,
                                right: 16,
                                bottom: 8,
                                left: 16,
                            },
                        }}
                        onDataChange={handleCTADataChange}
                        externalErrors={{}}
                    />
                </BlockStack>
            )}
        </BlockStack>
    );
}
