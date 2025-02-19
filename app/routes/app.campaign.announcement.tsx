import {
  Page,
  Tabs,
  Box,
  Badge,
  InlineStack,
  Text,
  Spinner,
  BlockStack,
} from "@shopify/polaris";
import {useNavigate, useLoaderData, Form} from "@remix-run/react";
import React, {useState, useCallback, useEffect} from "react";
import type {LoaderFunctionArgs, ActionFunctionArgs} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {authenticate, unauthenticated} from "../shopify.server";
import {validateAnnouncement} from "../schemas/announcement";
import {TABS, DEFAULT_INITIAL_DATA} from "../constants/announcement-form";
import type {FormState, LoaderData} from "../types/announcement-form";
import {ZodError} from "zod";
import Storefront from "../services/storefront.server";
import {AnnouncementAction} from "../services/announcementAction.server";
import {FormProvider, useFormContext} from "../contexts/AnnouncementFormContext";
import {AnnouncementTabs} from "../components/announcement/AnnouncementTabs";
import {ValidationMessages} from "../components/announcement/ValidationMessages";
import {useAnnouncementSubmit} from "../hooks/useAnnouncementSubmit";

export type ActionData =
  | { success: true; redirectTo?: string; message?: string; formData?: FormState }
  | { error: string; details?: ZodError['errors']; formData?: FormState };

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

// Action
export const action = async ({request}: ActionFunctionArgs) => {
  try {
    const {session} = await authenticate.admin(request);
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);
    const parsedData = JSON.parse(rawData.formData as string);
    const action = rawData.action as string;

    if (parsedData.basic) {
      parsedData.basic.startDate = new Date(parsedData.basic.startDate);
      parsedData.basic.endDate = new Date(parsedData.basic.endDate);
      // Set the status based on the action
      parsedData.basic.status = action === 'publish' ? 'published' : 'draft';
    }

    try {
      const validatedData = validateAnnouncement(parsedData);
      if (validatedData) {
        const announcementAction = new AnnouncementAction();
        let result;

        if (parsedData.basic.id) {
          // If announcement exists, update it
          result = await announcementAction.updateBasicBannerFormData(
            parsedData.basic.id,
            validatedData,
            session.shop
          );
        } else {
          // If it's a new announcement, create it
          result = await announcementAction.createBasicBannerFormData(
            validatedData,
            session.shop
          );
        }
        
        // Always return the updated data
        const updatedFormData = {
          ...parsedData,
          basic: {
            ...parsedData.basic,
            id: result?.id ?? parsedData.basic.id,
            status: action === 'publish' ? 'published' : 'draft'
          }
        };

        if (action === 'publish') {
          return json<ActionData>({ 
            success: true,
            redirectTo: '/app',
            message: 'Successfully published',
            formData: updatedFormData
          });
        }

        return json<ActionData>({ 
          success: true,
          message: 'Successfully saved as draft',
          formData: updatedFormData
        });
      }
    } catch (e) {
      if (e instanceof ZodError) {
        return json<ActionData>({
          error: 'Validation failed',
          details: e.errors,
          formData: parsedData,
        }, {status: 400});
      }
      console.log(e);
      return json<ActionData>({ 
        error: 'Failed to create announcement',
        formData: parsedData,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Form parsing error:', error);
    return json<ActionData>({
      error: 'Invalid form data',
      formData: undefined,
    }, {status: 400});
  }
};

function AnnouncementForm() {
  const navigate = useNavigate();
  const {pages} = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState(0);
  const {formData, setFormData, validationErrors, validateForm} = useFormContext();
  const {handleSubmit, isSubmitting, actionData} = useAnnouncementSubmit(validateForm);
  const [showSuccessChip, setShowSuccessChip] = useState(false);
  const [actionType, setActionType] = useState<'draft' | 'publish' | null>(null);

  // Show success chip when draft is saved and update form data
  useEffect(() => {
    if (actionData && 'success' in actionData) {
      setShowSuccessChip(true);
      // Update form data with saved data if available
      if ('formData' in actionData && actionData.formData) {
        setFormData(actionData.formData);
      }
      // Only reset action type if not publishing (let the redirect handle publishing reset)
      if (actionType !== 'publish') {
        setActionType(null);
      }
    }
    // Restore form data if there was an error
    if (actionData && 'error' in actionData && 'formData' in actionData && actionData.formData) {
      setFormData(actionData.formData);
      setActionType(null);
    }
  }, [actionData, setFormData, actionType]);

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

  const handleFormSubmit = (action: 'draft' | 'publish') => {
    const form = document.querySelector('form');
    if (form && validateForm()) {
      setActionType(action);
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'action';
      input.value = action;
      form.appendChild(input);
      form.requestSubmit();
    }
  };

  // Determine if this is a new announcement or editing an existing one
  const isNewAnnouncement = !formData.basic.id;
  const isDraft = formData.basic.status === 'draft';
  const isSaved = !isNewAnnouncement && isDraft;

  // Define primary action based on state
  const primaryAction = isSaved ? {
    content: isSubmitting && actionType === 'publish' ? "Publishing..." : "Publish",
    loading: isSubmitting && actionType === 'publish',
    onAction: () => handleFormSubmit('publish'),
    disabled: isSubmitting,
  } : undefined;

  // Define secondary actions based on state
  const secondaryActions = [
    {
      content: 'Cancel',
      onAction: () => navigate("/app/campaign/banner_type"),
      disabled: isSubmitting,
    },
    {
      content: isSubmitting && actionType === 'draft' ? 'Saving...' : (isNewAnnouncement ? 'Save as Draft' : 'Save Changes'),
      onAction: () => handleFormSubmit('draft'),
      disabled: isSubmitting,
      loading: isSubmitting && actionType === 'draft',
    },
  ];

  return (
    <Form method="post" onSubmit={handleSubmit}>
      <Page
        title="Announcement Bar"
        backAction={{content: "Banner Types", url: "/app/campaign/banner_type"}}
        primaryAction={primaryAction}
        secondaryActions={secondaryActions}
      >
        {isSubmitting && (
          <Box paddingBlockEnd="400">
            <InlineStack gap="200" align="center">
              <Spinner size="small" />
              <Text as="span">
                {actionType === 'publish' ? 'Publishing announcement...' : 'Saving draft...'}
              </Text>
            </InlineStack>
          </Box>
        )}
        {(showSuccessChip || isSaved) && !isSubmitting && (
          <Box paddingBlockEnd="400">
            <InlineStack gap="200" align="start">
              <Badge tone="success">
                {showSuccessChip ? 'Changes saved' : 'Draft saved'}
              </Badge>
            </InlineStack>
          </Box>
        )}
        <BlockStack gap="400">
          <ValidationMessages
            validationErrors={validationErrors}
            actionData={actionData}
          />
          <Tabs tabs={TABS} selected={selected} onSelect={handleTabChange}>
            <Box padding="200">
              <AnnouncementTabs selected={selected} pages={pages} />
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
      <AnnouncementForm />
    </FormProvider>
  );
}
