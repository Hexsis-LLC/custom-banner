import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useFetcher } from '@remix-run/react';
import type { IndexFiltersProps } from '@shopify/polaris';
import { bannerListReducer, initialState, ANNOUNCEMENT_TABS } from './banner-list.state';
import type { Announcement } from '../../types/announcement';

interface BannerListResponse {
  data: Announcement[];
  totalPages: number;
  currentPage: number;
}

export const useBannerList = () => {
  const [state, dispatch] = useReducer(bannerListReducer, initialState);
  const fetcher = useFetcher<BannerListResponse>();

  const sortOptions: IndexFiltersProps['sortOptions'] = useMemo(() => [
    {label: 'Date', value: 'date asc', directionLabel: 'Oldest first'},
    {label: 'Date', value: 'date desc', directionLabel: 'Newest first'},
  ], []);

  const loadData = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const queryParams = new URLSearchParams({
      page: state.currentPage.toString(),
      tab: ANNOUNCEMENT_TABS[state.selectedTab].id,
      sort: state.sortSelected[0],
      search: state.queryValue,
    });

    fetcher.load(`/api/announcements?${queryParams}`);
  }, [state.currentPage, state.selectedTab, state.sortSelected, state.queryValue, fetcher]);

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

  // Load initial data and when filters change
  useEffect(() => {
    loadData();
  }, [state.currentPage, state.selectedTab, state.sortSelected, state.queryValue]);

  // Update state when data is received
  useEffect(() => {
    if (fetcher.data) {
      dispatch({
        type: 'SET_DATA',
        payload: {
          announcements: fetcher.data.data,
          totalPages: fetcher.data.totalPages,
        },
      });
    }
  }, [fetcher.data]);

  return {
    state,
    tabs: ANNOUNCEMENT_TABS,
    sortOptions,
    handleFiltersQueryChange,
    handleTabChange,
    handleSortChange,
    handleBulkAction,
    setPage: (page: number) => dispatch({ type: 'SET_PAGE', payload: page }),
  };
};
