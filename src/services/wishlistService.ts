import type { Product } from '../context/AppContext';

export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  user_id: string;
  product?: Product;
}

export interface WishlistResponse {
  data: WishlistItem[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface WishlistCountResponse {
  count: number;
}

export interface AddToWishlistRequest {
  product_id: string;
}

export interface FavoriteCheckResponse {
  is_favorite: boolean;
  message: string;
}

export interface AddFavoriteResponse {
  favorite: WishlistItem;
  message: string;
}

export class WishlistService {
  private static readonly SESSION_KEY = 'guest_cart_session_id';
  private static cachedIds: Set<string> | null = null;
  private static cacheTimestamp = 0;
  private static CACHE_TTL = 30 * 1000; // 30s
  
  // Get API base path dynamically
  private static async getApiBase(): Promise<string> {
    const { API_BASE_PATH } = await import('../config/apiConfig');
    return API_BASE_PATH;
  }

  private static getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  private static getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Session-ID': this.getOrCreateSessionId(),
    };
  }

  private static async request<T>(path: string, init?: RequestInit): Promise<T> {
    const apiBase = await this.getApiBase();
    const res = await fetch(`${apiBase}${path}`, {
      headers: this.getHeaders(),
      ...init,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `HTTP ${res.status}`);
    }
    return res.json();
  }

  private static invalidateCache(): void {
    this.cachedIds = null;
    this.cacheTimestamp = 0;
  }
  /**
   * Get user's wishlist
   * @returns Promise with wishlist items
   */
  static async getWishlist(): Promise<WishlistItem[]> {
    try {
      // Backend returns: { success, favorites: { favorites: [...], total_count, ... }, is_authenticated, session_id }
      const response = await this.request<any>('/favorites');

      const favoritesContainer = response?.favorites || {};
      const rawItems: any[] = favoritesContainer.favorites || [];

      // Normalize to WishlistItem[] (we mostly need product_id and optional product)
      const list: WishlistItem[] = rawItems.map((it: any) => ({
        id: it.id || it.product_id || '',
        product_id: it.product_id,
        created_at: it.created_at || '',
        updated_at: it.updated_at || '',
        created_by: it.created_by || '',
        updated_by: it.updated_by || '',
        user_id: it.user_id || '',
        product: it.product,
      }));

      // update cache for quick isInWishlist checks
      this.cachedIds = new Set(list.map(it => it.product_id));
      this.cacheTimestamp = Date.now();
      return list;
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      throw new Error('Failed to fetch wishlist. Please try again later.');
    }
  }

  /**
   * Add product to wishlist
   * @param productId - Product ID to add
   * @returns Promise with updated wishlist
   */
  static async addToWishlist(productId: string): Promise<WishlistItem[]> {
    try {
      await this.request('/favorites', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId })
      });
      this.invalidateCache();
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      return await this.getWishlist();
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      throw new Error('Failed to add to wishlist. Please try again later.');
    }
  }

  /**
   * Remove product from wishlist
   * @param productId - Product ID to remove
   * @returns Promise with updated wishlist
   */
  static async removeFromWishlist(productId: string): Promise<WishlistItem[]> {
    try {
      await this.request('/favorites', {
        method: 'DELETE',
        body: JSON.stringify({ product_id: productId })
      });
      this.invalidateCache();
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      return await this.getWishlist();
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      throw new Error('Failed to remove from wishlist. Please try again later.');
    }
  }

  /**
   * Check if product is in wishlist
   * @param productId - Product ID to check
   * @returns Promise with boolean indicating if product is in wishlist
   */
  static async isInWishlist(productId: string): Promise<boolean> {
    try {
      const now = Date.now();
      if (!this.cachedIds || now - this.cacheTimestamp > this.CACHE_TTL) {
        const list = await this.getWishlist();
        this.cachedIds = new Set(list.map(it => it.product_id));
        this.cacheTimestamp = now;
      }
      return this.cachedIds?.has(productId) || false;
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
      return false;
    }
  }

  /**
   * Get wishlist count
   * @returns Promise with wishlist count
   */
  static async getWishlistCount(): Promise<number> {
    try {
      // Prefer server total_count to avoid fetching all items
      const response = await this.request<any>('/favorites');
      const total = response?.favorites?.total_count;
      if (typeof total === 'number') return total;
      const wishlist = await this.getWishlist();
      return wishlist.length;
    } catch (error) {
      console.error('Failed to get wishlist count:', error);
      return 0;
    }
  }

  /**
   * Clear entire wishlist
   * @returns Promise with empty wishlist
   */
  static async clearWishlist(): Promise<WishlistItem[]> {
    try {
      await this.request('/favorites/clear', { method: 'DELETE' });
      this.invalidateCache();
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      return [];
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      throw new Error('Failed to clear wishlist. Please try again later.');
    }
  }

  /**
   * Toggle product in wishlist (add if not present, remove if present)
   * @param productId - Product ID to toggle
   * @returns Promise with updated wishlist
   */
  static async toggleWishlist(productId: string): Promise<WishlistItem[]> {
    try {
      const isInWishlist = await this.isInWishlist(productId);
      
      if (isInWishlist) {
        return await this.removeFromWishlist(productId);
      } else {
        return await this.addToWishlist(productId);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      throw new Error('Failed to toggle wishlist. Please try again later.');
    }
  }

  /**
   * Get wishlist with pagination
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 10)
   * @returns Promise with paginated wishlist response
   */
  static async getWishlistPaginated(page: number = 1, pageSize: number = 10): Promise<WishlistResponse> {
    try {
      const response = await this.request<{ success: boolean; favorites: WishlistItem[]; page?: number; page_size?: number; total?: number; total_pages?: number }>(`/favorites?page=${page}&page_size=${pageSize}`);
      return {
        data: response.favorites || [],
        pagination: {
          page: response.page || page,
          page_size: response.page_size || pageSize,
          total: response.total || (response.favorites ? response.favorites.length : 0),
          total_pages: response.total_pages || 1,
        }
      };
    } catch (error) {
      console.error('Failed to fetch paginated wishlist:', error);
      throw new Error('Failed to fetch wishlist. Please try again later.');
    }
  }

  /**
   * Check if wishlist is empty
   * @returns Promise with boolean indicating if wishlist is empty
   */
  static async isWishlistEmpty(): Promise<boolean> {
    try {
      const count = await this.getWishlistCount();
      return count === 0;
    } catch (error) {
      console.error('Failed to check if wishlist is empty:', error);
      return true; // Assume empty on error
    }
  }

  /**
   * Get wishlist item by product ID
   * @param productId - Product ID to find
   * @returns Promise with wishlist item or null if not found
   */
  static async getWishlistItem(productId: string): Promise<WishlistItem | null> {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.find(item => item.product_id === productId) || null;
    } catch (error) {
      console.error('Failed to get wishlist item:', error);
      return null;
    }
  }
}

export default WishlistService;