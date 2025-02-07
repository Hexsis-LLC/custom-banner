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
import {validateAnnouncement, announcementSchema} from "../schemas/announcement";
import type {AnnouncementBannerData, Size} from "../types/announcement";
import {ZodError} from "zod";

interface FormState extends Omit<AnnouncementBannerData, 'basic'> {
  basic: Omit<AnnouncementBannerData['basic'], 'startDate' | 'endDate'> & {
    startDate: string;
    endDate: string;
  };
}

interface LoaderData {
  initialData: FormState;
  fonts: { family: string }[];
}

interface FieldError {
  path: (string | number)[];
  message: string;
}

interface ValidationState {
  errors: FieldError[];
  errorFields: Set<string>;
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {session} = await authenticate.admin(request);
  const fonts = new CustomFonts();
  const randomFont = fonts.getRandomFont();

  const now = new Date();
  // Initialize with default values
  const initialData: AnnouncementBannerData = {
    basic: {
      size: 'large' as Size,
      sizeHeight: "52",
      sizeWidth: "100",
      campaignTitle: '',
      startType: 'now',
      endType: 'until_stop',
      startDate: now,
      endDate: now,
      startTime: '12:30 AM',
      endTime: '1:30 PM',
    },
    text: {
      announcementText: '',
      textColor: '#FFFFFF',
      fontSize: 16,
      fontType: 'site',
    },
    cta: {
      ctaType: 'regular',
      ctaText: '',
      ctaLink: '',
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      fontType: 'site',
      buttonFontColor: '#FFFFFF',
      buttonBackgroundColor: '#FFFFFF',
    },
    background: {
      backgroundType: 'solid',
      color1: '',
      color2: '',
      pattern: 'none',
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    other: {
      closeButtonPosition: 'right' as const,
      displayBeforeDelay: 'no-delay',
      showAfterClosing: 'never',
      showAfterCTA: 'no-delay',
      selectedPages: ['products'],
      campaignTiming: 'immediate',
    },
  };

  // Transform the data for client-side use
  const formData: FormState = {
    ...initialData,
    basic: {
      ...initialData.basic,
      startDate: initialData.basic.startDate.toISOString(),
      endDate: initialData.basic.endDate.toISOString(),
    },
  };

  return json<LoaderData>({
    initialData: formData,
    fonts: [{ family: randomFont.family }],
  });
};

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);

  try {
    const parsedData = JSON.parse(rawData.formData as string);
    // Convert date strings back to Date objects
    if (parsedData.basic) {
      parsedData.basic.startDate = new Date(parsedData.basic.startDate);
      parsedData.basic.endDate = new Date(parsedData.basic.endDate);
    }
    const validatedData = validateAnnouncement(parsedData);
    // TODO: Save announcement data to your database
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

const getTabNameFromPath = (path: (string | number)[]): string => {
  const section = path[0].toString();
  switch (section) {
    case 'basic':
      return 'Basic Settings';
    case 'text':
      return 'Announcement Text';
    case 'cta':
      return 'Call to Action';
    case 'background':
      return 'Background';
    case 'other':
      return 'Other Settings';
    default:
      return section;
  }
};

const getFieldName = (path: (string | number)[]): string => {
  const field = path[path.length - 1].toString();
  switch (field) {
    case 'size':
      return 'Banner Size';
    case 'sizeHeight':
      return 'Height';
    case 'sizeWidth':
      return 'Width';
    case 'campaignTitle':
      return 'Campaign Title';
    case 'startDate':
      return 'Start Date';
    case 'endDate':
      return 'End Date';
    case 'startTime':
      return 'Start Time';
    case 'endTime':
      return 'End Time';
    case 'announcementText':
      return 'Announcement Text';
    case 'textColor':
      return 'Text Color';
    case 'fontSize':
      return 'Font Size';
    case 'fontType':
      return 'Font Type';
    case 'ctaType':
      return 'CTA Type';
    case 'ctaText':
      return 'CTA Text';
    case 'ctaLink':
      return 'CTA Link';
    case 'buttonFontColor':
      return 'Button Text Color';
    case 'buttonBackgroundColor':
      return 'Button Background Color';
    case 'backgroundType':
      return 'Background Type';
    case 'color1':
      return 'Primary Color';
    case 'color2':
      return 'Secondary Color';
    case 'color3':
      return 'Tertiary Color';
    case 'pattern':
      return 'Pattern';
    case 'paddingRight':
      return 'Right Padding';
    case 'closeButtonPosition':
      return 'Close Button Position';
    case 'displayBeforeDelay':
      return 'Display Delay';
    case 'showAfterClosing':
      return 'Show After Closing';
    case 'showAfterCTA':
      return 'Show After CTA Click';
    case 'selectedPages':
      return 'Selected Pages';
    case 'campaignTiming':
      return 'Campaign Timing';
    default:
      return field;
  }
};

const getErrorMessage = (error: { path: (string | number)[]; message: string }): string => {
  const tabName = getTabNameFromPath(error.path);
  const fieldName = getFieldName(error.path);

  // Handle specific error messages
  if (error.message.includes('Required')) {
    return `${fieldName} is required in ${tabName} tab`;
  }

  if (error.message.includes('Invalid url')) {
    return `${fieldName} must be a valid URL in ${tabName} tab`;
  }

  if (error.message.includes('min')) {
    return `${fieldName} is too small in ${tabName} tab`;
  }

  if (error.message.includes('max')) {
    return `${fieldName} is too large in ${tabName} tab`;
  }

  // For date validation errors
  if (error.message.includes('date')) {
    return `Please enter a valid date for ${fieldName} in ${tabName} tab`;
  }

  // For any other errors, make the message more user-friendly
  return `${fieldName} in ${tabName} tab: ${error.message.charAt(0).toUpperCase() + error.message.slice(1)}`;
};

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

  const tabs = [
    {
      id: 'basic',
      content: 'Basic',
    },
    {
      id: 'announcement-text',
      content: 'Announcement text',
    },
    {
      id: 'cta',
      content: 'CTA',
    },
    {
      id: 'background',
      content: 'Background',
    },
    {
      id: 'other',
      content: 'Other',
    },
  ];

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
    // Clear validation errors when form changes
    setValidationErrors([]);
    setFieldErrors({ errors: [], errorFields: new Set() });
  }, []);

  const getFieldPath = (error: { path: (string | number)[] }): string => {
    return error.path.join('.');
  };

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

      announcementSchema.parse(dataToValidate);
      setFieldErrors({ errors: [], errorFields: new Set() });
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        // Transform Zod errors into user-friendly messages
        const errorMessages = error.errors.map(err => getErrorMessage(err));

        // Group errors by tab
        const groupedErrors = errorMessages.reduce((acc: { [key: string]: string[] }, message) => {
          const tabName = message.split(' in ')[1].split(' tab')[0];
          if (!acc[tabName]) {
            acc[tabName] = [];
          }
          acc[tabName].push(message.split(' in ')[0]);
          return acc;
        }, {});

        // Format grouped errors
        const formattedErrors = Object.entries(groupedErrors).map(([tab, errors]) =>
          `${tab} tab: ${errors.join(', ')}`
        );

        // Set field-level errors
        const errorFields = new Set(error.errors.map(getFieldPath));
        setFieldErrors({
          errors: error.errors.map(err => ({
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
    const error = fieldErrors.errors.find(err => getFieldPath(err) === fieldPath);
    return error ? error.message : '';
  }, [fieldErrors.errors]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      // If validation passes, submit the form
      const form = e.currentTarget;
      form.submit();
    }
  }, [validateForm]);

  const renderContent = () => {
    switch (selected) {
      case 0:
        return (
          <BasicTab
            size={formData.basic.size as Size}
            startType={formData.basic.startType || 'now'}
            endType={formData.basic.endType || 'until_stop'}
            startDate={new Date(formData.basic.startDate)}
            endDate={new Date(formData.basic.endDate)}
            startTime={formData.basic.startTime}
            endTime={formData.basic.endTime}
            customHeight={formData.basic.sizeHeight}
            customWidth={formData.basic.sizeWidth}
            campaignTitle={formData.basic.campaignTitle}
            error={hasError('basic.campaignTitle')}
            errorMessage={getFieldErrorMessage('basic.campaignTitle')}
            startDateError={hasError('basic.startDate')}
            startDateErrorMessage={getFieldErrorMessage('basic.startDate')}
            startTimeError={hasError('basic.startTime')}
            startTimeErrorMessage={getFieldErrorMessage('basic.startTime')}
            endDateError={hasError('basic.endDate')}
            endDateErrorMessage={getFieldErrorMessage('basic.endDate')}
            endTimeError={hasError('basic.endTime')}
            endTimeErrorMessage={getFieldErrorMessage('basic.endTime')}
            heightError={hasError('basic.sizeHeight')}
            heightErrorMessage={getFieldErrorMessage('basic.sizeHeight')}
            widthError={hasError('basic.sizeWidth')}
            widthErrorMessage={getFieldErrorMessage('basic.sizeWidth')}
            onCampaignCustomHeight={(value) => handleFormChange('basic', {sizeHeight: value})}
            onCampaignCustomWidth={(value) => handleFormChange('basic', {sizeWidth: value})}
            onCampaignTitleChange={(value) => handleFormChange('basic', {campaignTitle: value})}
            onSizeChange={(value) => handleFormChange('basic', {size: value as Size})}
            onStartTypeChange={(value) => handleFormChange('basic', {startType: value})}
            onEndTypeChange={(value) => handleFormChange('basic', {endType: value})}
            onStartDateChange={(value) => handleFormChange('basic', {startDate: value.toISOString()})}
            onEndDateChange={(value) => handleFormChange('basic', {endDate: value.toISOString()})}
            onStartTimeChange={(value) => handleFormChange('basic', {startTime: value})}
            onEndTimeChange={(value) => handleFormChange('basic', {endTime: value})}
          />
        );
      case 1:
        return (
          <AnnouncementTextTab
            {...formData.text}
            error={hasError('text.announcementText')}
            errorMessage={getFieldErrorMessage('text.announcementText')}
            onAnnouncementTextChange={(value) => handleFormChange('text', {announcementText: value})}
            onTextColorChange={(value) => handleFormChange('text', {textColor: value})}
            onFontTypeChange={(value) => handleFormChange('text', {fontType: value})}
            onFontSizeChange={(value) => handleFormChange('text', {fontSize: value})}
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
            ctaButtonFontColor={formData.cta.buttonFontColor}
            ctaButtonBackgroundColor={formData.cta.buttonBackgroundColor}
            error={hasError('cta.ctaLink')}
            errorMessage={getFieldErrorMessage('cta.ctaLink')}
            onCtaTypeChange={(value) => handleFormChange('cta', {ctaType: value})}
            onCtaTextChange={(value) => handleFormChange('cta', {ctaText: value})}
            onCtaLinkChange={(value) => handleFormChange('cta', {ctaLink: value})}
            onPaddingChange={(value, position) => {
              const newPadding = {...formData.cta.padding, [position]: value};
              handleFormChange('cta', {padding: newPadding});
            }}
            onFontTypeChange={(value) => handleFormChange('cta', {fontType: value})}
            onCtaButtonFontColorChange={(value) => handleFormChange('cta', {buttonFontColor: value})}
            onCtaButtonBackgroundColorChange={(value) => handleFormChange('cta', {buttonBackgroundColor: value})}
            onFontSizeChange={(value) => handleFormChange('text', {fontSize: value})}
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
          />
        );
      case 4:
        return (
          <OtherTab
            closeButtonPosition={formData.other.closeButtonPosition}
            displayBeforeDelay={formData.other.displayBeforeDelay}
            showAfterClosing={formData.other.showAfterClosing}
            showAfterCTA={formData.other.showAfterCTA}
            selectedPages={formData.other.selectedPages}
            campaignTiming={formData.other.campaignTiming}
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
              tone="critical"
            >
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {validationErrors.map((error, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{error}</li>
                ))}
              </ul>
            </Banner>
          </Box>
        )}
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
          <Box padding="200">
            {renderContent()}
            <input type="hidden" name="formData" value={JSON.stringify(formData)} />
          </Box>
        </Tabs>
      </Page>
    </Form>
  );
}
