import {
  Page,
  Tabs,
  Box,
  Banner,
} from "@shopify/polaris";
import {useNavigate, useLoaderData, Form} from "@remix-run/react";
import {useState, useCallback} from "react";
import {BasicTab} from "app/components/announcement/BasicTab";
import {CTATab} from "app/components/announcement/CTATab";
import {AnnouncementTextTab} from "app/components/announcement/AnnouncementTextTab";
import {BackgroundTab} from "app/components/announcement/BackgroundTab";
import {OtherTab} from "app/components/announcement/OtherTab";
import type {LoaderFunctionArgs, ActionFunctionArgs} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {authenticate} from "../shopify.server";
import CustomFonts from "../utils/google-fonts";
import {validateAnnouncement} from "../schemas/announcement";
import {TABS, DEFAULT_INITIAL_DATA} from "../constants/announcement-form";
import {getErrorMessage} from "../utils/announcement-form";
import type {FormState, LoaderData, ValidationState} from "../types/announcement-form";
import {ZodError} from "zod";
import type {Size} from "../types/announcement";

// Loader
export const loader = async ({request}: LoaderFunctionArgs) => {
  const {session} = await authenticate.admin(request);
  const fonts = new CustomFonts();
  const randomFont = fonts.getRandomFont();

  const formData: FormState = {
    ...DEFAULT_INITIAL_DATA,
    basic: {
      ...DEFAULT_INITIAL_DATA.basic,
      startDate: DEFAULT_INITIAL_DATA.basic.startDate.toISOString(),
      endDate: DEFAULT_INITIAL_DATA.basic.endDate.toISOString(),
    },
  };

  return json<LoaderData>({
    initialData: formData,
    fonts: [{ family: randomFont.family }],
  });
};

// Action
export const action = async ({request}: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);
    const parsedData = JSON.parse(rawData.formData as string);

    if (parsedData.basic) {
      parsedData.basic.startDate = new Date(parsedData.basic.startDate);
      parsedData.basic.endDate = new Date(parsedData.basic.endDate);
    }

    const validatedData = validateAnnouncement(parsedData);
    return redirect('/app/campaign/banner_type');
  } catch (error) {
    if (error instanceof ZodError) {
      return json({
        error: 'Validation failed',
        details: error.errors
      }, {status: 400});
    }
    return json({error: 'Invalid form data'}, {status: 400});
  }
};

