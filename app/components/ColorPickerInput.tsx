import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Popover,
  ButtonGroup,
  BlockStack,
  Text,
  Box,
  InlineStack,
} from "@shopify/polaris";
import GradientColorPicker, { useColorPicker } from "react-best-gradient-color-picker";

type ColorPickerType = 'solid' | 'gradient' | null;

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helpText?: string;
  type?: ColorPickerType;
}

export function ColorPickerInput({
  label,
  value,
  onChange,
  error,
  helpText,
  type = null,
}: ColorPickerInputProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isGradient, setIsGradient] = useState(value.startsWith("linear-gradient"));
  const [color, setColor] = useState(value);
  const [inputValue, setInputValue] = useState(value);

  const { setSolid, setGradient } = useColorPicker(color, (newColor) => {
    setColor(newColor);
    setInputValue(newColor);
    onChange(newColor);
  });

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value);
    setColor(value);
  }, [value]);

  const handleTextFieldChange = (value: string) => {
    setInputValue(value);
    setColor(value);
    onChange(value);
  };

  const togglePicker = () => setIsPickerOpen(!isPickerOpen);

  const colorPreview = (
    <div
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: color,
        border: '1px solid #dde0e4',
        cursor: 'pointer',
      }}
      onClick={togglePicker}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          togglePicker();
        }
      }}
      aria-label="Choose color"
    />
  );

  const showColorTypeButtons = type === null;
  const isGradientMode = type === 'gradient' || (type === null && isGradient);

  const handleModeChange = (gradient: boolean) => {
    setIsGradient(gradient);
    if (gradient) {
      const newGradient = 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(255,255,255,1) 100%)';
      setGradient(newGradient);
      setInputValue(newGradient);
    } else {
      const newColor = 'rgba(0,0,0,1)';
      setSolid(newColor);
      setInputValue(newColor);
    }
  };

  return (
    <Popover
      activator={
        <TextField
          label={label}
          value={inputValue}
          onChange={handleTextFieldChange}
          error={error}
          helpText={helpText}
          readOnly
          autoComplete="off"
          suffix={colorPreview}
        />
      }
      fullHeight
      fluidContent
      active={isPickerOpen}
      onClose={togglePicker}
      sectioned={false}
      preferredAlignment="right"
    >
      <Box padding="400">
        <BlockStack gap="400">
          {showColorTypeButtons && (
            <ButtonGroup fullWidth>
              <Button
                pressed={!isGradient}
                onClick={() => handleModeChange(false)}
              >
                Solid Color
              </Button>
              <Button
                pressed={isGradient}
                onClick={() => handleModeChange(true)}
              >
                Gradient
              </Button>
            </ButtonGroup>
          )}

          <Box>
            <GradientColorPicker
              value={color}
              onChange={(newColor) => {
                setColor(newColor);
                setInputValue(newColor);
                onChange(newColor);
              }}
              hideColorTypeBtns={true}
              hideGradientType={!isGradientMode}
              hideGradientControls={!isGradientMode}
              height={100}
            />
          </Box>
        </BlockStack>
      </Box>
    </Popover>
  );
} 