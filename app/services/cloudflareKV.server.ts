import type {KVAnnouncement} from '../types/announcement';


export interface AnnouncementKVData {
  global: KVAnnouncement[];
  __patterns: string[];
  [key: string]: KVAnnouncement[] | string[];
}

export class CloudflareKVService {
  private readonly accountId: string;
  private readonly namespaceId: string;
  private readonly authToken: string;
  private readonly baseUrl: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    this.namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID || '';
    this.authToken = process.env.CLOUDFLARE_AUTH_TOKEN || '';
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}`;

    // Validate required environment variables
    if (!this.accountId || !this.namespaceId || !this.authToken) {
      console.error('Missing required Cloudflare KV environment variables:', {
        hasAccountId: !!this.accountId,
        hasNamespaceId: !!this.namespaceId,
        hasAuthToken: !!this.authToken
      });
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.accountId || !this.namespaceId || !this.authToken) {
      throw new Error('Missing required Cloudflare KV configuration');
    }

    console.log('Making Cloudflare KV request:', {
      url: `${this.baseUrl}${endpoint}`,
      method: options.method || 'GET'
    });

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudflare KV request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Cloudflare KV request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response;
  }

  async getAnnouncementsByShop(shopId: string): Promise<AnnouncementKVData | null> {
    try {
      console.log('Fetching announcements from KV for shop:', shopId);
      const response = await this.makeRequest(`/values/${shopId}`);
      const data = await response.json();

      if (!data.success) {
        console.error('Cloudflare KV response indicated failure:', data);
        return null;
      }

      console.log('Successfully fetched announcements from KV:', {
        hasGlobal: Array.isArray(data.result?.global),
        globalCount: data.result?.global?.length || 0,
        patterns: data.result?.__patterns || []
      });

      return data.result;
    } catch (error) {
      console.error('Error fetching announcements from KV:', error);
      return null;
    }
  }

  async updateAnnouncementsByShop(shopId: string, data: AnnouncementKVData): Promise<boolean> {
    try {
      console.log('Updating announcements in KV for shop:', shopId, {
        globalCount: data.global.length,
        patterns: data.__patterns
      });

      const response = await this.makeRequest(`/values/${shopId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Cloudflare KV update response indicated failure:', result);
        return false;
      }

      console.log('Successfully updated announcements in KV');
      return true;
    } catch (error) {
      console.error('Error updating announcements in KV:', error);
      return false;
    }
  }

  async deleteAnnouncementsByShop(shopId: string): Promise<boolean> {
    try {
      console.log('Deleting announcements from KV for shop:', shopId);

      const response = await this.makeRequest(`/values/${shopId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Cloudflare KV delete response indicated failure:', result);
        return false;
      }

      console.log('Successfully deleted announcements from KV');
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
