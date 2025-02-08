import {
  Page,
  Tabs,
  Box,
} from "@shopify/polaris";
import {useNavigate, useLoaderData, Form} from "@remix-run/react";
import React, {useState, useCallback} from "react";
import type {LoaderFunctionArgs, ActionFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
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
  | { success: true }
  | { error: string; details?: ZodError['errors'] };

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
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);
    const parsedData = JSON.parse(rawData.formData as string);

    if (parsedData.basic) {
      parsedData.basic.startDate = new Date(parsedData.basic.startDate);
      parsedData.basic.endDate = new Date(parsedData.basic.endDate);
    }

    const validatedData = validateAnnouncement(parsedData);
    try {
      if (validatedData) {
        const announcementAction = new AnnouncementAction();
        await announcementAction.createFromFormData(validatedData, "hexsis-test-store");
        return json<ActionData>({ success: true });
      }
    } catch (e) {
      console.log(e);
      return json<ActionData>({ error: 'Failed to create announcement' }, { status: 500 });
    }

  } catch (error) {
    if (error instanceof ZodError) {
      return json<ActionData>({
        error: 'Validation failed',
        details: error.errors
      }, {status: 400});
    }
    return json<ActionData>({error: 'Invalid form data'}, {status: 400});
  }
};

function AnnouncementForm() {
  const navigate = useNavigate();
  const {pages} = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState(0);
  const {formData, validationErrors, validateForm} = useFormContext();
  const {handleSubmit, isSubmitting, actionData} = useAnnouncementSubmit(validateForm);

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );

  return (
    <Form method="post" onSubmit={handleSubmit}>
      <Page
        title="Announcement Bar"
        backAction={{content: "Banner Types", url: "/app/campaign/banner_type"}}
        primaryAction={{
          content: isSubmitting ? "Publishing..." : "Publish",
          loading: isSubmitting,
          onAction: () => {
            const form = document.querySelector('form');
            if (form && validateForm()) {
              form.requestSubmit();
            }
          },
          disabled: isSubmitting,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => navigate("/app/campaign/banner_type"),
            disabled: isSubmitting,
          },
        ]}
      >
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
