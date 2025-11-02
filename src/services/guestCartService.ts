import type { Product } from '../context/AppContext';

// Guest Cart Types
export interface GuestCartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface GuestCart {
  id: string;
  user_id: string;
  items: GuestCartItem[];
  total_items: number;
  total_price: number;
  discount_amount: number;
  final_price: number;
  items_count: number;
  is_empty: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuestCartResponse {
  success: boolean;
  message: string;
  data: {
    cart: GuestCart;
    session_id: string;
  };
}

export interface GuestCartSummaryResponse {
  success: boolean;
  message: string;
  data: {
    session_id: string;
    total_items: number;
    total_price: number;
    items_count: number;
    last_updated: string;
    has_expired: boolean;
    expires_at: string;
  };
}

// Guest Cart Service
export class GuestCartService {
  private static readonly SESSION_KEY = 'guest_cart_session_id';
  private static readonly CART_CACHE_KEY = 'guest_cart_cache';
  private static readonly CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

  /**
   * Get or create session ID for guest cart
   */
  private static getSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  /**
   * Get headers for guest cart API calls
   */
  private static getGuestHeaders(): HeadersInit {
    const sessionId = this.getSessionId();
    return {
      'Content-Type': 'application/json',
      'X-Session-ID': sessionId,
    };
  }

