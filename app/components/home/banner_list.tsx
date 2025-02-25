import {
  Badge,
  Button,
  IndexTable,
  Page,
  Text,
  useIndexResourceState,
  LegacyCard,
  Layout,
  useBreakpoints,
  IndexFilters,
  useSetIndexFiltersMode,
  Card,
  BlockStack,
  InlineGrid,
  Box,
  SkeletonDisplayText,
  SkeletonBodyText,
  ButtonGroup,
} from "@shopify/polaris";
import { ChartVerticalIcon, EditIcon, DuplicateIcon, DisabledIcon, DeleteIcon } from "@shopify/polaris-icons";
import { useNavigate } from "@remix-run/react";
import EmptyHome from "./empty_screen";
import { useCallback, useMemo } from 'react';
import illustration from "../../assets/svg/Illustration.svg";
import { useBannerList, BannerListProvider } from '../../contexts/BannerListContext';
import type { IndexTableSelectionType } from '@shopify/polaris';

// Extracted row markup function with memoization for better performance
const renderRowMarkup = (
  announcements: any[], 
  selectedResources: string[], 
  tabs: typeof import('../../contexts/BannerListContext').ANNOUNCEMENT_TABS, 
  selectedTab: number, 
  navigate: ReturnType<typeof useNavigate>
) => {
  return announcements.map(
    ({
       id,
       title,
       status,
       startDate,
       endDate,
       type,
     }, index) => (
      <IndexTable.Row
        id={id.toString()}
        key={id}
        selected={selectedResources.includes(id.toString())}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {title}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={
            tabs[selectedTab].id === 'active' ? "success" :
            status === 'published' ? "success" :
            status === 'draft' ? "info" :
            status === 'paused' ? "warning" :
            "critical"
          }>
            {tabs[selectedTab].id === 'active' ? "Active" :
             status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            {type.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {new Date(startDate).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {new Date(endDate).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })}
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ButtonGroup>
              <Button
                icon={ChartVerticalIcon}
                onClick={() => {
                  console.log("hello")
                }}
                variant="tertiary"
                accessibilityLabel="View Analytics"
              />
              <Button
                icon={EditIcon}
                onClick={() => navigate(`/app/campaign/announcement?id=${id}`)}
                variant="tertiary"
                accessibilityLabel="Edit Announcement"
              />
            </ButtonGroup>
          </div>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );
};

function BannerListContent() {
  const navigate = useNavigate();
  const {
    state,
    tabs,
    sortOptions,
    handleFiltersQueryChange,
    handleTabChange,
    handleSortChange,
    handleBulkAction,
    setPage,
  } = useBannerList();

  const {mode, setMode} = useSetIndexFiltersMode();

  // Use useMemo to prevent unnecessary re-renders of useIndexResourceState
  const indexResources = useMemo(() => {
    return state.announcements.map(item => ({ id: item.id.toString() }));
  }, [state.announcements]);

  const {selectedResources, allResourcesSelected, handleSelectionChange} =
    useIndexResourceState(indexResources);

  const clearSelection = useCallback(() => {
    handleSelectionChange('page' as IndexTableSelectionType, false);
  }, [handleSelectionChange]);

  const handleBulkDelete = useCallback(async () => {
    const success = await handleBulkAction('delete', selectedResources);
    if (success) clearSelection();
  }, [handleBulkAction, selectedResources, clearSelection]);

  const handleBulkPause = useCallback(async () => {
    const success = await handleBulkAction('pause', selectedResources);
    if (success) clearSelection();
  }, [handleBulkAction, selectedResources, clearSelection]);

  const handleBulkDuplicate = useCallback(async () => {
    const success = await handleBulkAction('duplicate', selectedResources);
    if (success) clearSelection();
  }, [handleBulkAction, selectedResources, clearSelection]);

  const bulkActions = useMemo(() => [
    {
      content: state.bulkActionLoading === 'delete' ? 'Deleting...' : 'Delete',
      icon: DeleteIcon,
      destructive: true,
      onAction: handleBulkDelete,
      disabled: state.bulkActionLoading !== null,
    },
    {
      content: state.bulkActionLoading === 'pause' ? 'Pausing...' : 'Pause',
      icon: DisabledIcon,
      onAction: handleBulkPause,
      disabled: state.bulkActionLoading !== null,
    },
    {
      content: state.bulkActionLoading === 'duplicate' ? 'Duplicating...' : 'Duplicate',
      icon: DuplicateIcon,
      onAction: handleBulkDuplicate,
      disabled: state.bulkActionLoading !== null,
    },
  ], [state.bulkActionLoading, handleBulkDelete, handleBulkPause, handleBulkDuplicate]);

  // Only show EmptyHome when "all" tab is selected and there's no data
  if (tabs[state.selectedTab].id === 'all' && state.announcements.length === 0 && !state.isLoading) {
    return <EmptyHome/>;
  }

  const resourceName = {
    singular: 'announcement',
    plural: 'announcements',
  };

  const condensed = useBreakpoints().smDown;

  // Memoize rows to prevent unnecessary re-renders
  const memoizedRows = useMemo(() => {
    if (state.isInitialLoad) {
      return renderSkeletonRows();
    }
    return renderRowMarkup(state.announcements, selectedResources, tabs, state.selectedTab, navigate);
  }, [state.announcements, selectedResources, tabs, state.selectedTab, state.isInitialLoad, navigate]);

  return (
    <Page
      title="Welcome to HexStore - Announcement Bar"
      primaryAction={{
        content: "Create Banner",
        onAction: () => {
          navigate("/app/campaign/banner_type");
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <LegacyCard>
            <IndexFilters
              sortOptions={sortOptions}
              sortSelected={state.sortSelected}
              queryValue={state.queryValue}
              queryPlaceholder="Search announcements..."
              onQueryChange={handleFiltersQueryChange}
              onQueryClear={() => handleFiltersQueryChange('')}
              onSort={handleSortChange}
              cancelAction={{
                onAction: () => {
                  handleFiltersQueryChange('');
                  handleSortChange(['date desc']);
                },
                disabled: false,
                loading: false,
              }}
              tabs={tabs}
              selected={state.selectedTab}
              onSelect={handleTabChange}
              canCreateNewView={false}
              mode={mode}
              setMode={setMode}
              filters={[]}
              onClearAll={() => {
                handleFiltersQueryChange('');
                handleSortChange(['date desc']);
              }}
            />
            
            <IndexTable
              condensed={condensed}
              resourceName={resourceName}
              itemCount={state.announcements.length || (state.isInitialLoad ? 5 : 0)}
              selectedItemsCount={
                allResourcesSelected ? 'All' : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
              headings={[
                {title: 'Campaign Title'},
                {title: 'Status'},
                {title: 'Banner Type'},
                {title: 'Start Date & Time'},
                {title: 'End Date & Time'},
                {title: 'Action'},
              ]}
              selectable
              hasZebraStriping
              promotedBulkActions={bulkActions}
              pagination={{
                hasNext: state.currentPage < state.totalPages,
                hasPrevious: state.currentPage > 1,
                onNext: () => setPage(state.currentPage + 1),
                onPrevious: () => setPage(state.currentPage - 1),
              }}
            >
              {memoizedRows}
            </IndexTable>
          </LegacyCard>
        </Layout.Section>
        <Layout.Section>
          <Card padding="500">
            <InlineGrid columns={["oneThird", "twoThirds"]} gap="500">
              <Box>
                <img
                  src={illustration}
                  alt="Support illustration"
                  width="145"
                  height="122"
                />
              </Box>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  Still having some issue for setup
                </Text>
                <Text variant="bodyMd" as="p">
                  You can have a chat or setup a call with our custom banner experts. They can guide you to setup your first custom banner. Just letting you know that it is completely free
                </Text>
                <Box>
                  <Button>Schedule a call</Button>
                </Box>
              </BlockStack>
            </InlineGrid>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// Extracted skeleton row rendering function
function renderSkeletonRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <IndexTable.Row id={`skeleton-${index}`} key={`skeleton-${index}`} position={index}>
      <IndexTable.Cell>
        <SkeletonDisplayText size="small" />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Box maxWidth="100px">
          <SkeletonDisplayText size="small" />
        </Box>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Box maxWidth="100px">
          <SkeletonDisplayText size="small" />
        </Box>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <SkeletonBodyText lines={1} />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <SkeletonBodyText lines={1} />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Box maxWidth="100px">
          <SkeletonDisplayText size="small" />
        </Box>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));
}

export default function BannerList() {
  return (
    <BannerListProvider>
      <BannerListContent />
    </BannerListProvider>
  );
}
