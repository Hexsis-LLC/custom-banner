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
import { useCallback } from 'react';
import illustration from "../../assets/svg/Illustration.svg";
import { useBannerList } from './use-banner-list';
import type { IndexTableSelectionType } from '@shopify/polaris';

export default function BannerList() {
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

  const {selectedResources, allResourcesSelected, handleSelectionChange} =
    useIndexResourceState(state.announcements.map(item => ({id: item.id.toString()})));

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

  const bulkActions = [
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
  ];

  const rowMarkup = state.announcements.map(
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
            tabs[state.selectedTab].id === 'active' ? "success" :
            status === 'published' ? "success" :
            status === 'draft' ? "info" :
            status === 'paused' ? "warning" :
            "critical"
          }>
            {tabs[state.selectedTab].id === 'active' ? "Active" :
             status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
    ),
  );

  const condensed = useBreakpoints().smDown;

  const renderSkeletonRows = () => {
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
  };

  // Only show EmptyHome when "all" tab is selected and there's no data
  if (tabs[state.selectedTab].id === 'all' && state.announcements.length === 0 && !state.isLoading) {
    return <EmptyHome/>;
  }

  const resourceName = {
    singular: 'announcement',
    plural: 'announcements',
  };

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
              itemCount={state.isLoading ? 5 : state.announcements.length}
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
              pagination={state.isLoading ? undefined : {
                hasNext: state.currentPage < state.totalPages,
                hasPrevious: state.currentPage > 1,
                onNext: () => setPage(state.currentPage + 1),
                onPrevious: () => setPage(state.currentPage - 1),
              }}
            >
              {state.isInitialLoad ? renderSkeletonRows() : rowMarkup}
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
