import type { Announcement } from "../../types/announcement";

export interface BannerListResponse {
  data: Announcement[];
  totalPages: number;
  currentPage: number;
} 