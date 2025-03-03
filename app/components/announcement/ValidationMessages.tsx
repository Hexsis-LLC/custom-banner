import React from 'react';
import {Box, Banner} from "@shopify/polaris";
import type {ActionData} from "../../types/announcement-form";

interface ValidationMessagesProps {
  validationErrors: string[];
  actionData: ActionData | undefined;
}

export function ValidationMessages({validationErrors, actionData}: ValidationMessagesProps) {
  if (validationErrors.length === 0 && (!actionData || !('error' in actionData))) {
    return null;
  }

  return (
    <>
      {validationErrors.length > 0 && (
        <Box padding="400">
          <Banner
            title="Please review the following:"
            tone="warning"
          >
            <ul style={{margin: 0, paddingLeft: '20px'}}>
              {validationErrors.map((error, index) => (
                <li key={index} style={{marginBottom: '8px'}}>{error}</li>
              ))}
            </ul>
          </Banner>
        </Box>
      )}
      {actionData && 'error' in actionData && (
        <Box padding="400">
          <Banner
            title="Error"
            tone="critical"
          >
            {actionData.error as string}
          </Banner>
        </Box>
      )}
    </>
  );
}
