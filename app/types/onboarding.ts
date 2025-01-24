export interface LoaderData {
  shop: string;
  themeId: string;
  hasCompletedEmbed: boolean;
  hasCompletedCreateNewBanner: boolean;
}

export interface ActionData {
  success: boolean;
  error?: string;
  action?: string;
}

export interface BlockData {
  type: string;
  disabled: boolean;
  settings: any;
}

export interface Blocks {
  [blockId: string]: BlockData;
} 