// Component
export default function AnnouncementBanner() {
  const navigate = useNavigate();
  const {initialData} = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState(0);
  const [formData, setFormData] = useState<FormState>(initialData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<ValidationState>({
    errors: [],
    errorFields: new Set(),
  });

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );

  const handleFormChange = useCallback((section: keyof FormState, data: Partial<FormState[keyof FormState]>) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }));
    setValidationErrors([]);
    setFieldErrors({ errors: [], errorFields: new Set() });
  }, []);

  const validateForm = useCallback(() => {
    try {
      const dataToValidate = {
        ...formData,
        basic: {
          ...formData.basic,
          startDate: new Date(formData.basic.startDate),
          endDate: new Date(formData.basic.endDate),
        },
      };

      validateAnnouncement(dataToValidate);
      setFieldErrors({ errors: [], errorFields: new Set() });
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err: { path: (string | number)[]; message: string }) => getErrorMessage(err));

        const groupedErrors = errorMessages.reduce((acc: { [key: string]: string[] }, message: string) => {
          const tabName = message.split(' in ')[1].split(' tab')[0];
          if (!acc[tabName]) acc[tabName] = [];
          acc[tabName].push(message.split(' in ')[0]);
          return acc;
        }, {});

        const formattedErrors = Object.entries(groupedErrors).map(([tab, errors]) =>
          `${tab} tab: ${errors.join(', ')}`
        );

        const errorFields = new Set(error.errors.map((err: { path: (string | number)[]; message: string }) => err.path.join('.')));
        setFieldErrors({
          errors: error.errors.map((err: { path: (string | number)[]; message: string }) => ({
            path: err.path,
            message: err.message,
          })),
          errorFields,
        });

        setValidationErrors(formattedErrors);
      }
      return false;
    }
  }, [formData]);

  const hasError = useCallback((fieldPath: string) => {
    return fieldErrors.errorFields.has(fieldPath);
  }, [fieldErrors.errorFields]);

  const getFieldErrorMessage = useCallback((fieldPath: string) => {
    const error = fieldErrors.errors.find(err => err.path.join('.') === fieldPath);
    return error ? error.message : '';
  }, [fieldErrors.errors]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      const form = e.currentTarget;
      form.submit();
    }
  }, [validateForm]);

  const renderContent = () => {
    const commonProps = {
      hasError,
      getFieldErrorMessage,
    };

    switch (selected) {
      case 0:
        return (
          <BasicTab
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
            onCampaignTitleChange={(value) => handleFormChange('basic', {campaignTitle: value})}
            onSizeChange={(value) => handleFormChange('basic', {size: value as Size})}
            onStartTypeChange={(value) => handleFormChange('basic', {startType: value})}
            onEndTypeChange={(value) => handleFormChange('basic', {endType: value})}
            onStartDateChange={(value) => handleFormChange('basic', {startDate: value.toISOString()})}
            onEndDateChange={(value) => handleFormChange('basic', {endDate: value.toISOString()})}
            onStartTimeChange={(value) => handleFormChange('basic', {startTime: value})}
            onEndTimeChange={(value) => handleFormChange('basic', {endTime: value})}
            onCampaignCustomHeight={(value) => handleFormChange('basic', {sizeHeight: value})}
            onCampaignCustomWidth={(value) => handleFormChange('basic', {sizeWidth: value})}
            {...commonProps}
          />
        );
      case 1:
        return (
          <AnnouncementTextTab
            {...formData.text}
            onAnnouncementTextChange={(value) => handleFormChange('text', {announcementText: value})}
            onTextColorChange={(value) => handleFormChange('text', {textColor: value})}
            onFontTypeChange={(value) => handleFormChange('text', {fontType: value})}
            onFontSizeChange={(value) => handleFormChange('text', {fontSize: value})}
            onFontUrlChange={(value) => handleFormChange('text', {fontUrl: value})}
            {...commonProps}
          />
        );
      case 2:
        return (
          <CTATab
            ctaType={formData.cta.ctaType}
            ctaText={formData.cta.ctaText}
            ctaLink={formData.cta.ctaLink}
            paddingTop={formData.cta.padding.top}
            paddingRight={formData.cta.padding.right}
            paddingBottom={formData.cta.padding.bottom}
            paddingLeft={formData.cta.padding.left}
            fontType={formData.cta.fontType}
            fontSize={formData.text.fontSize}
            fontUrl={formData.cta.fontUrl}
            ctaButtonFontColor={formData.cta.buttonFontColor}
            ctaButtonBackgroundColor={formData.cta.buttonBackgroundColor}
            onCtaTypeChange={(value) => handleFormChange('cta', {ctaType: value})}
            onCtaTextChange={(value) => handleFormChange('cta', {ctaText: value})}
            onCtaLinkChange={(value) => handleFormChange('cta', {ctaLink: value})}
            onPaddingChange={(value, position) => {
              const newPadding = {...formData.cta.padding, [position]: value};
              handleFormChange('cta', {padding: newPadding});
            }}
            onFontTypeChange={(value) => handleFormChange('cta', {fontType: value})}
            onFontUrlChange={(value) => handleFormChange('cta', {fontUrl: value})}
            onCtaButtonFontColorChange={(value) => handleFormChange('cta', {buttonFontColor: value})}
            onCtaButtonBackgroundColorChange={(value) => handleFormChange('cta', {buttonBackgroundColor: value})}
            onFontSizeChange={(value) => handleFormChange('text', {fontSize: value})}
            {...commonProps}
          />
        );
      case 3:
        return (
          <BackgroundTab
            {...formData.background}
            onBackgroundTypeChange={(value) => handleFormChange('background', {backgroundType: value})}
            onColor1Change={(value) => handleFormChange('background', {color1: value})}
            onColor2Change={(value) => handleFormChange('background', {color2: value})}
            onPatternChange={(value) => handleFormChange('background', {pattern: value})}
            onPaddingChange={(value, position) => {
              const newPadding = {...formData.background.padding, [position]: value};
              handleFormChange('background', {padding: newPadding});
            }}
            {...commonProps}
          />
        );
      case 4:
        return (
          <OtherTab
            {...formData.other}
            startDate={new Date(formData.basic.startDate)}
            endDate={new Date(formData.basic.endDate)}
            startTime={formData.basic.startTime}
            endTime={formData.basic.endTime}
            onCloseButtonPositionChange={(value) => handleFormChange('other', {closeButtonPosition: value as 'right' | 'left'})}
            onDisplayBeforeDelayChange={(value) => handleFormChange('other', {displayBeforeDelay: value})}
            onShowAfterClosingChange={(value) => handleFormChange('other', {showAfterClosing: value})}
            onShowAfterCTAChange={(value) => handleFormChange('other', {showAfterCTA: value})}
            onSelectedPagesChange={(value) => handleFormChange('other', {selectedPages: value})}
            onCampaignTimingChange={(value) => handleFormChange('other', {campaignTiming: value})}
            onStartDateChange={(value) => handleFormChange('basic', {startDate: value.toISOString()})}
            onEndDateChange={(value) => handleFormChange('basic', {endDate: value.toISOString()})}
            onStartTimeChange={(value) => handleFormChange('basic', {startTime: value})}
            onEndTimeChange={(value) => handleFormChange('basic', {endTime: value})}
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Form method="post" onSubmit={handleSubmit}>
      <Page
        title="Announcement Bar"
        backAction={{content: "Banner Types", url: "/app/campaign/banner_type"}}
        primaryAction={{
          content: "Publish",
          onAction: () => {
            const form = document.querySelector('form');
            if (form && validateForm()) {
              form.submit();
            }
          },
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => navigate("/app/campaign/banner_type"),
          },
        ]}
      >
        {validationErrors.length > 0 && (
          <Box padding="400">
            <Banner
              title="Please review the following:"
              tone="warning"
            >
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {validationErrors.map((error, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{error}</li>
                ))}
              </ul>
            </Banner>
          </Box>
        )}
        <Tabs tabs={TABS} selected={selected} onSelect={handleTabChange}>
          <Box padding="200">
            {renderContent()}
            <input type="hidden" name="formData" value={JSON.stringify(formData)} />
          </Box>
        </Tabs>
      </Page>
    </Form>
  );
}
