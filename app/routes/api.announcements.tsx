import {type ActionFunctionArgs, json, type LoaderFunctionArgs} from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { AnnouncementService } from "../services/announcement.server";
import {AnnouncementAction} from "../services/announcementAction.server";
import { ZodError } from "zod";
import { validateAnnouncement } from "../schemas/announcement";
import type { DatabaseAnnouncement } from "../types/announcement";

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
  data: DatabaseAnnouncement[];
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

// Helper functions for filtering and sorting
const filterAnnouncements = (
  announcements: DatabaseAnnouncement[],
  { tab, search }: Pick<QueryParams, 'tab' | 'search'>
): DatabaseAnnouncement[] => {
  return announcements.filter(item => {
    const now = new Date();
    
    // Tab filter
    const matchesTab = tab === "all" ? true :
      tab === "active" ? (
        item.status === 'published' &&
        new Date(item.endDate) >= now
      ) :
      tab === "ended" ? (
        new Date(item.endDate) < now
      ) :
      item.status === tab;

    // Search filter
    const matchesSearch = !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });
};

const sortAnnouncements = (
  announcements: DatabaseAnnouncement[],
  sort: string
): DatabaseAnnouncement[] => {
  const [, direction] = sort.split(" ");
  return [...announcements].sort((a, b) => {
    return direction === "asc"
      ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
};

const paginateAnnouncements = (
  announcements: DatabaseAnnouncement[],
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
    const allAnnouncements = await announcementService.getAnnouncementsByShop(session.shop);

    // Apply filters and sorting
    const filteredAnnouncements = filterAnnouncements(allAnnouncements, queryParams);
    const sortedAnnouncements = sortAnnouncements(filteredAnnouncements, queryParams.sort);
    
    // Paginate results
    const { data, totalPages } = paginateAnnouncements(sortedAnnouncements, queryParams.page);

    return json<PaginatedResponse>({
      data,
      totalPages,
      currentPage: queryParams.page
    });
  } catch (error) {
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
