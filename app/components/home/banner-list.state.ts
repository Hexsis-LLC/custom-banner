import type { Announcement } from "../../types/announcement";

export const ANNOUNCEMENT_TABS = [
  {
    id: 'all',
    content: 'All',
    accessibilityLabel: 'All announcements',
    panelID: 'all-announcements',
  },
  {
    id: 'active',
    content: 'Active',
    accessibilityLabel: 'Active announcements',
    panelID: 'active-announcements',
  },
  {
    id: 'published',
    content: 'Published',
    accessibilityLabel: 'Published announcements',
    panelID: 'published-announcements',
  },
  {
    id: 'draft',
    content: 'Draft',
    accessibilityLabel: 'Draft announcements',
    panelID: 'draft-announcements',
  },
  {
    id: 'paused',
    content: 'Paused',
    accessibilityLabel: 'Paused announcements',
    panelID: 'paused-announcements',
  },
  {
    id: 'ended',
    content: 'Ended',
    accessibilityLabel: 'Ended announcements',
    panelID: 'ended-announcements',
  },
];

export type TabId = typeof ANNOUNCEMENT_TABS[number]['id'];

export interface BannerListState {
  currentPage: number;
  selectedTab: number;
  queryValue: string;
  sortSelected: string[];
  announcements: Announcement[];
  totalPages: number;
  isLoading: boolean;
  isInitialLoad: boolean;
  bulkActionLoading: 'delete' | 'pause' | 'duplicate' | null;
}

export type BannerListAction =
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_TAB'; payload: number }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_SORT'; payload: string[] }
  | { type: 'SET_DATA'; payload: { announcements: Announcement[]; totalPages: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BULK_ACTION_LOADING'; payload: 'delete' | 'pause' | 'duplicate' | null }
  | { type: 'RESET_STATE' };

export const initialState: BannerListState = {
  currentPage: 1,
  selectedTab: 0,
  queryValue: '',
  sortSelected: ['date desc'],
  announcements: [],
  totalPages: 1,
  isLoading: true,
  isInitialLoad: true,
  bulkActionLoading: null,
};

export function bannerListReducer(state: BannerListState, action: BannerListAction): BannerListState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload, isLoading: true };
    case 'SET_TAB':
      return { ...state, selectedTab: action.payload, currentPage: 1, isLoading: true };
    case 'SET_QUERY':
      return { ...state, queryValue: action.payload, currentPage: 1, isLoading: true };
    case 'SET_SORT':
      return { ...state, sortSelected: action.payload, currentPage: 1, isLoading: true };
    case 'SET_DATA':
      return {
        ...state,
        announcements: action.payload.announcements,
        totalPages: action.payload.totalPages,
        isLoading: false,
        isInitialLoad: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_BULK_ACTION_LOADING':
      return { ...state, bulkActionLoading: action.payload };
    case 'RESET_STATE':
      return { 
        ...state, 
        currentPage: 1,
        isLoading: true,
        isInitialLoad: false,
      };
    default:
      return state;
  }
} 