import { cartApi, type CartResponse, type CartSummaryResponse, type CartCountResponse, type CartValidationResponse, type Cart, type CartItem } from './api';
import type { Product } from '../context/AppContext';

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export class CartService {
  /**
   * Add item to cart
   * @param productId - Product ID to add
   * @param quantity - Quantity to add
   * @returns Promise with updated cart
   */
  static async addItem(productId: string, quantity: number): Promise<Cart> {
    try {
      console.log(`Adding item to cart: ${productId}, quantity: ${quantity}`);
      const response = await cartApi.addItem(productId, quantity);
      console.log('Add item response:', response);
      
      // Dispatch cart updated event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return response.data;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw new Error('Failed to add item to cart. Please try again later.');
    }
  }

  /**
   * Get user's cart
   * @returns Promise with cart details
   */
  static async getCart(): Promise<Cart> {
    try {
      const response = await cartApi.getCart();
      const cart = response.data.cart;
      
      // Fetch product details for each cart item
      const { default: ProductService } = await import('./productService');
      
      const enrichedItems = await Promise.all(
        cart.items.map(async (item) => {
          try {
            console.log(`Fetching product details for ${item.product_id}...`);
            const product = await ProductService.getProductById(item.product_id);
            console.log(`Product details for ${item.product_id}:`, product);
            return {
              ...item,
              product
            };
          } catch (error) {
            console.error(`Failed to fetch product ${item.product_id}:`, error);
            // Return item without product details if fetch fails
            return item;
          }
        })
      );
      
      console.log('Enriched cart items:', enrichedItems);
      
      return {
        ...cart,
        items: enrichedItems
      };
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      throw new Error('Failed to fetch cart. Please try again later.');
    }
  }

  /**
   * Update item quantity in cart
   * @param productId - Product ID to update
   * @param quantity - New quantity
   * @returns Promise with updated cart
   */
  static async updateItemQuantity(productId: string, quantity: number): Promise<Cart> {
    try {
      console.log(`Updating cart item quantity: ${productId}, quantity: ${quantity}`);
      const response = await cartApi.updateItemQuantity(productId, quantity);
      console.log('Update item response:', response);
      
      // Dispatch cart updated event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Re-fetch the enriched cart to ensure product details are included
      return await this.getCart();
    } catch (error) {
      console.error('Failed to update cart item quantity:', error);
      throw new Error('Failed to update cart item quantity. Please try again later.');
    }
  }

  /**
   * Remove item from cart
   * @param productId - Product ID to remove
   * @returns Promise with updated cart
   */
  static async removeItem(productId: string): Promise<Cart> {
    try {
      console.log(`Removing item from cart: ${productId}`);
      const response = await cartApi.removeItem(productId);
      console.log('Remove item response:', response);
      
      // Dispatch cart updated event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Re-fetch the enriched cart to ensure product details are included
      return await this.getCart();
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw new Error('Failed to remove item from cart. Please try again later.');
    }
  }

  /**
   * Increment item quantity
   * @param productId - Product ID to increment
   * @returns Promise with updated cart
   */
  static async incrementItem(productId: string): Promise<Cart> {
    try {
      console.log(`Incrementing item quantity: ${productId}`);
      const response = await cartApi.incrementItem(productId);
      console.log('Increment item response:', response);
      
      // Dispatch cart updated event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Re-fetch the enriched cart to ensure product details are included
      return await this.getCart();
    } catch (error) {
      console.error('Failed to increment item quantity:', error);
      throw new Error('Failed to increment item quantity. Please try again later.');
    }
  }

  /**
   * Decrement item quantity
   * @param productId - Product ID to decrement
   * @returns Promise with updated cart
   */
  static async decrementItem(productId: string): Promise<Cart> {
    try {
      console.log(`Decrementing item quantity: ${productId}`);
      const response = await cartApi.decrementItem(productId);
      console.log('Decrement item response:', response);
      
      // Dispatch cart updated event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Re-fetch the enriched cart to ensure product details are included
      return await this.getCart();
    } catch (error) {
      console.error('Failed to decrement item quantity:', error);
      throw new Error('Failed to decrement item quantity. Please try again later.');
    }
  }

  /**
   * Get cart summary
   * @returns Promise with cart summary
   */
  static async getSummary(): Promise<CartSummaryResponse['data']> {
    try {
      const response = await cartApi.getSummary();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cart summary:', error);
      throw new Error('Failed to fetch cart summary. Please try again later.');
    }
  }

  /**
   * Get cart item count
   * @returns Promise with cart item count
   */
  static async getItemCount(): Promise<number> {
    try {
      const response = await cartApi.getCount();
      return response.data.item_count;
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
   * Check if cart is empty
   * @returns Promise with boolean indicating if cart is empty
   */
  static async isCartEmpty(): Promise<boolean> {
    try {
      const cart = await this.getCart();
      return cart.items.length === 0;
    } catch (error) {
      console.error('Failed to check if cart is empty:', error);
      return true;
    }
  }

  /**
   * Get cart total
   * @returns Promise with cart total
   */
  static async getCartTotal(): Promise<number> {
    try {
      const summary = await this.getSummary();
      return summary.total_price;
    } catch (error) {
      console.error('Failed to get cart total:', error);
      return 0;
    }
  }

  /**
   * Get cart discount amount
   * @returns Promise with cart discount amount
   */
  static async getCartDiscount(): Promise<number> {
    try {
      const summary = await this.getSummary();
      return summary.discount_amount;
    } catch (error) {
      console.error('Failed to get cart discount:', error);
      return 0;
    }
  }

  /**
   * Get cart discounted total
   * @returns Promise with cart discounted total
   */
  static async getCartDiscountedTotal(): Promise<number> {
    try {
      const summary = await this.getSummary();
      return summary.discounted_total;
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
   * Get cart items
   * @returns Promise with cart items
   */
  static async getCartItems(): Promise<CartItem[]> {
    try {
      const cart = await this.getCart();
      return cart.items;
    } catch (error) {
      console.error('Failed to get cart items:', error);
      return [];
    }
  }

  /**
   * Get specific cart item
   * @param productId - Product ID to find
   * @returns Promise with cart item or null
   */
  static async getCartItem(productId: string): Promise<CartItem | null> {
    try {
      const cart = await this.getCart();
      return cart.items.find(item => item.product_id === productId) || null;
    } catch (error) {
      console.error('Failed to get cart item:', error);
      return null;
    }
  }

  /**
   * Check if product is in cart
   * @param productId - Product ID to check
   * @returns Promise with boolean indicating if product is in cart
   */
  static async isProductInCart(productId: string): Promise<boolean> {
    try {
      const item = await this.getCartItem(productId);
      return item !== null;
    } catch (error) {
      console.error('Failed to check if product is in cart:', error);
      return false;
    }
  }

  /**
   * Get product quantity in cart
   * @param productId - Product ID to check
   * @returns Promise with product quantity or 0
   */
  static async getProductQuantity(productId: string): Promise<number> {
    try {
      const item = await this.getCartItem(productId);
      return item ? item.quantity : 0;
    } catch (error) {
      console.error('Failed to get product quantity in cart:', error);
      return 0;
    }
  }

  /**
   * Clear entire cart
   * @returns Promise with empty cart
   */
  static async clearCart(): Promise<Cart> {
    try {
      const cart = await this.getCart();
      
      // Remove all items one by one
      for (const item of cart.items) {
        await this.removeItem(item.product_id);
      }
      
      return await this.getCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw new Error('Failed to clear cart. Please try again later.');
    }
  }

  /**
   * Update multiple items at once
   * @param updates - Array of product ID and quantity updates
   * @returns Promise with updated cart
   */
  static async updateMultipleItems(updates: Array<{ productId: string; quantity: number }>): Promise<Cart> {
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
}

export default CartService; 