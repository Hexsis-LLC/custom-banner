import React, { createContext, useContext, useCallback, useEffect, useReducer, useMemo, useRef } from 'react';
import { useFetcher } from '@remix-run/react';
import type { IndexFiltersProps } from '@shopify/polaris';
import type { Announcement } from '../types/announcement';

// Banner list tab definitions
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

// State and action types
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
  lastFetchId: string;
}

export type BannerListAction =
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_TAB'; payload: number }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_SORT'; payload: string[] }
  | { type: 'SET_DATA'; payload: { announcements: Announcement[]; totalPages: number; fetchId: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BULK_ACTION_LOADING'; payload: 'delete' | 'pause' | 'duplicate' | null }
  | { type: 'SET_FETCH_ID'; payload: string }
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
  lastFetchId: '',
};

// Reducer function
function bannerListReducer(state: BannerListState, action: BannerListAction): BannerListState {
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
      // After the first data load, isInitialLoad is set to false permanently
      // until the component is unmounted/remounted
      return {
        ...state,
        announcements: action.payload.announcements,
        totalPages: action.payload.totalPages,
        isLoading: false,
        isInitialLoad: false,
        lastFetchId: action.payload.fetchId,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_BULK_ACTION_LOADING':
      return { ...state, bulkActionLoading: action.payload };
    case 'SET_FETCH_ID':
      return { ...state, lastFetchId: action.payload };
    case 'RESET_STATE':
      return { 
        ...initialState, 
        isInitialLoad: false, // Keep isInitialLoad as false when resetting state
      };
    default:
      return state;
  }
}

// Response type
interface BannerListResponse {
  data: Announcement[];
  totalPages: number;
  currentPage: number;
}

// Context type definition
interface BannerListContextType {
  state: BannerListState;
  tabs: typeof ANNOUNCEMENT_TABS;
  sortOptions: IndexFiltersProps['sortOptions'];
  handleFiltersQueryChange: (value: string) => void;
  handleTabChange: (selectedTabIndex: number) => void;
  handleSortChange: (values: string[]) => void;
  handleBulkAction: (action: 'delete' | 'pause' | 'duplicate', selectedResources: string[]) => Promise<boolean>;
  setPage: (page: number) => void;
}

// Create context
const BannerListContext = createContext<BannerListContextType | undefined>(undefined);

// Provider component
export function BannerListProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bannerListReducer, initialState);
  const fetcher = useFetcher<BannerListResponse>();
  const fetchingRef = useRef(false);
  const requestParamsRef = useRef('');

  // Memoized sort options
  const sortOptions: IndexFiltersProps['sortOptions'] = useMemo(() => [
    {label: 'Date', value: 'date asc', directionLabel: 'Oldest first'},
    {label: 'Date', value: 'date desc', directionLabel: 'Newest first'},
  ], []);

  // Load data function
  const loadData = useCallback(() => {
    // Skip if already loading or the same request is in progress
    if (fetchingRef.current) {
      return;
    }

    // Calculate a unique ID for this request to track it
    const fetchId = Date.now().toString();
    
    const queryParams = new URLSearchParams({
      page: state.currentPage.toString(),
      tab: ANNOUNCEMENT_TABS[state.selectedTab].id,
      sort: state.sortSelected[0],
      search: state.queryValue,
    });

    const paramsString = queryParams.toString();
    
    // Don't make a duplicate request with the same parameters
    if (paramsString === requestParamsRef.current && !state.isInitialLoad) {
      return;
    }

    // Mark request as in progress and save parameters
    fetchingRef.current = true;
    requestParamsRef.current = paramsString;
    
    // Update loading state
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_FETCH_ID', payload: fetchId });
    
    // Make the API request
    fetcher.load(`/api/announcements?${queryParams}`);
  }, [state.currentPage, state.selectedTab, state.sortSelected, state.queryValue, state.isInitialLoad, fetcher]);

  // Handler functions
  const handleFiltersQueryChange = useCallback((value: string) => {
    dispatch({ type: 'SET_QUERY', payload: value });
  }, []);

  const handleTabChange = useCallback((selectedTabIndex: number) => {
    dispatch({ type: 'SET_TAB', payload: selectedTabIndex });
  }, []);

  const handleSortChange = useCallback((values: string[]) => {
    dispatch({ type: 'SET_SORT', payload: values });
  }, []);

  const handleBulkAction = useCallback(async (action: 'delete' | 'pause' | 'duplicate', selectedResources: string[]) => {
    dispatch({ type: 'SET_BULK_ACTION_LOADING', payload: action });
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: `bulk_${action}`,
          ids: selectedResources,
        }),
      });

      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'RESET_STATE' });
        // Reset the ref because we're forcing a new load
        fetchingRef.current = false;
        requestParamsRef.current = '';
        loadData();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to ${action} announcements:`, error);
      return false;
    } finally {
      dispatch({ type: 'SET_BULK_ACTION_LOADING', payload: null });
    }
  }, [loadData]);

  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  // Load initial data and when filters change - only if we're not already fetching
  useEffect(() => {
    if (!fetchingRef.current || state.isInitialLoad) {
      loadData();
    }
  }, [state.currentPage, state.selectedTab, state.sortSelected, state.queryValue, state.isInitialLoad, loadData]);

  // Update state when data is received
  useEffect(() => {
    // Only process completed requests to prevent partial updates
    if (fetcher.data && fetcher.state === 'idle') {
      // Reset fetching flag
      fetchingRef.current = false;
      
      // Update state with new data
      dispatch({
        type: 'SET_DATA',
        payload: {
          announcements: fetcher.data.data,
          totalPages: fetcher.data.totalPages,
          fetchId: state.lastFetchId,
        },
      });
    }
  }, [fetcher.data, fetcher.state, state.lastFetchId]);

  // Reset fetching ref when fetcher state changes, including on errors
  useEffect(() => {
    if (fetcher.state === 'idle' || fetcher.state === 'submitting') {
      fetchingRef.current = false;
    }
  }, [fetcher.state]);

  // Context value
  const contextValue = {
    state,
    tabs: ANNOUNCEMENT_TABS,
    sortOptions,
    handleFiltersQueryChange,
    handleTabChange,
    handleSortChange,
    handleBulkAction,
    setPage,
  };

  return (
    <BannerListContext.Provider value={contextValue}>
      {children}
    </BannerListContext.Provider>
  );
}

// Custom hook to use the context
export function useBannerList() {
  const context = useContext(BannerListContext);
  if (context === undefined) {
    throw new Error('useBannerList must be used within a BannerListProvider');
  }
  return context;
} 