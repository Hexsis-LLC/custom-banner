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
import type {FormState, LoaderData} from "../types/announcement-form";
import Storefront from "../services/storefront.server";
import {FormProvider, useFormContext} from "../contexts/AnnouncementFormContext";
import {AnnouncementTabs} from "../components/announcement/AnnouncementTabs";
import {ValidationMessages} from "../components/announcement/ValidationMessages";
import {AdjustIcon, ChevronDownIcon} from "@shopify/polaris-icons";

// Loader
export const loader = async ({request}: LoaderFunctionArgs) => {
  const {session} = await authenticate.admin(request);
  const {storefront} = await unauthenticated.storefront(session.shop)
  const storeFrontService = new Storefront(storefront)
  const pages = await storeFrontService.getStorePages();
  const formData: FormState = {
    ...DEFAULT_INITIAL_DATA,
    basic: {
      ...DEFAULT_INITIAL_DATA.basic,
      startDate: DEFAULT_INITIAL_DATA.basic.startDate.toISOString(),
      endDate: DEFAULT_INITIAL_DATA.basic.endDate.toISOString(),
      status: 'draft',
    },
  };
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
        title="Announcement Bar"
        backAction={{content: "Banner Types", url: "/app/campaign/banner_type"}}
        primaryAction={(
          <ButtonGroup variant="segmented">
            <Button
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              onClick={async () => {
              await handleFormSubmit('publish')
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
                  icon={ChevronDownIcon}
                  disabled={isSubmitting}
                  accessibilityLabel="Other save actions"
                />
              }
              autofocusTarget="first-node"
              onClose={toggleActive('popover1')}
            >
              <ActionList
                actionRole="menuitem"
                items={[{content: 'Save as draft', onAction: () => handleFormSubmit('draft')}]}
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
            actionData={null}
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
