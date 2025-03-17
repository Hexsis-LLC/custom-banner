import {type ActionFunctionArgs, json, type LoaderFunctionArgs} from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { AnnouncementService } from "../services/announcement.server";
import {AnnouncementAction} from "../services/announcementAction.server";
import { ZodError } from "zod";
import { validateAnnouncement } from "../schemas/announcement";
import type { DbAnnouncement, DbAnnouncementText, DbBannerBackground, DbBannerForm, PagePatternLink } from "../types/announcement";

const ITEMS_PER_PAGE = 10;

// Types for query parameters
interface QueryParams {
  page: number;
  tab: 'all' | 'active' | 'ended' | string;
  sort: string;
  search: string;
}

// Types for response data
interface PaginatedResponse {
  data: DbAnnouncement[];
  totalPages: number;
  currentPage: number;
}

// Types for responses
interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

interface SuccessResponse {
  success: true;
  message: string;
  data?: unknown;
}

// Error responses
const createErrorResponse = (message: string, status: number, details?: unknown) => {
  const response: ErrorResponse = {
    success: false,
    error: message
  };
  
  if (details !== undefined) {
    response.details = details;
  }
  
  return json(response, { status });
};

// Success responses
const createSuccessResponse = (message: string, data?: unknown) => {
  const response: SuccessResponse = {
    success: true,
    message
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  return json(response);
};

// Define an augmented type that includes relations
type AugmentedDbAnnouncement = DbAnnouncement & {
  texts: DbAnnouncementText[];
  background: DbBannerBackground | null;
  form: DbBannerForm | null;
  pagePatternLinks: PagePatternLink[];
};

// Helper functions for filtering and sorting
const filterAnnouncements = (
  announcements: AugmentedDbAnnouncement[],
  filters: {
    status: string[];
    type: string[];
    search: string;
  }
) => {
  return announcements.filter((announcement) => {
    const matchesStatus =
      filters.status.length === 0 ||
      filters.status.includes(announcement.status);
    const matchesType =
      filters.type.length === 0 || filters.type.includes(announcement.type);
    const matchesSearch =
      filters.search === "" ||
      announcement.title.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });
};

const sortAnnouncements = (
  announcements: AugmentedDbAnnouncement[],
  sort: string
): AugmentedDbAnnouncement[] => {
  const [, direction] = sort.split(" ");
  return [...announcements].sort((a, b) => {
    return direction === "asc"
      ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
};

const paginateAnnouncements = (
  announcements: AugmentedDbAnnouncement[],
  page: number
): Pick<PaginatedResponse, 'data' | 'totalPages'> => {
  const totalPages = Math.ceil(announcements.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  return {
    data: announcements.slice(startIndex, endIndex),
    totalPages
  };
};

// Bulk operations handler
const handleBulkOperation = async (
  action: string,
  ids: number[],
  announcementService: AnnouncementService
) => {
  switch (action) {
    case 'bulk_delete':
      await announcementService.bulkDeleteAnnouncements(ids);
      return createSuccessResponse('Announcements deleted successfully');

    case 'bulk_pause':
      await announcementService.bulkUpdateAnnouncementStatus(ids, 'paused');
      return createSuccessResponse('Announcements paused successfully');

    case 'bulk_duplicate':
      const duplicatedAnnouncements = await announcementService.bulkDuplicateAnnouncements(ids);
      return createSuccessResponse('Announcements duplicated successfully', duplicatedAnnouncements);

    default:
      return createErrorResponse('Invalid bulk action', 400);
  }
};

// Single announcement handler
const handleSingleAnnouncement = async (
  action: string,
  data: unknown,
  id: number | undefined,
  shopId: string
) => {
  try {
    const validatedData = validateAnnouncement(data);
    if (!validatedData) {
      return createErrorResponse('Invalid announcement data', 400);
    }

    // Update dates and status
    if (validatedData.basic) {
      validatedData.basic.startDate = new Date(validatedData.basic.startDate);
      validatedData.basic.endDate = new Date(validatedData.basic.endDate);
      validatedData.basic.status = action === 'publish' ? 'published' : 'draft';
    }

    const announcementAction = new AnnouncementAction();
    const result = id
      ? await announcementAction.updateBasicBannerFormData(id, validatedData, shopId)
      : await announcementAction.createBasicBannerFormData(validatedData, shopId);

    return createSuccessResponse(
      `Successfully ${action === 'publish' ? 'published' : 'saved as draft'}`,
      { data: result, forAction: action }
    );

  } catch (e) {
    if (e instanceof ZodError) {
      return createErrorResponse('Validation failed', 400, {
        details: e.errors,
        forAction: action
      });
    }
    return createErrorResponse(
      e instanceof Error ? e.message : 'Failed to process announcement',
      500,
      { forAction: action }
    );
  }
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);

  // Parse query parameters
  const queryParams: QueryParams = {
    page: parseInt(url.searchParams.get("page") || "1"),
    tab: url.searchParams.get("tab") || "all",
    sort: url.searchParams.get("sort") || "date desc",
    search: url.searchParams.get("search") || ""
  };

  try {
    const announcementService = new AnnouncementService();
    
    // Use optimized database query with filtering and pagination
    const { data, totalCount } = await announcementService.getFilteredAnnouncementsByShop(
      session.shop,
      queryParams.tab,
      queryParams.search,
      queryParams.sort,
      queryParams.page,
      ITEMS_PER_PAGE
    );

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return json({
      data,
      totalPages,
      currentPage: queryParams.page
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch announcements',
      500
    );
  }
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const { session } = await authenticate.admin(request);
    const body = await request.json();
    const { action, data, id, ids } = body;

    // Handle bulk operations
    if (ids && Array.isArray(ids)) {
      const announcementService = new AnnouncementService();
      return handleBulkOperation(action, ids, announcementService);
    }

    // Handle single announcement operations
    return handleSingleAnnouncement(action, data, id, session.shop);

  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}