  /**
   * Make API request for guest cart
   */
  private static async guestApiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `http://localhost:8082/api/v1${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: this.getGuestHeaders(),
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Guest Cart API Request failed:', error);
      throw error;
    }
  }

  /**
   * Apply coupon to guest cart
   */
  static async applyCoupon(couponCode: string): Promise<GuestCart> {
    try {
      await this.guestApiRequest<{ success: boolean; data: any; message: string }>(
        '/cart/apply-coupon',
        {
          method: 'POST',
          body: JSON.stringify({ coupon_code: couponCode }),
        }
      );

      // Return updated cart after applying coupon
      return await this.getCart();
    } catch (error) {
      console.error('Failed to apply coupon (guest):', error);
      throw error;
    }
  }

  /**
   * Remove coupon from guest cart
   */
  static async removeCoupon(): Promise<GuestCart> {
    try {
      await this.guestApiRequest<{ success: boolean; data: any; message: string }>(
        '/cart/remove-coupon',
        { method: 'DELETE' }
      );

      // Return updated cart after removing coupon
      return await this.getCart();
    } catch (error) {
      console.error('Failed to remove coupon (guest):', error);
      throw error;
    }
  }

  /**
   * Cache cart data locally
   */
  private static cacheCart(cart: GuestCart): void {
    const cacheData = {
      cart,
      timestamp: Date.now(),
    };
    localStorage.setItem(this.CART_CACHE_KEY, JSON.stringify(cacheData));
  }

  /**
   * Get cached cart data
   */
  private static getCachedCart(): GuestCart | null {
    try {
      const cached = localStorage.getItem(this.CART_CACHE_KEY);
      if (!cached) return null;

      const { cart, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > this.CACHE_EXPIRY;
      
      if (isExpired) {
        localStorage.removeItem(this.CART_CACHE_KEY);
        return null;
      }

      return cart;
    } catch (error) {
      console.error('Failed to get cached cart:', error);
      return null;
    }
  }

  /**
   * Add item to guest cart
   */
  static async addItem(productId: string, quantity: number): Promise<GuestCart> {
    try {
      console.log(`Adding item to guest cart: ${productId}, quantity: ${quantity}`);
      
      const response = await this.guestApiRequest<GuestCartResponse>('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ 
          product_id: productId, 
          quantity 
        }),
      });

      console.log('Guest cart add item response:', response);
      
      // Extract cart data from the nested structure
      const cartData = response.data.cart;
      
      // Cache the updated cart
      this.cacheCart(cartData);
      
      // Dispatch cart updated event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return cartData;
    } catch (error: any) {
      console.error('Failed to add item to guest cart:', error);
      
      if (error.message && error.message.includes('stock')) {
        throw new Error('Product is currently out of stock');
      } else if (error.message && error.message.includes('coming soon')) {
        throw new Error('Product is coming soon');
      } else {
        throw new Error('Failed to add item to cart. Please try again later.');
      }
    }
  }

  /**
   * Get guest cart
   */
  static async getCart(): Promise<GuestCart> {
    try {
      // Try cached cart first
      const cachedCart = this.getCachedCart();
      if (cachedCart) {
        console.log('Using cached guest cart');
        return cachedCart;
      }

      console.log('Fetching guest cart from server');
      const response = await this.guestApiRequest<GuestCartResponse>('/cart');
      
      // Extract cart data from the nested structure
      const cartData = response.data.cart;
      
      // Cache the cart
      this.cacheCart(cartData);
      
      return cartData;
    } catch (error) {
      console.error('Failed to fetch guest cart:', error);
      throw new Error('Failed to fetch cart. Please try again later.');
    }
  }

  /**
   * Update item quantity in guest cart
   */
  static async updateItemQuantity(productId: string, quantity: number): Promise<GuestCart> {
    try {
      console.log(`Updating guest cart item quantity: ${productId}, quantity: ${quantity}`);
      
      const response = await this.guestApiRequest<GuestCartResponse>(`/cart/items/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });

      console.log('Guest cart update item response:', response);
      
      // Extract cart data from the nested structure
      const cartData = response.data.cart;
      
      // Cache the updated cart
      this.cacheCart(cartData);
      
      // Dispatch cart updated event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return cartData;
    } catch (error) {
      console.error('Failed to update guest cart item quantity:', error);
      throw new Error('Failed to update cart item quantity. Please try again later.');
    }
  }

  /**
   * Remove item from guest cart
   */
  static async removeItem(productId: string): Promise<GuestCart> {
    try {
      console.log(`Removing item from guest cart: ${productId}`);
      
      const response = await this.guestApiRequest<GuestCartResponse>(`/cart/items/${productId}`, {
        method: 'DELETE',
      });

      console.log('Guest cart remove item response:', response);
      
      // Extract cart data from the nested structure
      const cartData = response.data.cart;
      
      // Cache the updated cart
      this.cacheCart(cartData);
      
      // Dispatch cart updated event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return cartData;
    } catch (error) {
      console.error('Failed to remove item from guest cart:', error);
      throw new Error('Failed to remove item from cart. Please try again later.');
    }
  }

  /**
   * Get guest cart summary
   */
  static async getSummary(): Promise<GuestCartSummaryResponse['data']> {
    try {
      const response = await this.guestApiRequest<GuestCartSummaryResponse>('/cart/summary');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch guest cart summary:', error);
      throw new Error('Failed to fetch cart summary. Please try again later.');
    }
  }

  /**
   * Get guest cart item count
   */
  static async getItemCount(): Promise<number> {
    try {
      const summary = await this.getSummary();
      return summary.total_items;
    } catch (error) {
      console.error('Failed to fetch guest cart item count:', error);
      return 0;
    }
  }

  /**
   * Check if guest cart is empty
   */
  static async isCartEmpty(): Promise<boolean> {
    try {
      const cart = await this.getCart();
      return cart.items.length === 0;
    } catch (error) {
      console.error('Failed to check if guest cart is empty:', error);
      return true;
    }
  }

  /**
   * Get guest cart total
   */
  static async getCartTotal(): Promise<number> {
    try {
      const summary = await this.getSummary();
      return summary.total_price;
    } catch (error) {
      console.error('Failed to get guest cart total:', error);
      return 0;
    }
  }

  /**
   * Get guest cart items
   */
  static async getCartItems(): Promise<GuestCartItem[]> {
    try {
      const cart = await this.getCart();
      return cart.items;
    } catch (error) {
      console.error('Failed to get guest cart items:', error);
      return [];
    }
  }

  /**
   * Get specific guest cart item
   */
  static async getCartItem(productId: string): Promise<GuestCartItem | null> {
    try {
      const cart = await this.getCart();
      return cart.items.find(item => item.product_id === productId) || null;
    } catch (error) {
      console.error('Failed to get guest cart item:', error);
      return null;
    }
  }

  /**
   * Check if product is in guest cart
   */
  static async isProductInCart(productId: string): Promise<boolean> {
    try {
      const item = await this.getCartItem(productId);
      return item !== null;
    } catch (error) {
      console.error('Failed to check if product is in guest cart:', error);
      return false;
    }
  }

  /**
   * Get product quantity in guest cart
   */
  static async getProductQuantity(productId: string): Promise<number> {
    try {
      const item = await this.getCartItem(productId);
      return item ? item.quantity : 0;
    } catch (error) {
      console.error('Failed to get product quantity in guest cart:', error);
      return 0;
    }
  }

  /**
   * Clear guest cart
   */
  static async clearCart(): Promise<GuestCart> {
    try {
      const cart = await this.getCart();
      
      // Remove all items one by one
      for (const item of cart.items) {
        await this.removeItem(item.product_id);
      }
      
      return await this.getCart();
    } catch (error) {
      console.error('Failed to clear guest cart:', error);
      throw new Error('Failed to clear cart. Please try again later.');
    }
  }

  /**
   * Migrate guest cart to user account
   * Returns the merged cart from the API response
   */
  static async migrateCart(authToken: string): Promise<any> {
    try {
      const sessionId = this.getSessionId();
      
      console.log('Migrating guest cart to user account...');
      
      const response = await fetch('http://localhost:8082/api/v1/cart/migrate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Session-ID': sessionId,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Guest cart migrated successfully, response:', responseData);
      
      // Extract merged cart from response
      const mergedCart = responseData.data;
      
      // Clear guest cart data
      this.clearGuestCartData();
      
      // Return merged cart for immediate cache update
      return mergedCart;
      
    } catch (error) {
      console.error('Failed to migrate guest cart:', error);
      throw new Error('Failed to migrate cart. Please try again later.');
    }
  }

  /**
   * Clear guest cart data from localStorage
   */
  static clearGuestCartData(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.CART_CACHE_KEY);
    console.log('Guest cart data cleared');
  }

  /**
   * Get current session ID
   */
  static getCurrentSessionId(): string | null {
    return localStorage.getItem(this.SESSION_KEY);
  }

  // Utility methods
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  }

  static calculateTotalPrice(items: GuestCartItem[]): number {
    return items.reduce((total, item) => total + item.total_price, 0);
  }

  static calculateTotalItems(items: GuestCartItem[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  static hasItems(items: GuestCartItem[]): boolean {
    return items.length > 0;
  }

  static getItemByProductId(items: GuestCartItem[], productId: string): GuestCartItem | undefined {
    return items.find(item => item.product_id === productId);
  }

  static validateQuantity(quantity: number): boolean {
    return quantity > 0 && quantity <= 99;
  }

  static getItemSubtotal(price: number, quantity: number): number {
    return price * quantity;
  }
}

export default GuestCartService;
