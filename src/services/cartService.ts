import { cartApi, type CartResponse, type CartSummaryResponse, type CartCountResponse, type CartValidationResponse, type Cart, type CartItem } from './api';
import type { Product } from '../context/AppContext';
import { GuestCartService, type GuestCart, type GuestCartItem, type GuestCartSummaryResponse } from './guestCartService';
import AuthService from './authService';

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export class CartService {
  /**
   * Check if user is authenticated
   * Uses synchronous check for immediate response
   */
  private static isAuthenticated(): boolean {
    return AuthService.isAuthenticated();
  }

  /**
   * Migrate guest cart to user account when user logs in
   * Returns the merged cart from the API response
   * CRITICAL: This must succeed or items will be lost
   */
  static async migrateGuestCart(): Promise<any> {
    try {
      const isAuth = this.isAuthenticated();
      if (!isAuth) {
        return null;
      }

      const guestSessionId = GuestCartService.getCurrentSessionId();
      if (!guestSessionId) {
        return null;
      }

      // First, get the guest cart to see what we're migrating
      const guestCart = await GuestCartService.getCart();
      const guestItems = guestCart?.items || [];
      const guestTotalItems = guestCart?.total_items || (guestCart as any)?.items_count || 0;
      
      if (guestTotalItems === 0 || guestItems.length === 0) {
        return null;
      }

      const token = await AuthService.getIdToken();
      if (!token) {
        console.error('No auth token available for cart migration');
        throw new Error('Authentication token not available for cart migration');
      }

      // Retry migration up to 3 times to ensure it succeeds
      let mergedCart: any = null;
      let lastError: any = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          mergedCart = await GuestCartService.migrateCart(token);
          
          // Verify migration succeeded by checking if merged cart has items
          const mergedItems = mergedCart?.items || [];
          const mergedTotalItems = mergedCart?.total_items || (mergedCart as any)?.items_count || 0;
          
          if (mergedTotalItems > 0 && mergedItems.length > 0) {
            const mergedCartId = mergedCart?.id || mergedCart?.cart_id || (mergedCart as any)?.cartId;
            const mergedUserId = mergedCart?.user_id || (mergedCart as any)?.userId;
            
            // CRITICAL: Verify the migrated cart is an authenticated cart (not guest cart)
            if (mergedCartId && mergedCartId.startsWith('guest_')) {
              throw new Error('Cart migration failed - received guest cart instead of authenticated cart');
            }
            
            // Final verification: Fetch the authenticated cart to ensure it has the items
            try {
              const verifiedCart = await cartApi.getCart();
              const verifiedCartData = verifiedCart.data.cart;
              const verifiedItems = verifiedCartData?.items || [];
              const verifiedTotalItems = verifiedCartData?.total_items || (verifiedCartData as any)?.items_count || 0;
              const verifiedCartId = verifiedCartData?.id || verifiedCartData?.cart_id;
              
              if (verifiedTotalItems > 0 && verifiedItems.length > 0 && verifiedCartId && !verifiedCartId.startsWith('guest_')) {
                return mergedCart;
              } else {
                // Wait a bit and retry
                if (attempt < 2) {
                  await new Promise(resolve => setTimeout(resolve, 1000 + (attempt * 500)));
                }
              }
            } catch (verifyError) {
              console.error('Failed to verify cart after migration:', verifyError);
              // Continue with merged cart anyway
              return mergedCart;
            }
          } else {
            if (attempt < 2) {
              await new Promise(resolve => setTimeout(resolve, 1000 + (attempt * 500)));
            }
          }
        } catch (error: any) {
          console.error(`Cart migration attempt ${attempt + 1} failed:`, error);
          lastError = error;
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000 + (attempt * 500)));
          }
        }
      }
      
      // If all retries failed, throw error
      if (!mergedCart || (mergedCart?.items || []).length === 0) {
        console.error('Cart migration failed after all retries. Guest cart items may be lost.');
        throw new Error(lastError?.message || 'Cart migration failed. Guest cart items were not migrated.');
      }
      
      return mergedCart;
    } catch (error: any) {
      console.error('Failed to migrate guest cart:', error);
      // CRITICAL: Don't silently fail - throw error so it can be handled
      throw error;
    }
  }

  /**
   * Add item to cart (works for both authenticated and guest users)
   * CRITICAL: Ensures cart consistency by using the correct cart API based on authentication
   * If user is logged in → uses authenticated cart API (with auth token)
   * If user is NOT logged in → uses guest cart API (with session ID)
   * @param productId - Product ID to add
   * @param quantity - Quantity to add
   * @returns Promise with updated cart
   */
  static async addItem(productId: string, quantity: number): Promise<Cart | GuestCart> {
    try {
      // CRITICAL: Use synchronous authentication check for immediate response
      const isAuth = this.isAuthenticated();
      
      // Double-check: Verify we have auth token if authenticated
      if (isAuth) {
        const token = await AuthService.getIdToken();
        if (!token) {
          // Fall back to guest cart if no token
          return await GuestCartService.addItem(productId, quantity);
        }
        
        // User is authenticated with valid token, use regular cart API
        const response = await cartApi.addItem(productId, quantity);
        const cartData = response.data;
        
        // Verify the cart ID is an authenticated cart (not guest cart)
        const cartId = cartData?.id || cartData?.cart_id || (cartData as any)?.cartId;
        if (cartId && cartId.startsWith('guest_')) {
          throw new Error('Cart identification error. Please try again.');
        }
        
        // Dispatch cart updated event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        return cartData;
      } else {
        // User is not authenticated, use guest cart with session ID
        return await GuestCartService.addItem(productId, quantity);
      }
    } catch (error: any) {
      console.error('Failed to add item to cart:', error);
      
      // Check if it's a stock-related error
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
   * Get user's cart (works for both authenticated and guest users)
   * CRITICAL: Ensures cart consistency by checking for guest cart migration if needed
   * @returns Promise with cart details
   */
  static async getCart(): Promise<Cart | GuestCart> {
    try {
      const isAuth = this.isAuthenticated();
      
      if (isAuth) {
        // User is authenticated - check if there's a guest cart that needs migration
        const guestSessionId = GuestCartService.getCurrentSessionId();
        if (guestSessionId) {
          try {
            // Check if guest cart has items
            const guestCart = await GuestCartService.getCart();
            const guestItems = guestCart?.items || [];
            const guestTotalItems = guestCart?.total_items || (guestCart as any)?.items_count || 0;
            
            // If guest cart has items, migrate it first
            if (guestTotalItems > 0 && guestItems.length > 0) {
              try {
                await this.migrateGuestCart();
              } catch (migrationError) {
                // Continue with authenticated cart even if migration fails
              }
            }
          } catch (guestCartError) {
            // If guest cart doesn't exist or is empty, that's fine - continue with authenticated cart
          }
        }
        
        // User is authenticated, use regular cart API
        const response = await cartApi.getCart();
        const cart = response.data.cart;
        
        // CRITICAL: Verify cart has items - if empty, check if guest cart still has items
        const items = cart.items || [];
        const totalItems = cart.total_items || (cart as any)?.items_count || 0;
        
        if (totalItems === 0 && items.length === 0 && guestSessionId) {
          // Authenticated cart is empty, but we might have a guest cart with items
          try {
            const guestCart = await GuestCartService.getCart();
            const guestItems = guestCart?.items || [];
            const guestTotalItems = guestCart?.total_items || (guestCart as any)?.items_count || 0;
            
            if (guestTotalItems > 0 && guestItems.length > 0) {
              try {
                const migratedCart = await this.migrateGuestCart();
                if (migratedCart) {
                  // Re-fetch authenticated cart after migration
                  const retryResponse = await cartApi.getCart();
                  const retryCart = retryResponse.data.cart;
                  const retryItems = retryCart.items || [];
                  const retryTotalItems = retryCart.total_items || (retryCart as any)?.items_count || 0;
                  
                  if (retryTotalItems > 0 && retryItems.length > 0) {
                    // Use the migrated cart
                    const { default: ProductService } = await import('./productService');
                    const enrichedItems = await Promise.all(
                      retryItems.map(async (item) => {
                        try {
                          const product = await ProductService.getProductById(item.product_id);
                          let enrichedProduct: any = { ...product };
                          if (!enrichedProduct.image_url && enrichedProduct.images && Array.isArray(enrichedProduct.images)) {
                            const primaryImage = enrichedProduct.images.find((img: any) => img.is_primary) || enrichedProduct.images[0];
                            if (primaryImage?.image_url) {
                              enrichedProduct.image_url = primaryImage.image_url;
                            }
                          }
                          return { ...item, product: enrichedProduct };
                        } catch (error) {
                          console.error(`Failed to fetch product ${item.product_id}:`, error);
                          return item;
                        }
                      })
                    );
                    return { ...retryCart, items: enrichedItems };
                  }
                }
              } catch (migrationError) {
                // Migration failed, continue with empty cart
              }
            }
          } catch (guestError) {
            // No guest cart available
          }
        }
        
        // Fetch product details for each cart item
        const { default: ProductService } = await import('./productService');
        
        const enrichedItems = await Promise.all(
          items.map(async (item) => {
            try {
              const product = await ProductService.getProductById(item.product_id);
              
              // Ensure product has image_url for backward compatibility
              let enrichedProduct: any = { ...product };
              
              // If product has images array but no image_url, extract from images
              if (!enrichedProduct.image_url && enrichedProduct.images && Array.isArray(enrichedProduct.images)) {
                const primaryImage = enrichedProduct.images.find((img: any) => img.is_primary) || enrichedProduct.images[0];
                if (primaryImage?.image_url) {
                  enrichedProduct.image_url = primaryImage.image_url;
                }
              }
              
              return {
                ...item,
                product: enrichedProduct
              };
            } catch (error) {
              console.error(`Failed to fetch product ${item.product_id}:`, error);
              // Return item without product details if fetch fails
              return item;
            }
          })
        );
        
        return {
          ...cart,
          items: enrichedItems
        };
      } else {
        // User is not authenticated, use guest cart
        const guestCart = await GuestCartService.getCart();
        
        // Fetch product details for each cart item
        const { default: ProductService } = await import('./productService');
        
        const enrichedItems = await Promise.all(
          guestCart.items.map(async (item) => {
            try {
              const product = await ProductService.getProductById(item.product_id);
              return {
                ...item,
                product
              };
            } catch (error) {
              // Return item without product details if fetch fails
              return item;
            }
          })
        );
        
        return {
          ...guestCart,
          items: enrichedItems
        };
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      throw new Error('Failed to fetch cart. Please try again later.');
    }
  }

  /**
   * Update item quantity in cart (works for both authenticated and guest users)
   * @param productId - Product ID to update
   * @param quantity - New quantity
   * @returns Promise with updated cart
   */
  static async updateItemQuantity(productId: string, quantity: number): Promise<Cart | GuestCart> {
    try {
      const isAuth = this.isAuthenticated();
      
      if (isAuth) {
        // User is authenticated, use regular cart API
        await cartApi.updateItemQuantity(productId, quantity);
        
        // Dispatch cart updated event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Re-fetch the enriched cart to ensure product details are included
        return await this.getCart();
      } else {
        // User is not authenticated, use guest cart
        return await GuestCartService.updateItemQuantity(productId, quantity);
      }
    } catch (error) {
      console.error('Failed to update cart item quantity:', error);
      throw new Error('Failed to update cart item quantity. Please try again later.');
    }
  }

  /**
   * Remove item from cart (works for both authenticated and guest users)
   * @param productId - Product ID to remove
   * @returns Promise with updated cart
   */
  static async removeItem(productId: string): Promise<Cart | GuestCart> {
    try {
      const isAuth = this.isAuthenticated();
      
      if (isAuth) {
        // User is authenticated, use regular cart API
        await cartApi.removeItem(productId);
        
        // Dispatch cart updated event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Re-fetch the enriched cart to ensure product details are included
        return await this.getCart();
      } else {
        // User is not authenticated, use guest cart
        return await GuestCartService.removeItem(productId);
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw new Error('Failed to remove item from cart. Please try again later.');
    }
  }

  /**
   * Increment item quantity (works for both authenticated and guest users)
   * @param productId - Product ID to increment
   * @returns Promise with updated cart
   */
  static async incrementItem(productId: string): Promise<Cart | GuestCart> {
    try {
      const isAuth = this.isAuthenticated();
      
      if (isAuth) {
        // User is authenticated, use regular cart API
        await cartApi.incrementItem(productId);
        
        // Dispatch cart updated event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Re-fetch the enriched cart to ensure product details are included
        return await this.getCart();
      } else {
        // User is not authenticated, use guest cart
        const currentQuantity = await GuestCartService.getProductQuantity(productId);
        const newQuantity = currentQuantity + 1;
        return await GuestCartService.updateItemQuantity(productId, newQuantity);
      }
    } catch (error) {
      console.error('Failed to increment item quantity:', error);
      throw new Error('Failed to increment item quantity. Please try again later.');
    }
  }

  /**
   * Decrement item quantity (works for both authenticated and guest users)
   * @param productId - Product ID to decrement
   * @returns Promise with updated cart
   */
  static async decrementItem(productId: string): Promise<Cart | GuestCart> {
    try {
      const isAuth = this.isAuthenticated();
      
      if (isAuth) {
        // User is authenticated, use regular cart API
        await cartApi.decrementItem(productId);
        
        // Dispatch cart updated event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Re-fetch the enriched cart to ensure product details are included
        return await this.getCart();
      } else {
        // User is not authenticated, use guest cart
        const currentQuantity = await GuestCartService.getProductQuantity(productId);
        const newQuantity = Math.max(0, currentQuantity - 1);
        
        if (newQuantity === 0) {
          // Remove item if quantity becomes 0
          return await GuestCartService.removeItem(productId);
        } else {
          return await GuestCartService.updateItemQuantity(productId, newQuantity);
        }
      }
    } catch (error) {
      console.error('Failed to decrement item quantity:', error);
      throw new Error('Failed to decrement item quantity. Please try again later.');
    }
  }

  /**
   * Get cart summary (works for both authenticated and guest users)
   * @returns Promise with cart summary
   */
  static async getSummary(): Promise<CartSummaryResponse['data'] | GuestCartSummaryResponse['data']> {
    try {
      const isAuth = this.isAuthenticated();
      
      if (isAuth) {
        // User is authenticated, use regular cart API
        const response = await cartApi.getSummary();
        return response.data;
      } else {
        // User is not authenticated, use guest cart
        const guestSummary = await GuestCartService.getSummary();
        return guestSummary;
      }
    } catch (error) {
      console.error('Failed to fetch cart summary:', error);
      throw new Error('Failed to fetch cart summary. Please try again later.');
    }
  }

  /**
   * Get cart item count (works for both authenticated and guest users)
   * @returns Promise with cart item count
   */
  static async getItemCount(): Promise<number> {
    try {
      const isAuth = this.isAuthenticated();
      
      if (isAuth) {
        // User is authenticated, use regular cart API
        const response = await cartApi.getCount();
        return response.data.item_count;
      } else {
        // User is not authenticated, use guest cart
        const guestCount = await GuestCartService.getItemCount();
        return guestCount;
      }
    } catch (error) {
      console.error('Failed to fetch cart item count:', error);
      return 0;
    }
  }

  /**
   * Validate cart
   * @returns Promise with cart validation results
   */
  static async validateCart(): Promise<CartValidationResponse['data']> {
    try {
      const response = await cartApi.validate();
      return response.data;
    } catch (error) {
      console.error('Failed to validate cart:', error);
      throw new Error('Failed to validate cart. Please try again later.');
    }
  }

  /**
   * Check if cart is empty (works for both authenticated and guest users)
   * @returns Promise with boolean indicating if cart is empty
   */
  static async isCartEmpty(): Promise<boolean> {
    try {
      const isAuth = this.isAuthenticated();
      
      if (isAuth) {
        // User is authenticated, use regular cart API
        const cart = await this.getCart();
        return (cart as Cart).items.length === 0;
      } else {
        // User is not authenticated, use guest cart
        const isEmpty = await GuestCartService.isCartEmpty();
        return isEmpty;
      }
    } catch (error) {
      console.error('Failed to check if cart is empty:', error);
      return true;
    }
  }

  /**
   * Get cart total (works for both authenticated and guest users)
   * @returns Promise with cart total
   */
  static async getCartTotal(): Promise<number> {
    try {
      const isAuth = this.isAuthenticated();
      
      if (isAuth) {
        // User is authenticated, use regular cart API
        const summary = await this.getSummary();
        return (summary as CartSummaryResponse['data']).total_price;
      } else {
        // User is not authenticated, use guest cart
        const guestTotal = await GuestCartService.getCartTotal();
        return guestTotal;
      }
    } catch (error) {
      console.error('Failed to get cart total:', error);
      return 0;
    }
  }

  /**
   * Get cart discount amount (works for both authenticated and guest users)
   * @returns Promise with cart discount amount
   */
  static async getCartDiscount(): Promise<number> {
    try {
      const summary = await this.getSummary();
      // Check if it's authenticated cart summary (has discount_amount) or guest cart summary
      if ('discount_amount' in summary) {
        return (summary as CartSummaryResponse['data']).discount_amount;
      }
      // Guest cart doesn't have discount functionality yet
      return 0;
    } catch (error) {
      console.error('Failed to get cart discount:', error);
      return 0;
    }
  }

  /**
   * Get cart discounted total (works for both authenticated and guest users)
   * @returns Promise with cart discounted total
   */
  static async getCartDiscountedTotal(): Promise<number> {
    try {
      const summary = await this.getSummary();
      // Check if it's authenticated cart summary (has discounted_total) or guest cart summary
      if ('discounted_total' in summary) {
        return (summary as CartSummaryResponse['data']).discounted_total || 0;
      }
      // For guest cart, return the total price (no discount functionality yet)
      return (summary as GuestCartSummaryResponse['data']).total_price;
    } catch (error) {
      console.error('Failed to get cart discounted total:', error);
      return 0;
    }
  }

  /**
   * Check if cart has expired
   * @returns Promise with boolean indicating if cart has expired
   */
  static async isCartExpired(): Promise<boolean> {
    try {
      const summary = await this.getSummary();
      return summary.has_expired;
    } catch (error) {
      console.error('Failed to check if cart has expired:', error);
      return false;
    }
  }

  /**
   * Get cart items (works for both authenticated and guest users)
   * @returns Promise with cart items
   */
  static async getCartItems(): Promise<CartItem[] | GuestCartItem[]> {
    try {
      const isAuth = this.isAuthenticated();
      
      if (isAuth) {
        // User is authenticated, use regular cart API
        const cart = await this.getCart();
        return (cart as Cart).items;
      } else {
        // User is not authenticated, use guest cart
        const guestItems = await GuestCartService.getCartItems();
        return guestItems;
      }
    } catch (error) {
      console.error('Failed to get cart items:', error);
      return [];
    }
  }

  /**
   * Get specific cart item (works for both authenticated and guest users)
   * @param productId - Product ID to find
   * @returns Promise with cart item or null
   */
  static async getCartItem(productId: string): Promise<CartItem | GuestCartItem | null> {
    try {
      const isAuth = this.isAuthenticated();
      
      if (isAuth) {
        // User is authenticated, use regular cart API
        const cart = await this.getCart();
        return (cart as Cart).items.find(item => item.product_id === productId) || null;
      } else {
        // User is not authenticated, use guest cart
        const guestItem = await GuestCartService.getCartItem(productId);
        return guestItem;
      }
    } catch (error) {
      console.error('Failed to get cart item:', error);
      return null;
    }
  }

  /**
   * Check if product is in cart (works for both authenticated and guest users)
   * @param productId - Product ID to check
   * @returns Promise with boolean indicating if product is in cart
   */
  static async isProductInCart(productId: string): Promise<boolean> {
    try {
      const isAuth = this.isAuthenticated();
      
      if (isAuth) {
        // User is authenticated, use regular cart API
        const item = await this.getCartItem(productId);
        return item !== null;
      } else {
        // User is not authenticated, use guest cart
        const isInGuestCart = await GuestCartService.isProductInCart(productId);
        return isInGuestCart;
      }
    } catch (error) {
      console.error('Failed to check if product is in cart:', error);
      return false;
    }
  }

  /**
   * Get product quantity in cart (works for both authenticated and guest users)
   * @param productId - Product ID to check
   * @returns Promise with product quantity or 0
   */
  static async getProductQuantity(productId: string): Promise<number> {
    try {
      const isAuth = this.isAuthenticated();
      
      if (isAuth) {
        // User is authenticated, use regular cart API
        const item = await this.getCartItem(productId);
        return item ? (item as CartItem).quantity : 0;
      } else {
        // User is not authenticated, use guest cart
        const guestQuantity = await GuestCartService.getProductQuantity(productId);
        return guestQuantity;
      }
    } catch (error) {
      console.error('Failed to get product quantity in cart:', error);
      return 0;
    }
  }

  /**
   * Clear entire cart (works for both authenticated and guest users)
   * @returns Promise with empty cart
   */
  static async clearCart(): Promise<Cart | GuestCart> {
    try {
      const isAuth = this.isAuthenticated();
      
      if (isAuth) {
        // User is authenticated, use regular cart API
        const cart = await this.getCart();
        
        // Remove all items one by one
        for (const item of (cart as Cart).items) {
          await this.removeItem(item.product_id);
        }
        
        return await this.getCart();
      } else {
        // User is not authenticated, use guest cart
        const guestCart = await GuestCartService.clearCart();
        return guestCart;
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw new Error('Failed to clear cart. Please try again later.');
    }
  }

  /**
   * Update multiple items at once (works for both authenticated and guest users)
   * @param updates - Array of product ID and quantity updates
   * @returns Promise with updated cart
   */
  static async updateMultipleItems(updates: Array<{ productId: string; quantity: number }>): Promise<Cart | GuestCart> {
    try {
      for (const update of updates) {
        await this.updateItemQuantity(update.productId, update.quantity);
      }
      return await this.getCart();
    } catch (error) {
      console.error('Failed to update multiple cart items:', error);
      throw new Error('Failed to update multiple cart items. Please try again later.');
    }
  }

  // Utility methods
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  }

  static calculateTotalPrice(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.total_price, 0);
  }

  static calculateTotalItems(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  static hasItems(items: CartItem[]): boolean {
    return items.length > 0;
  }

  static getItemByProductId(items: CartItem[], productId: string): CartItem | undefined {
    return items.find(item => item.product_id === productId);
  }

  static validateQuantity(quantity: number): boolean {
    return quantity > 0 && quantity <= 99;
  }

  static getItemSubtotal(price: number, quantity: number): number {
    return price * quantity;
  }

  /**
   * Apply coupon to cart
   * @param couponCode - Coupon code to apply
   * @returns Promise with updated cart including discount
   */
  static async applyCoupon(couponCode: string): Promise<Cart> {
    try {
      const isAuth = await this.isAuthenticated();
      if (isAuth) {
        const response = await cartApi.applyCoupon(couponCode);
        const updatedCart = {
          ...response.data.cart,
          discount_amount: response.data.discount_amount,
          discounted_total: response.data.discounted_total
        } as Cart;
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        return updatedCart;
      } else {
        // Guest flow
        const guestCart = await GuestCartService.applyCoupon(couponCode);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        // Cast to Cart-compatible shape where needed by UI; discount fields handled conditionally
        return guestCart as unknown as Cart;
      }
    } catch (error: any) {
      console.error('Failed to apply coupon:', error);
      throw new Error(error.message || 'Failed to apply coupon. Please try again later.');
    }
  }

  /**
   * Remove coupon from cart
   * @returns Promise with updated cart without discount
   */
  static async removeCoupon(): Promise<Cart> {
    try {
      const isAuth = await this.isAuthenticated();
      if (isAuth) {
        const response = await cartApi.removeCoupon();
        const updatedCart = {
          ...response.data.cart,
          discount_amount: 0,
          discounted_total: undefined
        } as Cart;
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        return updatedCart;
      } else {
        const guestCart = await GuestCartService.removeCoupon();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        return guestCart as unknown as Cart;
      }
    } catch (error: any) {
      console.error('Failed to remove coupon:', error);
      throw new Error(error.message || 'Failed to remove coupon. Please try again later.');
    }
  }
}

export default CartService; 