import React, { useEffect, useState } from 'react';
import { useFormContext } from '../../contexts/AnnouncementFormContext';
import type { CTASettings, CloseButtonPosition, FontType } from '../../types/announcement';

interface StyledProps {
  backgroundColor?: string;
  background?: string;
  padding?: { top: number; right: number; bottom: number; left: number };
  color?: string;
  fontSize?: number;
  position?: Exclude<CloseButtonPosition, 'none'>;
  cta?: Partial<CTASettings>;
  height?: string;
  width?: string;
  fontFamily?: string;
  fontType?: FontType;
}

interface TextStyles {
  color: string;
  fontSize: number;
  fontType: FontType;
  fontFamily?: string;
}

const bannerContainerStyle = (props: StyledProps): React.CSSProperties => ({
  ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
  ...(props.background ? { background: props.background } : {}),
  width: props.width || '100%',
  height: props.height || 'auto',
  zIndex: 999999,
  margin: '20px 0',
  borderRadius: '4px',
  overflow: 'hidden'
});

const bannerWrapperStyle = (props: StyledProps): React.CSSProperties => ({
  width: props.width || '100%',
  height: props.height || 'auto',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 999999
});

const bannerContentStyle = (props: StyledProps): React.CSSProperties => ({
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  minHeight: props.height || '40px',
  height: props.height || 'auto',
  padding: props.padding 
    ? `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px` 
    : '10px 40px',
  width: '100%',
  boxSizing: 'border-box'
});

const bannerTextStyle = (props: StyledProps): React.CSSProperties => {
  // Only apply fontFamily if it's not a site font
  const fontStyles = props.fontType === 'site' 
    ? {}
    : { fontFamily: props.fontFamily || 'inherit' };

  return {
    color: props.color || 'inherit',
    fontSize: `${props.fontSize || 16}px`,
    margin: 0,
    textAlign: 'center',
    lineHeight: 1.4,
    display: 'block',
    visibility: 'visible',
    flex: 1,
    ...fontStyles
  };
};

const bannerActionsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '56px',
  flexShrink: 0
};

const ctaWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginRight: '56px'
};

const ctaTextLinkStyle = (props: StyledProps): React.CSSProperties => {
  // Only apply fontFamily if it's not a site font
  const fontStyles = props.fontType === 'site' 
    ? {}
    : { fontFamily: props.fontFamily || 'inherit' };

  return {
    color: props.cta?.textColor || props.color || 'rgb(255, 255, 255)',
    textDecoration: 'underline',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    opacity: 1,
    position: 'relative',
    zIndex: 1,
    marginLeft: '10px',
    ...fontStyles
  };
};

const ctaButtonStyle = (props: StyledProps): React.CSSProperties => {
  // Only apply fontFamily if it's not a site font
  const fontStyles = props.fontType === 'site' 
    ? {}
    : { fontFamily: props.fontFamily || 'inherit' };

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    minWidth: '80px',
    textAlign: 'center',
    backgroundColor: props.cta?.buttonBackgroundColor || 'rgb(255, 255, 255)',
    color: props.cta?.buttonFontColor || 'rgb(0, 0, 0)',
    padding: props.cta?.padding 
      ? `${props.cta.padding.top}px ${props.cta.padding.right}px ${props.cta.padding.bottom}px ${props.cta.padding.left}px` 
      : '5px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: 'none',
    fontSize: '16px',
    opacity: 1,
    ...fontStyles
  };
};

const ctaBarStyle = (props: StyledProps): React.CSSProperties => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  backgroundColor: 'transparent',
  zIndex: 0
});

const ctaContainerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center'
};

const closeButtonStyle = (props: StyledProps): React.CSSProperties => ({
  background: 'none',
  border: 'none',
  color: props.color,
  cursor: 'pointer',
  padding: '5px',
  fontSize: '18px',
  opacity: 0.7,
  transition: 'opacity 0.2s',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: props.position === 'center' ? 'static' : 'absolute',
  ...(props.position === 'right' ? { right: '5px' } : {}),
  ...(props.position === 'left' ? { left: '5px' } : {})
});

