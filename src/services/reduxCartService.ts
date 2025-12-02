import { store } from '../store';
import { 
  loadCart,
  addToCart,
  updateItemQuantity,
  removeItem,
  incrementItem,
  decrementItem,
  clearCart,
  migrateGuestCart
} from '../store/slices/cartSlice';
import CartService from './cartService';
import type { Cart, CartItem } from './api';
import type { GuestCart, GuestCartItem } from './guestCartService';

// Redux-aware CartService wrapper
export class ReduxCartService {
  /**
   * Load cart using Redux
   */
  static async loadCart() {
    try {
      const result = await store.dispatch(loadCart());
      return result.payload;
    } catch (error) {
      console.error('Redux load cart failed:', error);
      throw error;
    }
  }

  /**
   * Add item to cart using Redux
   */
  static async addItem(productId: string, quantity: number) {
    try {
      const result = await store.dispatch(addToCart({ productId, quantity }));
      return result.payload;
    } catch (error) {
      console.error('Redux add to cart failed:', error);
      throw error;
    }
  }

  /**
   * Update item quantity using Redux
   */
  static async updateItemQuantity(productId: string, quantity: number) {
    try {
      const result = await store.dispatch(updateItemQuantity({ productId, quantity }));
      return result.payload;
    } catch (error) {
      console.error('Redux update item quantity failed:', error);
      throw error;
    }
  }

  /**
   * Remove item from cart using Redux
   */
  static async removeItem(productId: string) {
    try {
      const result = await store.dispatch(removeItem(productId));
      return result.payload;
    } catch (error) {
      console.error('Redux remove item failed:', error);
      throw error;
    }
  }

  /**
   * Increment item quantity using Redux
   */
  static async incrementItem(productId: string) {
    try {
      const result = await store.dispatch(incrementItem(productId));
      return result.payload;
    } catch (error) {
      console.error('Redux increment item failed:', error);
      throw error;
    }
  }

  /**
   * Decrement item quantity using Redux
   */
  static async decrementItem(productId: string) {
    try {
      const result = await store.dispatch(decrementItem(productId));
      return result.payload;
    } catch (error) {
      console.error('Redux decrement item failed:', error);
      throw error;
    }
  }

  /**
   * Clear cart using Redux
   */
  static async clearCart() {
    try {
      const result = await store.dispatch(clearCart());
      return result.payload;
    } catch (error) {
      console.error('Redux clear cart failed:', error);
      throw error;
    }
  }

  /**
   * Migrate guest cart using Redux
   */
  static async migrateGuestCart() {
    try {
      const result = await store.dispatch(migrateGuestCart());
      return result.payload;
    } catch (error) {
      console.error('Redux migrate guest cart failed:', error);
      throw error;
    }
  }

  /**
   * Get cart from Redux store
   */
  static getCart() {
    const state = store.getState();
    return state.cart;
  }

  /**
   * Get cart items from Redux store
   */
  static getCartItems() {
    const state = store.getState();
    return state.cart.items;
  }

  /**
   * Get cart total from Redux store
   */
  static getCartTotal() {
    const state = store.getState();
    return state.cart.totalPrice;
  }

  /**
   * Get cart item count from Redux store
   */
  static getCartItemCount() {
    const state = store.getState();
    return state.cart.totalItems;
  }

  /**
   * Check if cart is empty from Redux store
   */
  static isCartEmpty() {
    const state = store.getState();
    return state.cart.isEmpty;
  }

  /**
   * Check if product is in cart from Redux store
   */
  static isProductInCart(productId: string) {
    const state = store.getState();
    return state.cart.items.some(item => item.product_id === productId);
  }

  /**
   * Get product quantity in cart from Redux store
   */
  static getProductQuantity(productId: string) {
    const state = store.getState();
    const item = state.cart.items.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Check if cart is in guest mode from Redux store
   */
  static isGuestCart() {
    const state = store.getState();
    return state.cart.isGuestCart;
  }

  /**
   * Get cart session ID from Redux store
   */
  static getSessionId() {
    const state = store.getState();
    return state.cart.sessionId;
  }

  /**
   * Get cart loading state from Redux store
   */
  static isLoading() {
    const state = store.getState();
    return state.cart.isLoading;
  }

  /**
   * Get cart error from Redux store
   */
  static getError() {
    const state = store.getState();
    return state.cart.error;
  }

  /**
   * Clear cart error
   */
  static clearError() {
    store.dispatch({ type: 'cart/clearError' });
  }

  /**
   * Set guest mode
   */
  static setGuestMode() {
    store.dispatch({ type: 'cart/setGuestMode' });
  }

  /**
   * Set authenticated mode
   */
  static setAuthenticatedMode() {
    store.dispatch({ type: 'cart/setAuthenticatedMode' });
  }

  /**
   * Clear cart state
   */
  static clearCartState() {
    store.dispatch({ type: 'cart/clearCartState' });
  }

  /**
   * Get cart summary from Redux store
   */
  static getCartSummary() {
    const state = store.getState();
    return {
      totalItems: state.cart.totalItems,
      totalPrice: state.cart.totalPrice,
      discountAmount: state.cart.discountAmount,
      discountedTotal: state.cart.discountedTotal,
      isEmpty: state.cart.isEmpty,
      lastUpdated: state.cart.lastUpdated,
    };
  }

  /**
   * Get cart discount amount from Redux store
   */
  static getCartDiscount() {
    const state = store.getState();
    return state.cart.discountAmount;
  }

  /**
   * Get cart discounted total from Redux store
   */
  static getCartDiscountedTotal() {
    const state = store.getState();
    return state.cart.discountedTotal;
  }

  /**
   * Check if cart has expired (for guest carts)
   */
  static isCartExpired() {
    const state = store.getState();
    if (!state.cart.lastUpdated) return false;
    
    const lastUpdated = new Date(state.cart.lastUpdated);
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);
    
    // Guest cart expires after 30 minutes of inactivity
    return diffInMinutes > 30;
  }

  /**
   * Format price utility
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  }

  /**
   * Calculate total price utility
   */
  static calculateTotalPrice(items: (CartItem | GuestCartItem)[]): number {
    return items.reduce((total, item) => total + item.total_price, 0);
  }

  /**
   * Calculate total items utility
   */
  static calculateTotalItems(items: (CartItem | GuestCartItem)[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Check if cart has items utility
   */
  static hasItems(items: (CartItem | GuestCartItem)[]): boolean {
    return items.length > 0;
  }

  /**
   * Get item by product ID utility
   */
  static getItemByProductId(items: (CartItem | GuestCartItem)[], productId: string): (CartItem | GuestCartItem) | undefined {
    return items.find(item => item.product_id === productId);
  }

  /**
   * Validate quantity utility
   */
  static validateQuantity(quantity: number): boolean {
    return quantity > 0 && quantity <= 99;
  }

  /**
   * Get item subtotal utility
   */
  static getItemSubtotal(price: number, quantity: number): number {
    return price * quantity;
  }
}

export default ReduxCartService;




