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
  ChoiceList, TextField, RangeSlider,
  Card,
  BlockStack,
  InlineGrid,
  Box
} from "@shopify/polaris";
import {useNavigate} from "@remix-run/react";
import EmptyHome from "./empty_screen";
import {useState, useCallback} from 'react';
import illustration from "../../assets/svg/Illustration.svg";
import type { Announcement } from "../../types/announcement";


interface BannerListProps {
  data: Announcement[];
}

export default function BannerList({data}: BannerListProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState(0);
  const [queryValue, setQueryValue] = useState('');
  const [sortSelected, setSortSelected] = useState(['date desc']);
  const itemsPerPage = 10;

  const resourceName = {
    singular: 'announcement',
    plural: 'announcements',
  };

  const {mode, setMode} = useSetIndexFiltersMode();

  // Updated sort options to only include ascending and descending by date
  const sortOptions: IndexFiltersProps['sortOptions'] = [
    {label: 'Date', value: 'date asc', directionLabel: 'Oldest first'},
    {label: 'Date', value: 'date desc', directionLabel: 'Newest first'},
  ];

  const handleFiltersQueryChange = useCallback(
    (value: string) => setQueryValue(value),
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
      id: 'active',
      content: 'Active',
      accessibilityLabel: 'Active announcements',
      panelID: 'active-announcements',
    },
    {
      id: 'paused',
      content: 'Pause',
      accessibilityLabel: 'Paused announcements',
      panelID: 'paused-announcements',
    },
    {
      id: 'scheduled',
      content: 'Scheduled',
      accessibilityLabel: 'Scheduled announcements',
      panelID: 'scheduled-announcements',
    },
    {
      id: 'ended',
      content: 'Ended',
      accessibilityLabel: 'Ended announcements',
      panelID: 'ended-announcements',
    },
  ];

  // Updated filter logic to include search
  const filteredData = data.filter(item => {
    // First apply tab filter
    const now = new Date();
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);

    const matchesTab = (() => {
      switch (tabs[selectedTab].id) {
        case 'active':
          return item.isActive && startDate <= now && endDate >= now;
        case 'paused':
          return !item.isActive;
        case 'scheduled':
          return startDate > now;
        case 'ended':
          return endDate < now;
        default:
          return true;
      }
    })();

    // Then apply search filter
    const matchesSearch = !queryValue ||
      item.title.toLowerCase().includes(queryValue.toLowerCase()) ||
      item.type.toLowerCase().includes(queryValue.toLowerCase());

    return matchesTab && matchesSearch;
  }).sort((a, b) => {
    // Apply sorting
    const [, direction] = sortSelected[0].split(' ');
    return direction === 'asc'
      ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredData.slice(startIndex, endIndex);

  // Fix for bulk selection by using filteredData instead of currentPageData
  const {selectedResources, allResourcesSelected, handleSelectionChange} =
    useIndexResourceState(filteredData.map(item => ({id: item.id.toString()})));

  const rowMarkup = currentPageData.map(
    ({
       id,
       title,
       isActive,
       startDate,
       endDate,
       type
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
          <Badge tone={isActive ? "success" : "warning"}>
            {isActive ? "Active" : "Paused"}
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

  const condensed =useBreakpoints().smDown
  if (data.length === 0) {
    return <EmptyHome/>
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
              onSort={setSortSelected}
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
              onSelect={setSelectedTab}
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
              promotedBulkActions={[
                {
                  content: 'Pause',
                  onAction: () => console.log('Todo: implement bulk edit'),
                },
                {
                  content: 'Delete',
                  onAction: () => console.log('Todo: implement bulk edit'),
                },
                {
                  content: 'Duplicate',
                  onAction: () => console.log('Todo: implement bulk edit'),
                },
              ]}
              condensed={condensed}
              resourceName={resourceName}
              itemCount={filteredData.length}
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
              pagination={totalPages > 1 ? {
                hasNext: currentPage < totalPages,
                hasPrevious: currentPage > 1,
                onNext: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)),
                onPrevious: () => setCurrentPage(prev => Math.max(prev - 1, 1)),
              } : undefined}
            >
              {rowMarkup}
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
  )
}
