import {
  Popover,
  ResourceList,
  ResourceItem,
  Icon, TextField,
} from "@shopify/polaris";
import type {PopoverCloseSource} from "@shopify/polaris";
import {useState, useCallback} from "react";
import {ClockIcon} from "@shopify/polaris-icons";

// Time utilities
const toInt = (time: string) => {
  const [hours, minutes] = time.split(':').map(parseFloat);
  return hours * 2 + minutes / 30;
};

const toTime = (int: number) => {
  let hours = Math.floor(int / 2);
  const minutes = int % 2 ? '30' : '00';
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
};

const range = (from: number, to: number) =>
  Array(to - from + 1).fill(0).map((_, i) => from + i);

const eachHalfHour = (t1: string, t2: string) => {
  const start = toInt(t1);
  const end = toInt(t2);
  return range(start, end).map(toTime);
};

const timeList = eachHalfHour("00:00", "23:30").map(time => ({
  id: time,
  content: time,
}));

interface TimePickerPopoverProps {
  selectedTime: string;
  onChange: (time: string) => void;
  label?: string;
  error?: boolean;
}

export function TimePickerPopover({
                                    selectedTime,
                                    onChange,
                                    label = "Time",
                                    error,
                                  }: TimePickerPopoverProps) {
  const [visible, setVisible] = useState(false);

  const handleOnClose = useCallback((source: PopoverCloseSource) => {
    setVisible(false);
  }, []);

  const handleTimeSelection = useCallback((time: string) => {
    onChange(time);
    setVisible(false);
  }, [onChange]);

  const textFieldMarkup = (
    <TextField
      role="combobox"
      label={"Start date"}
      labelHidden={true}
      value={selectedTime}
      prefix={<Icon source={ClockIcon} />}
      onFocus={() => setVisible(true)}
      autoComplete="off"
    />
  );

  return (
    <Popover
      active={visible}
      autofocusTarget="none"
      preferredAlignment="left"
      preferInputActivator={false}
      preferredPosition="below"
      fullWidth
      preventCloseOnChildOverlayClick
      onClose={handleOnClose}
      activator={textFieldMarkup}
    >
      <ResourceList
        items={timeList}
        renderItem={(item) => (
          <ResourceItem
            id={item.id}
            onClick={() => handleTimeSelection(item.content)}
          >
            {item.content}
          </ResourceItem>
        )}
      />
    </Popover>
  );
}
