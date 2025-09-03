import { favoritesApi, type FavoritesResponse, type FavoriteCheckResponse, type AddFavoriteResponse } from './api';
import type { Product } from '../context/AppContext';

export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  user_id: string;
  product?: Product; // Make product optional to match Favorite interface
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

export class WishlistService {
  /**
   * Get user's wishlist
   * @returns Promise with wishlist items
   */
  static async getWishlist(): Promise<WishlistItem[]> {
    try {
      const response = await favoritesApi.getFavorites();
      return response.favorites;
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
      await favoritesApi.addToFavorites(productId);
      // Refresh wishlist after adding
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
      await favoritesApi.removeFromFavorites(productId);
      // Refresh wishlist after removing
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
    // Temporarily disabled to stop API calls
    return false;
    
    // Original implementation (commented out):
    // try {
    //   const response = await favoritesApi.checkFavorite(productId);
    //   return response.is_favorite;
    // } catch (error) {
    //   console.error('Failed to check wishlist status:', error);
    //   return false;
    // }
  }

  /**
   * Get wishlist count
   * @returns Promise with wishlist count
   */
  static async getWishlistCount(): Promise<number> {
    try {
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
      const wishlist = await this.getWishlist();
      
      // Remove all items one by one using product ID
      for (const item of wishlist) {
        await this.removeFromWishlist(item.product_id); // Use product_id, not favorite ID
      }
      
      return [];
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      throw new Error('Failed to clear wishlist. Please try again later.');
    }
  }

  /**
   * Move item from wishlist to cart
   * @param favoriteId - Favorite ID to move (not product ID)
   * @returns Promise with updated wishlist
   */
  static async moveToCart(favoriteId: string): Promise<WishlistItem[]> {
    try {
      // Import CartService dynamically to avoid circular dependencies
      const { default: CartService } = await import('./cartService');
      
      // Get the wishlist item to get the product ID
      const wishlist = await this.getWishlist();
      const item = wishlist.find(w => w.id === favoriteId);
  
  if (!item) {
        throw new Error('Wishlist item not found');
      }
      
      // Add to cart using product ID
      await CartService.addItem(item.product_id, 1);
      
      // Remove from wishlist using favorite ID (but we need to use product_id for API)
      return await this.removeFromWishlist(item.product_id);
    } catch (error) {
      console.error('Failed to move item to cart:', error);
      throw new Error('Failed to move item to cart. Please try again later.');
    }
  }

  /**
   * Add all wishlist items to cart
   * @returns Promise with updated wishlist (empty after moving all items)
   */
  static async addAllToCart(): Promise<WishlistItem[]> {
    try {
      // Import CartService dynamically to avoid circular dependencies
      const { default: CartService } = await import('./cartService');
      
      const wishlist = await this.getWishlist();
      
      // Add all items to cart
      for (const item of wishlist) {
        try {
          await CartService.addItem(item.product_id, 1);
        } catch (error) {
          console.error(`Failed to add ${item.product_id} to cart:`, error);
          // Continue with other items even if one fails
        }
      }
      
      // Clear the wishlist after adding all items to cart
      // We need to remove items one by one using product_id since API expects product_id
      for (const item of wishlist) {
        try {
          await this.removeFromWishlist(item.product_id);
        } catch (error) {
          console.error(`Failed to remove ${item.product_id} from wishlist:`, error);
          // Continue with other items even if one fails
        }
      }
      
      return [];
    } catch (error) {
      console.error('Failed to add all items to cart:', error);
      throw new Error('Failed to add all items to cart. Please try again later.');
    }
  }
}

export default WishlistService; 