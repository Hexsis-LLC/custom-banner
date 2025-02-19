import {useCallback, useEffect} from 'react';
import {useNavigate, useSubmit, useNavigation, useActionData} from "@remix-run/react";
import type {ActionData} from "../routes/app.campaign.announcement";

export function useAnnouncementSubmit(validateForm: () => boolean) {
  const navigate = useNavigate();
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData<ActionData>();

  const isSubmitting = navigation.state === "submitting";

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      submit(e.currentTarget, { method: 'post' });
    }
  }, [validateForm, submit]);

  // Watch for successful submission and navigate only if redirectTo is present
  useEffect(() => {
    if (navigation.state === "idle" && actionData && 'success' in actionData && actionData.redirectTo) {
      navigate(actionData.redirectTo);
    }
  }, [navigation.state, actionData, navigate]);

  return {
    handleSubmit,
    isSubmitting,
    actionData,
  };
} 