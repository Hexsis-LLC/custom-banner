-- Add font type and URL columns to call_to_action table
ALTER TABLE call_to_action ADD COLUMN font_type TEXT NOT NULL DEFAULT 'site';
ALTER TABLE call_to_action ADD COLUMN font_url TEXT;

-- Update existing records to set the correct font type based on customFont
UPDATE call_to_action 
SET font_type = CASE 
    WHEN font_url IS NULL THEN 'site'
    WHEN font_url LIKE '%fonts.gstatic.com%' THEN 'dynamic'
    ELSE 'custom'
END; 