export function LivePreview() {
  const { formData } = useFormContext();
  const { basic, text, cta, background } = formData;
  const [loadedFonts, setLoadedFonts] = useState<Map<string, string>>(new Map());
  const [isHovered, setIsHovered] = useState(false);

  // Debug log to track font-related values
  useEffect(() => {
    console.log('Font Debug:', {
      textFontType: text.fontType,
      textFontUrl: text.fontUrl,
      ctaFontType: cta.fontType,
      ctaFontUrl: cta.fontUrl,
      loadedFonts: Array.from(loadedFonts.entries())
    });
  }, [text.fontType, text.fontUrl, cta.fontType, cta.fontUrl, loadedFonts]);

  // Load custom fonts if specified
  useEffect(() => {
    // Load announcement text font
    if (text.fontType !== 'site' && text.fontUrl && !loadedFonts.has(text.fontUrl)) {
      const fontName = `text-font-${Math.random().toString(36).substr(2, 9)}`;
      try {
        const fontFace = new FontFace(fontName, `url(${text.fontUrl})`);
        fontFace.load().then((loadedFace) => {
          document.fonts.add(loadedFace);
          setLoadedFonts(prev => new Map(prev).set(text.fontUrl!, fontName));
        }).catch((error) => {
          console.error('Error loading text font:', error);
        });
      } catch (error) {
        console.error('Error creating text FontFace:', error);
      }
    }

    // Load CTA font
    if (cta.fontType !== 'site' && cta.fontUrl && !loadedFonts.has(cta.fontUrl)) {
      const fontName = `cta-font-${Math.random().toString(36).substr(2, 9)}`;
      try {
        const fontFace = new FontFace(fontName, `url(${cta.fontUrl})`);
        fontFace.load().then((loadedFace) => {
          document.fonts.add(loadedFace);
          setLoadedFonts(prev => new Map(prev).set(cta.fontUrl!, fontName));
        }).catch((error) => {
          console.error('Error loading CTA font:', error);
        });
      } catch (error) {
        console.error('Error creating CTA FontFace:', error);
      }
    }
  }, [text.fontType, text.fontUrl, cta.fontType, cta.fontUrl]);

  const closePos = basic.closeButtonPosition as Exclude<CloseButtonPosition, 'none'>;

  // Calculate size based on form data
  const height = basic.size === 'custom' && basic.sizeHeight 
    ? `${basic.sizeHeight}px`
    : basic.size === 'large' 
      ? '72px'
      : basic.size === 'mid'
        ? '62px'
        : '52px'; // small or default

  const width = basic.size === 'custom' && basic.sizeWidth 
    ? `${basic.sizeWidth}%`
    : '100%';

  const styleProps = {
    backgroundColor: background.backgroundType === 'solid' 
      ? background.color1
      : undefined,
    background: background.backgroundType === 'gradient'
      ? background.gradientValue
      : undefined,
    padding: background.padding,
    height,
    width
  };

  // Get text styles based on font type
  const getTextStyles = (): StyledProps => {
    const baseStyles: StyledProps = {
      color: text.textColor || 'rgb(255, 255, 255)',
      fontSize: text.fontSize,
      fontType: text.fontType as FontType
    };

    // Only add fontFamily if we have a custom font
    if (text.fontType !== 'site' && text.fontUrl) {
      const fontFamily = loadedFonts.get(text.fontUrl);
      if (fontFamily) {
        return {
          ...baseStyles,
          fontFamily: `${fontFamily}, sans-serif`
        };
      }
    }

    return baseStyles;
  };

  // Add debug logging to track color and gradient values
  useEffect(() => {
    console.log('Color Debug:', {
      backgroundType: background.backgroundType,
      solidColor: background.color1,
      gradientValue: background.backgroundType === 'gradient' ? background.gradientValue : null,
      textColor: text.textColor,
      ctaTextColor: cta.textColor,
      ctaButtonColor: cta.buttonBackgroundColor
    });
  }, [background, text.textColor, cta.textColor, cta.buttonBackgroundColor]);

  // Transform CTA data to match CTASettings type
  const getCTAProps = (): { cta: Partial<CTASettings> } => {
    return {
      cta: {
        ...cta,
        fontType: cta.fontType as FontType
      }
    };
  };

  // Get CTA styles based on type and font
  const getCTAStyles = (): StyledProps => {
    const baseStyles: StyledProps = {
      fontType: cta.fontType as FontType,
      cta: getCTAProps().cta
    };

    // Add font family if CTA has custom font
    if (cta.fontType !== 'site' && cta.fontUrl) {
      const fontFamily = loadedFonts.get(cta.fontUrl);
      if (fontFamily) {
        return {
          ...baseStyles,
          fontFamily: `${fontFamily}, sans-serif`
        };
      }
    }

    return baseStyles;
  };

  const renderCTA = () => {
    if (cta.ctaType === 'none') return null;

    const ctaStyles = getCTAStyles();

    switch (cta.ctaType) {
      case 'link':
        return (
          <a
            href={cta.ctaLink}
            style={{
              ...ctaTextLinkStyle({
                ...ctaStyles,
                cta: {
                  ...ctaStyles.cta,
                  textColor: cta.textColor || text.textColor
                }
              }),
              opacity: isHovered ? 0.8 : 1
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {cta.ctaText}
          </a>
        );
      case 'regular':
        return (
          <button
            onClick={() => window.open(cta.ctaLink, '_blank')}
            style={{
              ...ctaButtonStyle(ctaStyles),
              opacity: isHovered ? 0.9 : 1
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {cta.ctaText}
          </button>
        );
      case 'bar':
        return (
          <div 
            style={{
              ...ctaContainerStyle,
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <a
              href={cta.ctaLink}
              style={{
                ...ctaTextLinkStyle({
                  ...ctaStyles,
                  cta: {
                    ...ctaStyles.cta,
                    textColor: cta.textColor || text.textColor
                  }
                }),
                position: 'absolute',
                right: '40px'
              }}
            >
              {cta.ctaText}
            </a>
            <div
              style={{
                ...ctaBarStyle(ctaStyles),
                backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
              }}
              onClick={() => window.open(cta.ctaLink, '_blank')}
              role="button"
              aria-label={cta.ctaText}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={bannerContainerStyle(styleProps)}>
      <div style={bannerWrapperStyle(styleProps)}>
        <div style={bannerContentStyle(styleProps)}>
          <p style={{
            ...bannerTextStyle(getTextStyles()),
            color: text.textColor
          }}>
            {text.announcementText}
          </p>

          <div style={bannerActionsStyle}>
            {cta.ctaType !== 'bar' && (
              <div style={ctaWrapperStyle}>
                {renderCTA()}
              </div>
            )}

            {basic.showCloseButton && basic.closeButtonPosition !== 'none' && (
              <button style={closeButtonStyle({ 
                position: closePos,
                color: basic.closeButtonColor
              })}>✕</button>
            )}
          </div>
        </div>
      </div>
      {cta.ctaType === 'bar' && renderCTA()}
    </div>
  );
} 