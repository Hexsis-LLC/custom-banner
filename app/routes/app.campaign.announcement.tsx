import {
  Page,
  Tabs,
  Box,
  Badge,
  BlockStack,
  ActionList,
  Button,
  ButtonGroup,
  Popover,
} from "@shopify/polaris";
import {useNavigate, useLoaderData, Form} from "@remix-run/react";
import React, {useState, useCallback, useEffect} from "react";
import type {LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {authenticate, unauthenticated} from "../shopify.server";
import {TABS, DEFAULT_INITIAL_DATA} from "../constants/announcement-form";
import type {FormState, LoaderData, ActionData, FormAnnouncementBannerData} from "../types/announcement-form";
import type {BannerType} from "../types/announcement";
import Storefront from "../services/storefront.server";
import {FormProvider, useFormContext} from "../contexts/AnnouncementFormContext";
import {AnnouncementTabs} from "../components/announcement/AnnouncementTabs";
import {ValidationMessages} from "../components/announcement/ValidationMessages";
import {AdjustIcon, ChevronDownIcon} from "@shopify/polaris-icons";
import {AnnouncementService} from "../services/announcement.server";

// Loader
export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const {session} = await authenticate.admin(request);
  const {storefront} = await unauthenticated.storefront(session.shop)
  const storeFrontService = new Storefront(storefront)
  const pages = await storeFrontService.getStorePages();
  
  // Get announcement type from URL params or query string
  const url = new URL(request.url);
  const announcementType = (url.searchParams.get('type') || 'basic') as BannerType;
  const announcementId = url.searchParams.get('id');

  let formData: FormState;
  
  if (announcementId) {
    // Fetch existing announcement data for editing
    const announcementService = new AnnouncementService();
    const existingAnnouncement = await announcementService.getAnnouncement(parseInt(announcementId));
    
    if (!existingAnnouncement) {
      throw new Error('Announcement not found');
    }

    // Transform database announcement to form state
    formData = {
      basic: {
        id: existingAnnouncement.id,
        size: existingAnnouncement.size,
        sizeHeight: existingAnnouncement.heightPx?.toString() || "52",
        sizeWidth: existingAnnouncement.widthPercent?.toString() || "100",
        campaignTitle: existingAnnouncement.title,
        startType: existingAnnouncement.startType,
        endType: existingAnnouncement.endType,
        startDate: new Date(existingAnnouncement.startDate).toISOString(),
        endDate: new Date(existingAnnouncement.endDate).toISOString(),
        startTime: new Date(existingAnnouncement.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        endTime: new Date(existingAnnouncement.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        type: existingAnnouncement.type,
        isActive: existingAnnouncement.isActive || false,
        showCloseButton: existingAnnouncement.showCloseButton || true,
        closeButtonPosition: existingAnnouncement.closeButtonPosition,
        countdownEndTime: existingAnnouncement.countdownEndTime || undefined,
        timezone: existingAnnouncement.timezone || undefined,
        status: existingAnnouncement.status,
      },
      text: {
        announcementText: existingAnnouncement.texts[0]?.textMessage || '',
        textColor: existingAnnouncement.texts[0]?.textColor || '#FFFFFF',
        fontSize: existingAnnouncement.texts[0]?.fontSize || 16,
        fontType: 'site',
        fontUrl: existingAnnouncement.texts[0]?.customFont || '',
      },
      cta: {
        ctaType: existingAnnouncement.texts[0]?.ctas[0] ? 'regular' : 'none',
        ctaText: existingAnnouncement.texts[0]?.ctas[0]?.text || 'Click Here',
        ctaLink: existingAnnouncement.texts[0]?.ctas[0]?.link || 'https://',
        padding: {
          top: 8,
          right: 16,
          bottom: 8,
          left: 16,
        },
        fontType: 'site',
        fontUrl: '',
        buttonFontColor: existingAnnouncement.texts[0]?.ctas[0]?.textColor || '#000000',
        buttonBackgroundColor: existingAnnouncement.texts[0]?.ctas[0]?.bgColor || '#FFFFFF',
        type: existingAnnouncement.texts[0]?.ctas[0]?.type || 'button',
        text: existingAnnouncement.texts[0]?.ctas[0]?.text || 'Click Here',
        link: existingAnnouncement.texts[0]?.ctas[0]?.link || 'https://',
        bgColor: existingAnnouncement.texts[0]?.ctas[0]?.bgColor || '#FFFFFF',
        textColor: existingAnnouncement.texts[0]?.ctas[0]?.textColor || '#000000',
      },
      background: {
        backgroundType: 'solid',
        color1: existingAnnouncement.background?.backgroundColor || '#000000',
        color2: '',
        pattern: existingAnnouncement.background?.backgroundPattern || 'none',
        padding: {
          top: 12,
          right: 16,
          bottom: 12,
          left: 16,
        },
        backgroundColor: existingAnnouncement.background?.backgroundColor || '#000000',
        backgroundPattern: existingAnnouncement.background?.backgroundPattern || null,
      },
      other: {
        closeButtonPosition: existingAnnouncement.closeButtonPosition,
        displayBeforeDelay: existingAnnouncement.displayBeforeDelay || 'none',
        showAfterClosing: existingAnnouncement.showAfterClosing || 'none',
        showAfterCTA: existingAnnouncement.showAfterCTA || 'none',
        selectedPages: existingAnnouncement.pagePatternLinks.map(link => link.pagePattern.pattern) || ['__global'],
        campaignTiming: 'immediate',
      },
    };
  } else {
    // Create new announcement with default data
    const defaultData = {
      ...DEFAULT_INITIAL_DATA,
      basic: {
        ...DEFAULT_INITIAL_DATA.basic,
        startDate: DEFAULT_INITIAL_DATA.basic.startDate.toISOString(),
        endDate: DEFAULT_INITIAL_DATA.basic.endDate.toISOString(),
        status: 'draft',
        type: announcementType,
        showCloseButton: true,
        closeButtonPosition: 'right',
      },
    } as FormState;

    formData = defaultData;
  }

  return json<LoaderData>({
    initialData: formData,
    pages,
  });
};

function AnnouncementForm() {
  const navigate = useNavigate();
  const {pages} = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState(0);
  const {formData, setFormData, validationErrors, validateForm} = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessChip, setShowSuccessChip] = useState(false);
  const [actionType, setActionType] = useState<'draft' | 'publish' | null>(null);

  // Hide success message after 3 seconds
  useEffect(() => {
    if (showSuccessChip) {
      const timer = setTimeout(() => {
        setShowSuccessChip(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessChip]);

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );
  const [active, setActive] = React.useState<string | null>(null);

  const toggleActive = (id: string) => () => {
    setActive((activeId) => (activeId !== id ? id : null));
  };

  // Get page title based on announcement type
  const getPageTitle = () => {
    switch (formData.basic.type) {
      case 'basic':
        return 'Basic Announcement Bar';
      case 'multi_text':
        return 'Multi-text Announcements Bar';
      case 'countdown':
        return 'Countdown Timer Bar';
      case 'email_signup':
        return 'Email Signup Bar';
      default:
        return 'Announcement Bar';
    }
  };

  const handleFormSubmit = async (action: 'draft' | 'publish') => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setActionType(action);

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          data: {
            ...formData,
            basic: {
              ...formData.basic,
              status: action === 'publish' ? 'published' : 'draft'
            }
          },
          id: formData.basic.id
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (action === 'publish') {
          navigate('/app', {replace: true});
        } else {
          // Update form data directly here
          if (result.data?.id) {
            setFormData({
              ...formData,
              basic: {
                ...formData.basic,
                id: result.data.id,
                status: 'draft'
              }
            });
          }
          setShowSuccessChip(true);
        }
      } else {
        // Handle error case
        console.error('Form submission failed:', result.error);
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  // Determine if this is a new announcement or editing an existing one
  const isNewAnnouncement = !formData.basic.id;
  const isDraft = formData.basic.status === 'draft';
  const isSaved = !isNewAnnouncement && isDraft;

  // Define secondary actions based on state
  const secondaryActions = [
    {
      content: 'Cancel',
      onAction: () => navigate("/app/campaign/banner_type"),
      disabled: isSubmitting,
    }
  ];

  return (
    <Form method="post" action="/api/announcements" onSubmit={(e) => {
      e.preventDefault();
      handleFormSubmit(actionType || 'draft');
    }}>
      <Page
        title={getPageTitle()}
        backAction={{content: "Banner Types", url: "/app/campaign/banner_type"}}
        primaryAction={(
          <ButtonGroup variant="segmented">
            <Button
              variant="primary"
              loading={isSubmitting && actionType === 'publish'}
              disabled={isSubmitting}
              onClick={async () => {
                await handleFormSubmit('publish');
              }}>
              Publish
            </Button>

            <Popover
              active={active === 'popover1'}
              preferredAlignment="right"
              activator={
                <Button
                  variant="primary"
                  onClick={toggleActive('popover1')}
                  disabled={isSubmitting}
                  icon={ChevronDownIcon}
                  accessibilityLabel="Other save actions"
                />
              }
              autofocusTarget="first-node"
              onClose={toggleActive('popover1')}
            >
              <ActionList
                actionRole="menuitem"
                items={[{
                  content: 'Save as draft',
                  onAction: () => handleFormSubmit('draft'),
                  disabled: isSubmitting && actionType === 'draft'
                }]}
              />
            </Popover>
          </ButtonGroup>
        )}
        titleMetadata={(showSuccessChip || isSaved) && !isSubmitting && (
          <Badge tone="new">
            {"Draft"}
          </Badge>
        )}
        secondaryActions={secondaryActions}
      >
        <BlockStack gap="400">
          <ValidationMessages
            validationErrors={validationErrors}
            actionData={undefined}
          />
          <Tabs tabs={TABS} selected={selected} onSelect={handleTabChange}>
            <Box padding="200">
              <AnnouncementTabs selected={selected} pages={pages}/>
              <input type="hidden" name="formData" value={JSON.stringify(formData)}/>
            </Box>
          </Tabs>
        </BlockStack>
      </Page>
    </Form>
  );
}

// Main component
export default function AnnouncementBanner() {
  const {initialData} = useLoaderData<typeof loader>();

  return (
    <FormProvider initialData={initialData}>
      <AnnouncementForm/>
    </FormProvider>
  );
}
