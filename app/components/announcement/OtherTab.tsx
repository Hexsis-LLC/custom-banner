import {
  BlockStack,
  Card,
  InlineStack,
  RadioButton,
  Select,
  Text,
  Tag,
  Combobox,
  Listbox,
  DatePicker,
  Modal,
  Button, Icon, TextField,
} from "@shopify/polaris";
import type {Range} from "@shopify/polaris";
import {useState, useCallback} from "react";
import {DatePickerPopover} from "../DatePickerPopover";

interface OtherTabProps {
  closeButtonPosition: string;
  displayBeforeDelay: string;
  showAfterClosing: string;
  showAfterCTA: string;
  selectedPages: string[];
  campaignTiming: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  onCloseButtonPositionChange: (value: string) => void;
  onDisplayBeforeDelayChange: (value: string) => void;
  onShowAfterClosingChange: (value: string) => void;
  onShowAfterCTAChange: (value: string) => void;
  onSelectedPagesChange: (value: string[]) => void;
  onCampaignTimingChange: (value: string) => void;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export function OtherTab({
  closeButtonPosition,
  displayBeforeDelay,
  showAfterClosing,
  showAfterCTA,
  selectedPages,
  campaignTiming,
  startDate,
  endDate,
  startTime,
  endTime,
  onCloseButtonPositionChange,
  onDisplayBeforeDelayChange,
  onShowAfterClosingChange,
  onShowAfterCTAChange,
  onSelectedPagesChange,
  onCampaignTimingChange,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
}: OtherTabProps) {
  const [pagesInputValue, setPagesInputValue] = useState('');
  const [pagesOptions] = useState([
    {label: 'Home page', value: 'home'},
    {label: 'Products', value: 'products'},
    {label: 'Collections', value: 'collections'},
    {label: 'Blog posts', value: 'blog'},
    {label: 'Pages', value: 'pages'},
    {label: 'Cart', value: 'cart'},
  ]);

  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date>(endDate);

  const [startMonth, setStartMonth] = useState(startDate.getMonth());
  const [startYear, setStartYear] = useState(startDate.getFullYear());
  const [endMonth, setEndMonth] = useState(endDate.getMonth());
  const [endYear, setEndYear] = useState(endDate.getFullYear());

  const handleCloseButtonChange = useCallback(
    (checked: boolean, newValue: string) => {
      if (checked) {
        onCloseButtonPositionChange(newValue);
      }
    },
    [onCloseButtonPositionChange],
  );

  const handlePagesChange = useCallback(
    (value: string) => {
      const newSelection = selectedPages.includes(value)
        ? selectedPages.filter((page) => page !== value)
        : [...selectedPages, value];
      onSelectedPagesChange(newSelection);
    },
    [selectedPages, onSelectedPagesChange],
  );

  const handlePagesRemove = useCallback(
    (value: string) => {
      const updatedSelection = selectedPages.filter((page) => page !== value);
      onSelectedPagesChange(updatedSelection);
    },
    [selectedPages, onSelectedPagesChange],
  );

  const handleCampaignTimingChange = useCallback(
    (checked: boolean, newValue: string) => {
      if (checked) {
        onCampaignTimingChange(newValue);
      }
    },
    [onCampaignTimingChange],
  );

  const timeOptions = [
    {label: '12:00 AM', value: '00:00'},
    {label: '12:30 AM', value: '00:30'},
    {label: '1:00 AM', value: '01:00'},
    {label: '1:30 AM', value: '01:30'},
    // Add more time options as needed
    {label: '11:30 PM', value: '23:30'},
  ];

  const delayOptions = [
    {label: 'No delay', value: 'no-delay'},
    {label: '5 seconds', value: '5s'},
    {label: '10 seconds', value: '10s'},
    {label: '15 seconds', value: '15s'},
  ];

  const showAgainOptions = [
    {label: "Don't show again", value: 'never'},
    {label: 'After 1 hour', value: '1h'},
    {label: 'After 24 hours', value: '24h'},
    {label: 'After 7 days', value: '7d'},
  ];

  const formatPagesTitle = useCallback(
    (selectedPages: string[]) => {
      return selectedPages.length > 0
        ? selectedPages
            .map((page) => pagesOptions.find((option) => option.value === page)?.label)
            .join(', ')
        : 'Select pages';
    },
    [pagesOptions],
  );

  const handleStartDateSelect = useCallback(() => {
    onStartDateChange(tempStartDate);
    setIsStartDatePickerOpen(false);
  }, [tempStartDate, onStartDateChange]);

  const handleEndDateSelect = useCallback(() => {
    onEndDateChange(tempEndDate);
    setIsEndDatePickerOpen(false);
  }, [tempEndDate, onEndDateChange]);

  const handleTempStartDateChange = useCallback((range: Range) => {
    if (range.start) {
      setTempStartDate(range.start);
    }
  }, []);

  const handleTempEndDateChange = useCallback((range: Range) => {
    if (range.start) {
      setTempEndDate(range.start);
    }
  }, []);

  const handleMonthChange = useCallback(
    (month: number, year: number, isStart: boolean) => {
      if (isStart) {
        setStartMonth(month);
        setStartYear(year);
      } else {
        setEndMonth(month);
        setEndYear(year);
      }
    },
    [],
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Other Settings
          </Text>

          <BlockStack gap="400">
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd">
                Show close button
              </Text>
              <InlineStack gap="400" align="start">
                <RadioButton
                  label="Disabled"
                  checked={closeButtonPosition === "disabled"}
                  id="disabled"
                  name="closeButton"
                  onChange={(checked: boolean) => handleCloseButtonChange(checked, "disabled")}
                />
                <RadioButton
                  label="Left"
                  checked={closeButtonPosition === "left"}
                  id="left"
                  name="closeButton"
                  onChange={(checked: boolean) => handleCloseButtonChange(checked, "left")}
                />
                <RadioButton
                  label="Right"
                  checked={closeButtonPosition === "right"}
                  id="right"
                  name="closeButton"
                  onChange={(checked: boolean) => handleCloseButtonChange(checked, "right")}
                />
              </InlineStack>
            </BlockStack>

            <InlineStack gap="400" align="start">
              <div style={{flex: 1}}>
                <Select
                  label="Display before showing bar"
                  options={delayOptions}
                  onChange={onDisplayBeforeDelayChange}
                  value={displayBeforeDelay}
                />
              </div>
              <div style={{flex: 1}}>
                <Select
                  label="Show bar again after closing"
                  options={showAgainOptions}
                  onChange={onShowAfterClosingChange}
                  value={showAfterClosing}
                />
              </div>
              <div style={{flex: 1}}>
                <Select
                  label="Show bar again after CTA clicked"
                  options={delayOptions}
                  onChange={onShowAfterCTAChange}
                  value={showAfterCTA}
                />
              </div>
            </InlineStack>

            <BlockStack gap="200">
              <Text as="p" variant="bodyMd">
                Appear on pages
              </Text>
              <Select
                label=""
                labelHidden
                options={pagesOptions}
                onChange={(value) => handlePagesChange(value)}
                value=""
                placeholder="Select pages"
              />
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                {selectedPages.map((page) => {
                  const label = pagesOptions.find((option) => option.value === page)?.label;
                  return (
                    <Tag key={page} onRemove={() => handlePagesRemove(page)}>
                      {label}
                    </Tag>
                  );
                })}
              </div>
            </BlockStack>
          </BlockStack>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Schedule campaign
          </Text>

          <BlockStack gap="200">
            <Text as="p" variant="bodyMd">
              Select timing of your campaign
            </Text>
            <InlineStack gap="400" align="start">
              <RadioButton
                label="Begin showing bar immediately"
                checked={campaignTiming === "immediate"}
                id="immediate"
                name="timing"
                onChange={(checked: boolean) => handleCampaignTimingChange(checked, "immediate")}
              />
              <RadioButton
                label="Only show bar on specific time"
                checked={campaignTiming === "specific"}
                id="specific"
                name="timing"
                onChange={(checked: boolean) => handleCampaignTimingChange(checked, "specific")}
              />
            </InlineStack>

            {campaignTiming === "specific" && (
              <BlockStack gap="400">
                <InlineStack gap="400" align="start">
                  <div style={{flex: 1}}>
                    <Select
                      label="Start"
                      options={[{label: 'On specific date/time', value: 'specific'}]}
                      onChange={() => {}}
                      value="specific"
                    />
                  </div>
                  <div style={{flex: 1}}>
                    <Select
                      label="End"
                      options={[{label: 'On specific date/time', value: 'specific'}]}
                      onChange={() => {}}
                      value="specific"
                    />
                  </div>
                </InlineStack>

                <InlineStack gap="400">
                  <div style={{flex: 1}}>
                    <Text as="p" variant="bodyMd">Date</Text>
                    <DatePickerPopover
                      selectedDate={startDate}
                      onChange={onStartDateChange}
                      label="Start date"
                      isModal
                    />
                  </div>
                  <div style={{flex: 1}}>
                    <Text as="p" variant="bodyMd">Time (GMT+06:00)</Text>
                    <Select
                      label=""
                      labelHidden
                      options={timeOptions}
                      onChange={onStartTimeChange}
                      value={startTime}
                    />
                  </div>
                  <div style={{flex: 1}}>
                    <Text as="p" variant="bodyMd">Date</Text>
                    <DatePickerPopover
                      selectedDate={endDate}
                      onChange={onEndDateChange}
                      label="End date"
                      isModal
                    />
                  </div>
                  <div style={{flex: 1}}>
                    <Text as="p" variant="bodyMd">Time (GMT+06:00)</Text>
                    <Select
                      label=""
                      labelHidden
                      options={timeOptions}
                      onChange={onEndTimeChange}
                      value={endTime}
                    />
                  </div>
                </InlineStack>
              </BlockStack>
            )}
          </BlockStack>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
