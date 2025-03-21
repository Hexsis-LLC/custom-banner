import React, { useMemo, useCallback } from 'react';
import { BlockStack } from '@shopify/polaris';
import { useFormContext } from '../../contexts/AnnouncementFormContext';
import { CountdownField } from './form-fields/CountdownField';
import { CTAButtonField } from "./form-fields/CTAButtonField";
import { AnnouncementTextField } from "./form-fields/AnnouncementTextField";
import type { CountdownFieldData } from '../../schemas/schemas/CountdownFieldSchema';
import type { FormCountdownSettings } from '../../types/announcement-form';




export function CountdownTab() {
    const { formData, handleFormChange } = useFormContext();

    // Format the context data for the CountdownField component
    const initialCountdownData = useMemo(() => {
        if (!formData.countdown) return {};
        return formData.countdown as CountdownFieldData;
    }, [formData.countdown]);

    // Handle data changes from the CountdownField component
    const handleCountdownDataChange = useCallback((data: CountdownFieldData, isValid: boolean) => {
        // Check if the action has changed to 'create_announcement'
        const isCreatingAnnouncement =
            data.afterTimerEnds?.action === 'create_announcement' &&
            formData.countdown?.afterTimerEnds?.action !== 'create_announcement';

        // If changing to 'create_announcement', ensure we have defaults for message and CTA
        if (isCreatingAnnouncement) {
            // Cast to allow using the extended fields
            const afterTimerEnds = data.afterTimerEnds as unknown as AfterTimerEndsSettings;

            const updatedData = {
                ...data,
                afterTimerEnds: {
                    ...afterTimerEnds,
                    message: afterTimerEnds?.message || '',
                    textColor: afterTimerEnds?.textColor || '#FFFFFF',
                    fontSize: afterTimerEnds?.fontSize || 20,
                    fontType: afterTimerEnds?.fontType || 'site',
                    fontUrl: afterTimerEnds?.fontUrl || '',
                    ctaType: afterTimerEnds?.ctaType || 'none',
                    ctaText: afterTimerEnds?.ctaText || '',
                    ctaLink: afterTimerEnds?.ctaLink || '',
                    buttonBackground: afterTimerEnds?.buttonBackground || '#000000',
                    buttonTextColor: afterTimerEnds?.buttonTextColor || '#FFFFFF',
                    ctaFontType: afterTimerEnds?.ctaFontType || afterTimerEnds?.fontType || 'site',
                    ctaFontUrl: afterTimerEnds?.ctaFontUrl || afterTimerEnds?.fontUrl || '',
                    // We'll set childAnnouncementId when the form is submitted
                }
            };

            handleFormChange('countdown', updatedData as unknown as FormCountdownSettings);
        } else {
            // If we're changing from 'create_announcement' to something else,
            // we need to clean up announcement-specific fields if needed
            if (formData.countdown?.afterTimerEnds?.action === 'create_announcement' &&
                data.afterTimerEnds?.action !== 'create_announcement') {
                // Clean up the announcement-specific fields
                const cleanedData = {
                    ...data,
                    afterTimerEnds: {
                        ...data.afterTimerEnds,
                        // Remove announcement-specific fields
                        message: undefined,
                        textColor: undefined,
                        fontSize: undefined,
                        fontType: undefined,
                        fontUrl: undefined,
                        ctaType: undefined,
                        ctaText: undefined,
                        ctaLink: undefined,
                        buttonBackground: undefined,
                        buttonTextColor: undefined,
                        ctaFontType: undefined,
                        ctaFontUrl: undefined,
                        childAnnouncementId: undefined,
                    }
                };

                handleFormChange('countdown', cleanedData as unknown as FormCountdownSettings);
            } else {
                // Regular update (no action change)
                handleFormChange('countdown', data as unknown as FormCountdownSettings);
            }
        }
    }, [formData.countdown, handleFormChange]);

    // Get afterTimerEnds data for the UI components
    const afterTimerEnds = useMemo<AfterTimerEndsSettings>(() => {
        // If we don't have countdown data yet, return defaults
        if (!formData.countdown) {
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

        // If no afterTimerEnds in the data or it doesn't have the action, return defaults
        if (!formData.countdown.afterTimerEnds || !formData.countdown.afterTimerEnds.action) {
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

        // Provide defaults for missing fields
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
            ctaFontType: timerEndsData.ctaFontType || timerEndsData.fontType || 'site',
            ctaFontUrl: timerEndsData.ctaFontUrl || timerEndsData.fontUrl || '',
        };
    }, [formData.countdown?.afterTimerEnds, formData.countdown]);

    // Check if we should show announcement settings
    const showAnnouncementSettings = afterTimerEnds.action === 'create_announcement';

    // Debug log announcement settings
    console.log("afterTimerEnds:", afterTimerEnds);
    console.log("CountdownTab: Current afterTimerEnds settings:", {
        message: afterTimerEnds.message,
        messageFont: {
            type: afterTimerEnds.fontType,
            url: afterTimerEnds.fontUrl
        },
        ctaFont: {
            type: afterTimerEnds.ctaFontType,
            url: afterTimerEnds.ctaFontUrl
        }
    });

    // Handle data changes from the AnnouncementTextField component
    const handleTextFieldDataChange = useCallback((data: any, isValid: boolean) => {
        if (!formData.countdown) return;

        console.log("CountdownTab: Text field data changed:", data);
        console.log("Current afterTimerEnds:", formData.countdown.afterTimerEnds);
        console.log("Message Font settings received:", {
            fontType: data.fontType,
            fontUrl: data.fontUrl
        });

        // We need to cast afterTimerEnds to allow additional properties
        const currentAfterTimerEnds = formData.countdown.afterTimerEnds as unknown as AfterTimerEndsSettings;

        // Only proceed if there are actual changes to apply
        const hasActualChanges =
            data.announcementText !== currentAfterTimerEnds.message ||
            data.textColor !== currentAfterTimerEnds.textColor ||
            data.fontSize !== currentAfterTimerEnds.fontSize ||
            data.fontType !== currentAfterTimerEnds.fontType ||
            data.fontUrl !== currentAfterTimerEnds.fontUrl;

        if (hasActualChanges) {
            console.log("CountdownTab: Updating message font settings:", {
                fontType: data.fontType,
                fontUrl: data.fontUrl
            });

            // Create a fresh object with only the message-specific fields we want to update
            // This prevents any accidental overrides of CTA settings
            const messageUpdates = {
                message: data.announcementText,
                textColor: data.textColor,
                fontSize: data.fontSize,
                fontType: data.fontType as 'site' | 'dynamic' | 'custom',
                fontUrl: data.fontUrl,
            };

            // Then merge with the existing settings, preserving CTA settings
            const updatedAfterTimerEnds = {
                ...currentAfterTimerEnds,
                ...messageUpdates,
                action: 'create_announcement', // Always ensure this is set correctly
            };

            handleFormChange('countdown', {
                ...formData.countdown,
                afterTimerEnds: updatedAfterTimerEnds
            });
        }
    }, [formData.countdown, handleFormChange]);

    // Handle data changes from the CTAButtonField component
    const handleCTADataChange = useCallback((data: any, isValid: boolean) => {
        if (!formData.countdown) return;

        console.log("CountdownTab: CTA data changed:", data);
        console.log("Current afterTimerEnds:", formData.countdown.afterTimerEnds);
        console.log("CTA Font settings received:", {
            fontType: data.fontType,
            fontUrl: data.fontUrl
        });

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

        // Only proceed if there are actual changes to apply
        const hasActualChanges =
            ctaType !== currentAfterTimerEnds.ctaType ||
            data.ctaText !== currentAfterTimerEnds.ctaText ||
            data.ctaLink !== currentAfterTimerEnds.ctaLink ||
            data.buttonFontColor !== currentAfterTimerEnds.buttonTextColor ||
            data.buttonBackgroundColor !== currentAfterTimerEnds.buttonBackground ||
            data.fontType !== currentAfterTimerEnds.ctaFontType ||
            data.fontUrl !== currentAfterTimerEnds.ctaFontUrl;

        if (hasActualChanges) {
            console.log("CountdownTab: Updating CTA font settings:", {
                fontType: data.fontType,
                fontUrl: data.fontUrl
            });

            // Create a fresh object with only the CTA-specific fields we want to update
            // This prevents any accidental overrides of message settings
            const ctaUpdates = {
                ctaType,
                ctaText: data.ctaText,
                ctaLink: data.ctaLink,
                buttonTextColor: data.buttonFontColor,
                buttonBackground: data.buttonBackgroundColor,
                ctaFontType: data.fontType as 'site' | 'dynamic' | 'custom',
                ctaFontUrl: data.fontUrl,
            };

            // Then merge with the existing settings, preserving message settings
            const updatedAfterTimerEnds = {
                ...currentAfterTimerEnds,
                ...ctaUpdates,
                action: 'create_announcement', // Always ensure this is set correctly
            };

            handleFormChange('countdown', {
                ...formData.countdown,
                afterTimerEnds: updatedAfterTimerEnds
            });
        }
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
                        key="timer-ends-message-field"
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
                        key="timer-ends-cta-field"
                        initialData={{
                            ctaType: afterTimerEnds.ctaType === 'button' ? 'regular' : (afterTimerEnds.ctaType || 'none') as 'link' | 'none',
                            ctaText: afterTimerEnds.ctaText || 'Go to link',
                            ctaLink: afterTimerEnds.ctaLink || 'www.google.com',
                            buttonFontColor: afterTimerEnds.buttonTextColor || '#FFFFFF',
                            buttonBackgroundColor: afterTimerEnds.buttonBackground || '#000000',
                            fontType: afterTimerEnds.ctaFontType || 'site',
                            fontUrl: afterTimerEnds.ctaFontUrl || '',
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
