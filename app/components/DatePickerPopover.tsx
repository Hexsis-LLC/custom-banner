import {
  Modal,
  DatePicker,
  TextField,
  Icon,
  Popover,
  Box,
} from "@shopify/polaris";
import type {Range} from "@shopify/polaris";
import {useState, useCallback} from "react";

interface DatePickerPopoverProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  label?: string;
  isModal?: boolean;
}

export function DatePickerPopover({
  selectedDate,
  onChange,
  label = "Date",
  isModal = false,
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
      autofocusTarget="none"
      preferredAlignment="left"
      fullWidth
      preferInputActivator={false}
      preferredPosition="below"
      preventCloseOnChildOverlayClick
      onClose={() => setIsOpen(false)}
      activator={dateField}
    >
      <Box padding="400">
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
      </Box>
    </Popover>
  );
} 