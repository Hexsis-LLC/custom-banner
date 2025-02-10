import type { AnnouncementBannerData } from '../types/announcement';

interface AnnouncementKVData {
  global: AnnouncementBannerData[];
  __patterns: string[];
  [key: string]: AnnouncementBannerData[] | string[];
}

export class CloudflareKVService {
  private accountId: string;
  private namespaceId: string;
  private authToken: string;
  private baseUrl: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    this.namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID || '';
    this.authToken = process.env.CLOUDFLARE_AUTH_TOKEN || '';
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}`;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Cloudflare KV request failed: ${response.statusText}`);
    }

    return response;
  }

  async getAnnouncementsByShop(shopId: string): Promise<AnnouncementKVData | null> {
    try {
      const response = await this.makeRequest(`/values/${shopId}`);
      const data = await response.json();
      return data.success ? data.result : null;
    } catch (error) {
      console.error('Error fetching announcements from KV:', error);
      return null;
    }
  }

  async updateAnnouncementsByShop(shopId: string, data: AnnouncementKVData): Promise<boolean> {
    try {
      await this.makeRequest(`/values/${shopId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return true;
    } catch (error) {
      console.error('Error updating announcements in KV:', error);
      return false;
    }
  }

  async deleteAnnouncementsByShop(shopId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/values/${shopId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting announcements from KV:', error);
      return false;
    }
  }

  /*async organizeAnnouncementsForKV(announcements: AnnouncementBannerData[]): Promise<AnnouncementKVData> {
    const organized: AnnouncementKVData = {
      global: [],
      __patterns: []
    };

    for (const announcement of announcements) {
      const pages = announcement.other.selectedPages;

      for (const page of pages) {
        if (page === '__global') {
          organized.global.push(announcement);
        } else {
          // Check if it's a pattern (contains * or other pattern characters)
          if (page.includes('*')) {
            if (!organized.__patterns.includes(page)) {
              organized.__patterns.push(page);
            }
            if (!Array.isArray(organized[page])) {
              organized[page] = [];
            }
            (organized[page] as AnnouncementBannerData[]).push(announcement);
          } else {
            // Regular page path
            if (!Array.isArray(organized[page])) {
              organized[page] = [];
            }
            (organized[page] as AnnouncementBannerData[]).push(announcement);
          }
        }
      }
    }

    return organized;
  }*/
}
