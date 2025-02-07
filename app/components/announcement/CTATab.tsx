import {
  TextField,
  RadioButton,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  RangeSlider,
  Card,
  Box,
} from "@shopify/polaris";

interface CTATabProps {
  ctaType: string;
  ctaText: string;
  ctaLink: string;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  fontType: string;
  fontSize: number;
  fontUrl?: string;
  ctaButtonFontColor: string;
  ctaButtonBackgroundColor: string;
  hasError: (field: string) => boolean;
  getFieldErrorMessage: (field: string) => string;
  onCtaButtonFontColorChange: (value: string) => void;
  onCtaButtonBackgroundColorChange: (value: string) => void;
  onCtaTypeChange: (value: string) => void;
  onCtaTextChange: (value: string) => void;
  onCtaLinkChange: (value: string) => void;
  onPaddingChange: (value: number, position: 'top' | 'right' | 'bottom' | 'left') => void;
  onFontTypeChange: (value: string) => void;
  onFontUrlChange: (value: string) => void;
  onFontSizeChange: (value: number) => void;
}

export function CTATab({
  ctaType,
  ctaText,
  ctaLink,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  fontType,
  fontSize,
  fontUrl = '',
  ctaButtonFontColor,
  ctaButtonBackgroundColor,
  hasError,
  getFieldErrorMessage,
  onCtaButtonFontColorChange,
  onCtaButtonBackgroundColorChange,
  onCtaTypeChange,
  onCtaTextChange,
  onCtaLinkChange,
  onPaddingChange,
  onFontTypeChange,
  onFontUrlChange,
  onFontSizeChange,
}: CTATabProps) {

  const renderFields = () => {
    switch (ctaType) {
      case 'none':
        return null;
      case 'link':
        return (
          <InlineStack gap="400" align="space-between">
            <div style={{width: '49%'}}>
              <TextField
                label="Call to action text"
                value={ctaText}
                autoComplete="off"
                onChange={onCtaTextChange}
                error={hasError('cta.ctaText')}
                helpText={hasError('cta.ctaText') ? getFieldErrorMessage('cta.ctaText') : undefined}
              />
            </div>
            <div style={{width: '49%'}}>
              <TextField
                label="Hyper Link"
                value={ctaLink}
                onChange={onCtaLinkChange}
                autoComplete="off"
                error={hasError('cta.ctaLink')}
                helpText={hasError('cta.ctaLink') ? getFieldErrorMessage('cta.ctaLink') : undefined}
              />
            </div>
          </InlineStack>
        );
      case 'bar':
        return (
          <div style={{width: '100%'}}>
            <TextField
              label="Hyper Link"
              value={ctaLink}
              onChange={onCtaLinkChange}
              autoComplete="off"
              error={hasError('cta.ctaLink')}
              helpText={hasError('cta.ctaLink') ? getFieldErrorMessage('cta.ctaLink') : undefined}
            />
          </div>
        );
      case 'regular':
        return (
          <>
            <InlineStack gap="400" align="space-between">
              <div style={{width: '49%'}}>
                <TextField
                  label="Call to action text"
                  value={ctaText}
                  autoComplete="off"
                  onChange={onCtaTextChange}
                  error={hasError('cta.ctaText')}
                  helpText={hasError('cta.ctaText') ? getFieldErrorMessage('cta.ctaText') : undefined}
                />
              </div>
              <div style={{width: '49%'}}>
                <TextField
                  label="Hyper Link"
                  value={ctaLink}
                  onChange={onCtaLinkChange}
                  autoComplete="off"
                  error={hasError('cta.ctaLink')}
                  helpText={hasError('cta.ctaLink') ? getFieldErrorMessage('cta.ctaLink') : undefined}
                />
              </div>
            </InlineStack>

            <InlineStack gap="400" align="space-between">
              <div style={{width: '49%'}}>
                <TextField
                  label="Button background"
                  autoComplete="off"
                  value={ctaButtonFontColor}
                  onChange={onCtaButtonFontColorChange}
                  prefix="#"
                  error={hasError('cta.buttonFontColor')}
                  helpText={hasError('cta.buttonFontColor') ? getFieldErrorMessage('cta.buttonFontColor') : undefined}
                />
              </div>
              <div style={{width: '49%'}}>
                <TextField
                  label="Button text color"
                  autoComplete="off"
                  value={ctaButtonBackgroundColor}
                  onChange={onCtaButtonBackgroundColorChange}
                  prefix="#"
                  error={hasError('cta.buttonBackgroundColor')}
                  helpText={hasError('cta.buttonBackgroundColor') ? getFieldErrorMessage('cta.buttonBackgroundColor') : undefined}
                />
              </div>
            </InlineStack>
          </>
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
                checked={ctaType === 'link'}
                id="link"
                name="cta"
                onChange={() => onCtaTypeChange('link')}
              />
              <RadioButton
                label="Clickable bar"
                checked={ctaType === 'bar'}
                id="bar"
                name="cta"
                onChange={() => onCtaTypeChange('bar')}
              />
              <RadioButton
                label="Regular Button"
                checked={ctaType === 'regular'}
                id="regular"
                name="cta"
                onChange={() => onCtaTypeChange('regular')}
              />
              <RadioButton
                label="None"
                checked={ctaType === 'none'}
                id="none"
                name="cta"
                onChange={() => onCtaTypeChange('none')}
              />
            </InlineStack>
          </BlockStack>

          {/* Conditional Fields */}
          {renderFields()}

          {/* Font Section - Only show for link and regular types */}
          {(ctaType === 'link' || ctaType === 'regular') && (
            <BlockStack gap="400">
              <Text variant="headingMd" as="h6">Font</Text>
              <InlineStack gap="300">
                <InlineStack blockAlign={'start'}>
                  <RadioButton
                    label=''
                    checked={fontType === 'site'}
                    id="site-font"
                    name="font"
                    onChange={() => onFontTypeChange('site')}
                  />
                  <BlockStack gap="100">
                    <Text variant="bodyMd" as="p">Site font</Text>
                    <Text variant="bodyMd" as="p" tone="subdued">Use the same font your store uses</Text>
                  </BlockStack>
                </InlineStack>
                <InlineStack blockAlign={'start'}>
                  <RadioButton
                    label=""
                    checked={fontType === 'dynamic'}
                    id="dynamic-font"
                    name="font"
                    onChange={() => onFontTypeChange('dynamic')}
                  />
                  <BlockStack gap="100">
                    <Text variant="bodyMd" as="p">Dynamic font</Text>
                    <Text variant="bodyMd" as="p" tone="subdued">Use the best looking font for all visitors</Text>
                  </BlockStack>
                </InlineStack>
                <RadioButton
                  label="Custom font"
                  checked={fontType === 'custom'}
                  id="custom-font"
                  name="font"
                  onChange={() => onFontTypeChange('custom')}
                />
              </InlineStack>

              {/* Font URL Input for Dynamic and Custom Fonts */}
              {(fontType === 'dynamic' || fontType === 'custom') && (
                <TextField
                  label="Font URL"
                  value={fontUrl}
                  onChange={onFontUrlChange}
                  autoComplete="off"
                  placeholder="Enter font URL"
                  error={hasError('cta.fontUrl')}
                  helpText={hasError('cta.fontUrl') ? getFieldErrorMessage('cta.fontUrl') : undefined}
                />
              )}
            </BlockStack>
          )}

          {/* Padding Section - Only show for regular button type */}
          {ctaType === 'regular' && (
            <>
              <Text variant="headingMd" as="h6">Padding</Text>
              <InlineStack gap="400" align="space-between">
                <div style={{width: '49%'}}>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">Padding top</Text>
                    <RangeSlider
                      label="Padding top"
                      labelHidden
                      value={paddingTop}
                      prefix={paddingTop}
                      onChange={(value) => onPaddingChange(value as number, 'top')}
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
                      value={paddingRight}
                      prefix={paddingRight}
                      onChange={(value) => onPaddingChange(value as number, 'right')}
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
                      value={paddingBottom}
                      prefix={paddingBottom}
                      onChange={(value) => onPaddingChange(value as number, 'bottom')}
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
                      value={paddingLeft}
                      prefix={paddingLeft}
                      onChange={(value) => onPaddingChange(value as number, 'left')}
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
