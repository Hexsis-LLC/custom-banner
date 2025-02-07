import {
  Modal,
  DatePicker,
  TextField,
  Icon,
  Popover,
  Box,
  Button,
  Text,
  BlockStack,
} from "@shopify/polaris";
import type {Range} from "@shopify/polaris";
import {useState, useCallback} from "react";

interface DatePickerPopoverProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  label?: string;
  isModal?: boolean;
  error?: boolean;
}

export function DatePickerPopover({
  selectedDate,
  onChange,
  label = "Date",
  isModal = false,
  error,
}: DatePickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(selectedDate);
  const [month, setMonth] = useState(selectedDate.getMonth());
  const [year, setYear] = useState(selectedDate.getFullYear());

  const handleMonthChange = useCallback(
    (month: number, year: number) => {
      setMonth(month);
      setYear(year);
    },
    [],
  );

  const handleDateChange = useCallback((range: Range) => {
    if (range.start) {
      setTempDate(range.start);
      if (!isModal) {
        onChange(range.start);
        setIsOpen(false);
      }
    }
  }, [isModal, onChange]);

  const handleConfirm = useCallback(() => {
    onChange(tempDate);
    setIsOpen(false);
  }, [tempDate, onChange]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const dateField = (
    <TextField
      role="combobox"
      label={label}
      labelHidden
      prefix={<Icon source="calendar"/>}
      value={formatDate(selectedDate)}
      onFocus={() => setIsOpen(true)}
      autoComplete="off"
      readOnly
    />
  );

  const togglePopoverActive = useCallback(
    () => setIsOpen((isOpen) => !isOpen),
    [],
  );

  const handleDateSelection = useCallback(
    ({end}: {end: Date}) => {
      onChange(end);
      togglePopoverActive();
    },
    [onChange, togglePopoverActive],
  );

  const activator = (
    <BlockStack gap="100">
      <Button
        onClick={togglePopoverActive}
        disclosure
        fullWidth
        textAlign="start"
        icon={<Icon source="calendar" />}
        tone={error ? "critical" : undefined}
      >
        {selectedDate.toLocaleDateString()}
      </Button>
    </BlockStack>
  );

  if (isModal) {
    return (
      <>
        {dateField}
        <Modal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title={`Select ${label.toLowerCase()}`}
          primaryAction={{
            content: 'Select',
            onAction: handleConfirm,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setIsOpen(false),
            },
          ]}
        >
          <Modal.Section>
            <DatePicker
              month={month}
              year={year}
              selected={{
                start: tempDate,
                end: tempDate,
              }}
              onChange={handleDateChange}
              onMonthChange={handleMonthChange}
              allowRange={false}
            />
          </Modal.Section>
        </Modal>
      </>
    );
  }

  return (
    <Popover
      active={isOpen}
      activator={activator}
      onClose={togglePopoverActive}
      autofocusTarget="none"
      preferredAlignment="left"
      preferInputActivator={false}
      preventCloseOnChildOverlayClick
      fullWidth
    >
      <Box padding="400">
        <DatePicker
          month={month}
          year={year}
          selected={{
            start: tempDate,
            end: tempDate,
          }}
          onMonthChange={handleMonthChange}
          onChange={handleDateSelection}
          allowRange={false}
        />
      </Box>
    </Popover>
  );
} 