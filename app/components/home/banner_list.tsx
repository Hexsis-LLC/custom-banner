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
  IndexFiltersProps,
  IndexFilters,
  useSetIndexFiltersMode,
  Card,
  BlockStack,
  InlineGrid,
  Box,
  SkeletonDisplayText,
  SkeletonBodyText,
} from "@shopify/polaris";
import { useFetcher, useNavigate } from "@remix-run/react";
import EmptyHome from "./empty_screen";
import { useState, useCallback, useEffect } from 'react';
import illustration from "../../assets/svg/Illustration.svg";
import type { Announcement } from "../../types/announcement";

interface BannerListResponse {
  data: Announcement[];
  totalPages: number;
  currentPage: number;
}

export default function BannerList() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState(0);
  const [queryValue, setQueryValue] = useState('');
  const [sortSelected, setSortSelected] = useState(['date desc']);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetcher = useFetcher<BannerListResponse>();

  // Load initial data and when filters change
  useEffect(() => {
    const queryParams = new URLSearchParams({
      page: currentPage.toString(),
      tab: tabs[selectedTab].id,
      sort: sortSelected[0],
      search: queryValue,
    });

    fetcher.load(`/api/announcements?${queryParams}`);
  }, [currentPage, selectedTab, sortSelected, queryValue]);

  // Update state when data is received
  useEffect(() => {
    if (fetcher.data) {
      setAnnouncements(fetcher.data.data);
      setTotalPages(fetcher.data.totalPages);
      setIsLoading(false);
    }
  }, [fetcher.data]);

  const resourceName = {
    singular: 'announcement',
    plural: 'announcements',
  };

  const {mode, setMode} = useSetIndexFiltersMode();

  const sortOptions: IndexFiltersProps['sortOptions'] = [
    {label: 'Date', value: 'date asc', directionLabel: 'Oldest first'},
    {label: 'Date', value: 'date desc', directionLabel: 'Newest first'},
  ];

  const handleFiltersQueryChange = useCallback(
    (value: string) => {
      setCurrentPage(1); // Reset to first page when search changes
      setQueryValue(value);
    },
    [],
  );

  const tabs = [
    {
      id: 'all',
      content: 'All',
      accessibilityLabel: 'All announcements',
      panelID: 'all-announcements',
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

  const handleTabChange = useCallback((selectedTabIndex: number) => {
    setCurrentPage(1); // Reset to first page when tab changes
    setSelectedTab(selectedTabIndex);
  }, []);

  const handleSortChange = useCallback((values: string[]) => {
    setCurrentPage(1); // Reset to first page when sort changes
    setSortSelected(values);
  }, []);

  const {selectedResources, allResourcesSelected, handleSelectionChange} =
    useIndexResourceState(announcements.map(item => ({id: item.id.toString()})));

  const rowMarkup = announcements.map(
    ({
       id,
       title,
       status,
       startDate,
       endDate,
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
            status === 'published' ? "success" :
            status === 'draft' ? "info" :
            status === 'paused' ? "warning" :
            "critical"
          }>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
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
          <Button onClick={() => {}}>
            View Analytics
          </Button>
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
  if (tabs[selectedTab].id === 'all' && announcements.length === 0 && !isLoading) {
    return <EmptyHome/>;
  }

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
              sortSelected={sortSelected}
              queryValue={queryValue}
              queryPlaceholder="Search announcements..."
              onQueryChange={handleFiltersQueryChange}
              onQueryClear={() => setQueryValue('')}
              onSort={handleSortChange}
              cancelAction={{
                onAction: () => {
                  setQueryValue('');
                  setSortSelected(['date desc']);
                },
                disabled: false,
                loading: false,
              }}
              tabs={tabs}
              selected={selectedTab}
              onSelect={handleTabChange}
              canCreateNewView={false}
              mode={mode}
              setMode={setMode}
              filters={[]}
              onClearAll={() => {
                setQueryValue('');
                setSortSelected(['date desc']);
              }}
            />
            <IndexTable
              condensed={condensed}
              resourceName={resourceName}
              itemCount={isLoading ? 5 : announcements.length}
              selectedItemsCount={
                allResourcesSelected ? 'All' : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
              headings={[
                {title: 'Campaign Title'},
                {title: 'Status'},
                {title: 'Start Date & Time'},
                {title: 'End Date & Time'},
                {title: 'Action'},
              ]}
              selectable
              pagination={isLoading ? undefined : {
                hasNext: currentPage < totalPages,
                hasPrevious: currentPage > 1,
                onNext: () => setCurrentPage(prev => prev + 1),
                onPrevious: () => setCurrentPage(prev => prev - 1),
              }}
            >
              {isLoading ? renderSkeletonRows() : rowMarkup}
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
