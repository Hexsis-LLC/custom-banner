import {
  Modal,
  DatePicker,
  TextField,
  Icon,
  Popover,
  Box,
  Card,
  BlockStack,
} from "@shopify/polaris";
import type {PopoverCloseSource} from "@shopify/polaris";
import {useState, useRef, useEffect} from "react";
import {CalendarIcon} from "@shopify/polaris-icons";

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
  function nodeContainsDescendant(rootNode: any, descendant: any) {
    if (rootNode === descendant) {
      return true;
    }
    let parent = descendant.parentNode;
    while (parent != null) {
      if (parent === rootNode) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  }

  const [visible, setVisible] = useState(false);
  const [{month, year}, setDate] = useState({
    month: selectedDate.getMonth(),
    year: selectedDate.getFullYear(),
  });

  const formattedValue = selectedDate.toISOString().slice(0, 10);
  const datePickerRef = useRef(null);

  function isNodeWithinPopover(node: any) {
    return datePickerRef?.current
      ? nodeContainsDescendant(datePickerRef.current, node)
      : false;
  }

  function handleInputValueChange() {
    // Read-only field, no need to handle changes
  }

  function handleOnClose(source: PopoverCloseSource) {
    setVisible(false);
  }

  function handleMonthChange(month: number, year: number) {
    setDate({month, year});
  }

  function handleDateSelection({end: newSelectedDate}: {end: Date}) {
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
      label={"Start date"}
      labelHidden={true}
      prefix={<Icon source={CalendarIcon} />}
      value={formattedValue}
      onFocus={() => setVisible(true)}
      onChange={handleInputValueChange}
      autoComplete="off"
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
            content: 'Select',
            onAction: () => setVisible(false),
          }}
          secondaryActions={[
            {
              content: 'Cancel',
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

