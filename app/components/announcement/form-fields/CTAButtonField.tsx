import {
  Card,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  RadioButton,
  TextField,
  RangeSlider,
  Box,
} from "@shopify/polaris";
import { useFormContext } from "../../../contexts/AnnouncementFormContext";
import { FontSection } from "../fontSection";

type CTAType = 'regular' | 'bar' | 'link' | 'none';

export function CTAButtonField() {
  const { formData, handleFormChange, hasError, getFieldErrorMessage } = useFormContext();

  const onCtaTypeChange = (value: CTAType) => {
    handleFormChange('cta', { ctaType: value });
  };

  const onPaddingChange = (value: number, position: 'top' | 'right' | 'bottom' | 'left') => {
    const newPadding = { ...formData.cta.padding, [position]: value };
    handleFormChange('cta', { padding: newPadding });
  };

  const onFontTypeChange = (value: string) => {
    handleFormChange('cta', { fontType: value });
  };

  const onFontUrlChange = (value: string) => {
    handleFormChange('cta', { fontUrl: value });
  };

  const onCtaTextChange = (value: string) => {
    handleFormChange('cta', { ctaText: value });
  };

  const onCtaLinkChange = (value: string) => {
    handleFormChange('cta', { ctaLink: value });
  };

  const onCtaButtonFontColorChange = (value: string) => {
    handleFormChange('cta', { buttonFontColor: value });
  };

  const onCtaButtonBackgroundColorChange = (value: string) => {
    handleFormChange('cta', { buttonBackgroundColor: value });
  };

  const renderFields = () => {
    switch (formData.cta.ctaType) {
      case 'link':
      case 'regular':
        return (
          <BlockStack gap="400">
            <TextField
              label="Button Text"
              value={formData.cta.ctaText}
              onChange={onCtaTextChange}
              autoComplete="off"
              error={hasError('cta.ctaText')}
              helpText={hasError('cta.ctaText') ? getFieldErrorMessage('cta.ctaText') : undefined}
            />
            <TextField
              label="Link URL"
              value={formData.cta.ctaLink}
              onChange={onCtaLinkChange}
              autoComplete="off"
              error={hasError('cta.ctaLink')}
              helpText={hasError('cta.ctaLink') ? getFieldErrorMessage('cta.ctaLink') : undefined}
            />
            {formData.cta.ctaType === 'regular' && (
              <InlineStack gap="400" align="space-between">
                <div style={{width: '49%'}}>
                  <TextField
                    label="Button Text Color"
                    value={formData.cta.buttonFontColor}
                    onChange={onCtaButtonFontColorChange}
                    autoComplete="off"
                    prefix="#"
                    error={hasError('cta.buttonFontColor')}
                    helpText={hasError('cta.buttonFontColor') ? getFieldErrorMessage('cta.buttonFontColor') : undefined}
                  />
                </div>
                <div style={{width: '49%'}}>
                  <TextField
                    label="Button Background Color"
                    value={formData.cta.buttonBackgroundColor}
                    onChange={onCtaButtonBackgroundColorChange}
                    autoComplete="off"
                    prefix="#"
                    error={hasError('cta.buttonBackgroundColor')}
                    helpText={hasError('cta.buttonBackgroundColor') ? getFieldErrorMessage('cta.buttonBackgroundColor') : undefined}
                  />
                </div>
              </InlineStack>
            )}
          </BlockStack>
        );
      case 'bar':
        return (
          <TextField
            label="Link URL"
            value={formData.cta.ctaLink}
            onChange={onCtaLinkChange}
            autoComplete="off"
            error={hasError('cta.ctaLink')}
            helpText={hasError('cta.ctaLink') ? getFieldErrorMessage('cta.ctaLink') : undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          {/* CTA Type Section */}
          <BlockStack gap="400">
            <InlineStack align="start" gap="200">
              <Text variant="headingMd" as="h6">CTA</Text>
              <Icon source="help"/>
            </InlineStack>

            <InlineStack gap="300">
              <RadioButton
                label="Clickable link"
                checked={formData.cta.ctaType === 'link'}
                id="link"
                name="cta"
                onChange={() => onCtaTypeChange('link')}
              />
              <RadioButton
                label="Clickable bar"
                checked={formData.cta.ctaType === 'bar'}
                id="bar"
                name="cta"
                onChange={() => onCtaTypeChange('bar')}
              />
              <RadioButton
                label="Regular Button"
                checked={formData.cta.ctaType === 'regular'}
                id="regular"
                name="cta"
                onChange={() => onCtaTypeChange('regular')}
              />
              <RadioButton
                label="None"
                checked={formData.cta.ctaType === 'none'}
                id="none"
                name="cta"
                onChange={() => onCtaTypeChange('none')}
              />
            </InlineStack>
          </BlockStack>

          {/* Conditional Fields */}
          {renderFields()}

          {/* Font Section - Only show for link and regular types */}
          {(formData.cta.ctaType === 'link' || formData.cta.ctaType === 'regular') && (
            <FontSection
              fontType={formData.cta.fontType}
              fontUrl={formData.cta.fontUrl}
              hasError={hasError}
              getFieldErrorMessage={getFieldErrorMessage}
              onFontTypeChange={onFontTypeChange}
              onFontUrlChange={onFontUrlChange}
              errorPath="cta"
            />
          )}

          {/* Padding Section - Only show for regular button type */}
          {formData.cta.ctaType === 'regular' && (
            <>
              <Text variant="headingMd" as="h6">Padding</Text>
              <InlineStack gap="400" align="space-between">
                <div style={{width: '49%'}}>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">Padding top</Text>
                    <RangeSlider
                      label="Padding top"
                      labelHidden
                      value={formData.cta.padding.top}
                      prefix={formData.cta.padding.top}
                      onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'top')}
                      output
                      suffix="px"
                      min={0}
                      max={50}
                    />
                    {hasError('cta.padding.top') && (
                      <Text tone="critical" as="span">{getFieldErrorMessage('cta.padding.top')}</Text>
                    )}
                  </BlockStack>
                </div>
                <div style={{width: '49%'}}>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">Padding right</Text>
                    <RangeSlider
                      label="Padding right"
                      labelHidden
                      value={formData.cta.padding.right}
                      prefix={formData.cta.padding.right}
                      onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'right')}
                      output
                      suffix="px"
                      min={0}
                      max={50}
                    />
                    {hasError('cta.padding.right') && (
                      <Text tone="critical" as="span">{getFieldErrorMessage('cta.padding.right')}</Text>
                    )}
                  </BlockStack>
                </div>
              </InlineStack>

              <InlineStack gap="400" align="space-between">
                <div style={{width: '49%'}}>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">Padding bottom</Text>
                    <RangeSlider
                      label="Padding bottom"
                      labelHidden
                      value={formData.cta.padding.bottom}
                      prefix={formData.cta.padding.bottom}
                      onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'bottom')}
                      output
                      suffix="px"
                      min={0}
                      max={50}
                    />
                    {hasError('cta.padding.bottom') && (
                      <Text tone="critical" as="span">{getFieldErrorMessage('cta.padding.bottom')}</Text>
                    )}
                  </BlockStack>
                </div>
                <div style={{width: '49%'}}>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">Padding left</Text>
                    <RangeSlider
                      label="Padding left"
                      labelHidden
                      value={formData.cta.padding.left}
                      prefix={formData.cta.padding.left}
                      onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'left')}
                      output
                      suffix="px"
                      min={0}
                      max={50}
                    />
                    {hasError('cta.padding.left') && (
                      <Text tone="critical" as="span">{getFieldErrorMessage('cta.padding.left')}</Text>
                    )}
                  </BlockStack>
                </div>
              </InlineStack>
            </>
          )}
        </BlockStack>
      </Box>
    </Card>
  );
} 