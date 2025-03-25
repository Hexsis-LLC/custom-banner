import {
  Modal,
  DatePicker,
  TextField,
  Icon,
  Popover,
  Card,
} from "@shopify/polaris";
import type { PopoverCloseSource } from "@shopify/polaris";
import { useState, useEffect } from "react";
import { CalendarIcon } from "@shopify/polaris-icons";

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
  const [visible, setVisible] = useState(false);
  const [{ month, year }, setDate] = useState({
    month: selectedDate.getMonth(),
    year: selectedDate.getFullYear(),
  });

  // ✅ Fix: Format date properly without UTC shift
  const formattedValue = selectedDate.toLocaleDateString("en-CA"); // "YYYY-MM-DD"

  function handleInputValueChange() {
    // Read-only field, no need to handle changes
  }

  function handleOnClose(source: PopoverCloseSource) {
    setVisible(false);
  }

  function handleMonthChange(month: number, year: number) {
    setDate({ month, year });
  }

  function handleDateSelection({ end: newSelectedDate }: { end: Date }) {
    onChange(newSelectedDate);
    setVisible(false);
  }

  useEffect(() => {
    if (selectedDate) {
      setDate({
        month: selectedDate.getMonth(),
        year: selectedDate.getFullYear(),
      });
    }
  }, [selectedDate]);

  const textFieldMarkup = (
    <TextField
      role="combobox"
      label="Start date"
      labelHidden
      prefix={<Icon source={CalendarIcon} />}
      value={formattedValue}
      onFocus={() => setVisible(true)}
      onChange={handleInputValueChange}
      autoComplete="off"
      error={error}
    />
  );

  if (isModal) {
    return (
      <>
        {textFieldMarkup}
        <Modal
          open={visible}
          onClose={() => setVisible(false)}
          title={`Select ${label.toLowerCase()}`}
          primaryAction={{
            content: "Select",
            onAction: () => setVisible(false),
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setVisible(false),
            },
          ]}
        >
          <Modal.Section>
            <DatePicker
              month={month}
              year={year}
              selected={selectedDate}
              onMonthChange={handleMonthChange}
              onChange={handleDateSelection}
            />
          </Modal.Section>
        </Modal>
      </>
    );
  }

  return (
    <Popover
      active={visible}
      autofocusTarget="none"
      preferredAlignment="left"
      preferInputActivator={false}
      preferredPosition="below"
      preventCloseOnChildOverlayClick
      onClose={handleOnClose}
      activator={textFieldMarkup}
    >
      <Card>
        <DatePicker
          month={month}
          year={year}
          selected={selectedDate}
          onMonthChange={handleMonthChange}
          onChange={handleDateSelection}
        />
      </Card>
    </Popover>
  );
}
