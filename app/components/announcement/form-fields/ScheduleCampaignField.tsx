import {
  Card,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  Select,
  Box,
} from "@shopify/polaris";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { z } from "zod";
import { DatePickerPopover } from "../../DatePickerPopover";
import { TimePickerPopover } from "../../TimePickerPopover";
import type {BasicSettings} from "../../../types/announcement";
import {FormError} from "../../../types/announcement-form";

interface ScheduleCampaignFieldProps {
  initialData: BasicSettings;
  onDataChange: (data: BasicSettings, isValid: boolean) => void;
  externalErrors?: FormError[];
}

export function ScheduleCampaignField({
                                        initialData,
                                        onDataChange,
                                        externalErrors = [],
}: ScheduleCampaignFieldProps) {

  const [formData, setFormData] = useState<BasicSettings>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onChangeHandler = useCallback(
    (value: Partial<BasicSettings>) => {
      setFormData((prev) => {
        const updatedData = { ...prev, ...value };
        onDataChange(updatedData, true);

        return updatedData;
      })
    },[onDataChange])
  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          <InlineStack gap="200">
            <Text variant="headingMd" as="h6">Schedule Campaign</Text>
            <Icon source="help" />
          </InlineStack>

          <InlineStack gap={"300"}>
            <div style={{flex: 1}}>
              <BlockStack gap="300">
                <Text variant="bodyMd" fontWeight="medium" as="p">Start</Text>
                <Select
                  label="Start type"
                  labelHidden
                  options={[
                    {label: 'Start now', value: 'now'},
                    {label: 'Schedule start', value: 'specific'}
                  ]}
                  value={formData.startType}
                  onChange={(selected, id) => {
                    onChangeHandler({startType: selected as 'now' | 'specific'});
                  }}
                  //error={hasError('startType')}
                />

                {formData.startType === 'specific' && (
                  <InlineStack gap="400">
                    <div style={{flex: 1}}>
                      <DatePickerPopover
                        label="Start Date"
                        selectedDate={new Date()}
                        onChange={(date) => {
                          onChangeHandler({startDate: date});
                        }}
                        //error={hasError('startDate')}
                      />
                    </div>
                    <div style={{flex: 1}}>
                      <TimePickerPopover
                        label="Start Time"
                        selectedTime={ formData.startTime || '12:00 PM'}
                        onChange={(date) => {
                          onChangeHandler({startTime: date});
                        }}
                      />
                    </div>
                  </InlineStack>
                )}
              </BlockStack>
            </div>

            <div style={{flex: 1}}>
              <BlockStack gap="300">
                <Text variant="bodyMd" fontWeight="medium" as="p">End</Text>
                <Select
                  label="End type"
                  labelHidden
                  options={[
                    {label: 'Until I stop it', value: 'until_stop'},
                    {label: 'Schedule end', value: 'specific'}
                  ]}
                  value={formData.endType}
                  onChange={(value) => {
                    onChangeHandler({endType: value as 'until_stop' | 'specific'});
                  }}
                  // error={hasError('endType')}
                />

                {formData.endType === 'specific' && (
                  <InlineStack gap="400">
                    <div style={{flex: 1}}>
                      <DatePickerPopover
                        label="End Date"
                        selectedDate={new Date()}
                        onChange={(value) => {
                          onChangeHandler({endDate: value});
                        }}
                        //error={hasError('endDate')}
                      />
                    </div>
                    <div style={{flex: 1}}>
                      <TimePickerPopover
                        label="End Time"
                        selectedTime={ formData.endTime || '12:00 PM'}
                        onChange={(value) => {
                          onChangeHandler({endTime: value});
                        }}
                        //error={hasError('endTime')}
                      />

                    </div>
                  </InlineStack>
                )}
              </BlockStack>
            </div>
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
}
