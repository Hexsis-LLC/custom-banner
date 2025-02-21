import {type ActionFunctionArgs, json, type LoaderFunctionArgs, redirect} from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { AnnouncementService } from "../services/announcement.server";
import type {AnnouncementBannerData} from "../types/announcement";
import {AnnouncementAction} from "../services/announcementAction.server";
import { ZodError } from "zod";
import { validateAnnouncement } from "../schemas/announcement";

const ITEMS_PER_PAGE = 10;

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);

  // Get query parameters
  const page = parseInt(url.searchParams.get("page") || "1");
  const tab = url.searchParams.get("tab") || "all";
  const sort = url.searchParams.get("sort") || "date desc";
  const search = url.searchParams.get("search") || "";

  const announcementService = new AnnouncementService();
  const allAnnouncements = await announcementService.getAnnouncementsByShop(session.shop);

  // Filter announcements based on tab and search
  const filteredAnnouncements = allAnnouncements.filter(item => {
    // Apply tab filter
    const now = new Date();
    const matchesTab = tab === "all" ? true :
      tab === "active" ? (
        item.status === 'published' &&
        new Date(item.endDate) >= now
      ) :
      tab === "ended" ? (
        new Date(item.endDate) < now
      ) :
      item.status === tab;

    // Apply search filter
    const matchesSearch = !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Sort announcements
  const [, direction] = sort.split(" ");
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    return direction === "asc"
      ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedAnnouncements.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAnnouncements = sortedAnnouncements.slice(startIndex, endIndex);

  return json({
    data: paginatedAnnouncements,
    totalPages,
    currentPage: page,
  });
}


export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { action, data, id, ids } = body;

      // Handle bulk actions
      if (ids && Array.isArray(ids)) {
        const announcementService = new AnnouncementService();

        switch (action) {
          case 'bulk_delete':
            await announcementService.bulkDeleteAnnouncements(ids);
            return json({ success: true, message: 'Announcements deleted successfully' });

          case 'bulk_pause':
            await announcementService.bulkUpdateAnnouncementStatus(ids, 'paused');
            return json({ success: true, message: 'Announcements paused successfully' });

          case 'bulk_duplicate':
            const duplicatedAnnouncements = await announcementService.bulkDuplicateAnnouncements(ids);
            return json({
              success: true,
              message: 'Announcements duplicated successfully',
              data: duplicatedAnnouncements
            });
        }
      }

      // Handle single announcement actions
      try {
        const validatedData = validateAnnouncement(data);
        if (!validatedData) {
          throw new Error('Invalid announcement data');
        }

        // Update dates and status based on action
        if (validatedData.basic) {
          validatedData.basic.startDate = new Date(validatedData.basic.startDate);
          validatedData.basic.endDate = new Date(validatedData.basic.endDate);
          validatedData.basic.status = action === 'publish' ? 'published' : 'draft';
        }

        const announcementAction = new AnnouncementAction();
        let result;

        if (id) {
          result = await announcementAction.updateBasicBannerFormData(
            id,
            validatedData,
            session.shop
          );
        } else {
          result = await announcementAction.createBasicBannerFormData(
            validatedData,
            session.shop
          );
        }

        return json({
          success: true,
          data: result,
          message: `Successfully ${action === 'publish' ? 'published' : 'saved as draft'}`,
          forAction: action
        });

      } catch (e) {
        if (e instanceof ZodError) {
          return json({
            success: false,
            error: 'Validation failed',
            details: e.errors,
            forAction: action
          }, { status: 400 });
        }
        throw e;
      }
    } catch (error) {
      console.error('Error processing announcement:', error);
      return json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process announcement',
        forAction: action
      }, { status: 500 });
    }
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}

export interface AnnouncementActonRes{
  success: boolean;
  data:AnnouncementBannerData
  message?: string
  error?: string
  forAction: 'draft' | 'publish'
}

