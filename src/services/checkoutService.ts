import { apiRequest } from './api';
import type { RazorpayResponse } from '../types/razorpay';
import { buildApiUrl } from '../config/apiConfig';

// ==================== CHECKOUT INTERFACES ====================

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  mobile: string;
  mobile_secondary: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface ShippingOption {
  carrier: string;
  cost: number;
  currency: string;
  delivery_days_max: number;
  delivery_days_min: number;
  description: string;
  method: string;
  service_level: string;
}

export interface ValidationIssue {
  action: string;
  issue: string;
  new_price?: number;
  old_price?: number;
  product_id: string;
}

export interface CheckoutPrepareResponse {
  data: {
    cart: {
      id: string;
      created_at: string;
      updated_at: string;
      created_by: string;
      updated_by: string;
      user_id: string;
      total_items: number;
      total_price: number;
      discount_amount: number;
      items: Array<{
        id: string;
        created_at: string;
        updated_at: string;
        created_by: string;
        updated_by: string;
        cart_id: string;
        product_id: string;
        quantity: number;
        unit_price: number;
        total_price: number;
      }>;
    };
    cart_updated: boolean;
    validation_issues: ValidationIssue[];
  };
  message: string;
  success: boolean;
}

export interface ShippingEstimateResponse {
  data: {
    address_id: string;
    shipping_options: ShippingOption[];
    subtotal: number;
    user_id: string;
  };
  message: string;
  success: boolean;
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  description: string;
  notes: {
    address: string;
    cart_total: number;
    coupon?: string;
    currency: string;
    customer_info: string;
    discount: number;
    final_amount: number;
    free_delivery: boolean;
    items_count: number;
    shipping: number;
    shipping_addr_id: string;
    user_id: string;
  };
  checkout_url: string;
}

export interface MagicCheckoutOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  receipt: string;
  has_saved_address: boolean;
  saved_address?: string;
}

export interface PaymentVerificationRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  payment_id: string;
  order_id: string;
}

// ==================== CHECKOUT API ====================

export const checkoutApi = {
  // Prepare checkout data
  prepareCheckout: async (): Promise<CheckoutPrepareResponse> => {
    return apiRequest<CheckoutPrepareResponse>('/cart/checkout/prepare');
  },

  // Estimate shipping
  estimateShipping: async (address: ShippingAddress): Promise<ShippingEstimateResponse> => {
    const payload = {
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country
      }
    };
    
    return apiRequest<ShippingEstimateResponse>('/cart/checkout/estimate-shipping', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Create payment order
  createOrder: async (shippingAddress: ShippingAddress, addressId: string): Promise<CreateOrderResponse> => {
    // Use the correct payload format with address_id
    const payload = {
      first_name: shippingAddress.first_name,
      last_name: shippingAddress.last_name,
      mobile: shippingAddress.mobile,
      shipping_address_id: addressId
    };
      
      try {
        const response = await apiRequest<CreateOrderResponse>('/payments/create-order', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        return response;
      } catch (error: any) {
          throw error;
    }
  },

  // Verify payment
  verifyPayment: async (verificationData: PaymentVerificationRequest): Promise<PaymentVerificationResponse> => {
    return apiRequest<PaymentVerificationResponse>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  },

  // Create Magic Checkout order
  createMagicCheckoutOrder: async (): Promise<MagicCheckoutOrderResponse> => {
    // Get session ID for guest checkout if not authenticated
    const { default: AuthService } = await import('./authService');
    const isAuthenticated = AuthService.isAuthenticated();
    
    // CRITICAL: Ensure cart consistency before checkout
    // This ensures we're using the same cart that was used when adding items
    const { default: CartService } = await import('./cartService');
    const { GuestCartService } = await import('./guestCartService');
    
    // Step 1: Check if there's a guest cart that needs migration (if user is authenticated)
    if (isAuthenticated) {
      const guestSessionId = GuestCartService.getCurrentSessionId();
      if (guestSessionId) {
        try {
          const guestCart = await GuestCartService.getCart();
          const guestItems = guestCart?.items || [];
          const guestTotalItems = guestCart?.total_items || (guestCart as any)?.items_count || 0;
          
          // If guest cart has items, migrate it first
          if (guestTotalItems > 0 && guestItems.length > 0) {
            console.log('Guest cart has items before checkout, migrating...', {
              guestItemsCount: guestItems.length,
              guestTotalItems,
              items: guestItems.map((item: any) => ({ product_id: item.product_id, quantity: item.quantity }))
            });
            
            try {
              const migratedCart = await CartService.migrateGuestCart();
              if (migratedCart) {
                // Wait a moment for backend to process migration
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            } catch (migrationError) {
              // Continue anyway - the getCart() method will also try to migrate
            }
          }
        } catch (guestError) {
          // No guest cart to migrate
        }
      }
    }
    
    // Step 2: Get the cart using CartService.getCart() which handles migration automatically
    // This ensures we always get the correct cart (authenticated or guest)
    let verifiedCart: any = null;
    let cartVerified = false;
    
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        // Use CartService.getCart() which handles migration and consistency
        verifiedCart = await CartService.getCart();
        const totalItems = verifiedCart?.total_items || (verifiedCart as any)?.items_count || 0;
        const items = verifiedCart?.items || [];
        
        if (verifiedCart && totalItems > 0 && items.length > 0) {
          cartVerified = true;
          break;
        } else {
          // If this is the last attempt and cart is still empty, throw error
          if (attempt === 4) {
            throw new Error('Cart is empty. Please add items to cart.');
          }
        }
      } catch (error: any) {
        // If it's the last attempt, throw the error
        if (attempt === 4) {
          if (error.message && (error.message.includes('empty') || error.message.includes('Cart is empty'))) {
            throw new Error('Cart is empty. Please add items to cart.');
          }
          throw error;
        }
      }
      
      // Wait before next retry (only if not last attempt)
      if (attempt < 4) {
        await new Promise(resolve => setTimeout(resolve, 300 + (attempt * 100)));
      }
    }
    
    if (!cartVerified || !verifiedCart) {
      throw new Error('Cart is empty. Please add items to cart.');
    }
    
    // Final check: Ensure we have valid cart data before proceeding
    const finalTotalItems = verifiedCart?.total_items || (verifiedCart as any)?.items_count || 0;
    const finalItems = verifiedCart?.items || [];
    if (finalTotalItems === 0 || finalItems.length === 0) {
      throw new Error('Cart is empty. Please add items to cart.');
    }
    
    // CRITICAL: Validate cart on server one more time RIGHT before API call
    // This ensures the server has the cart at the exact moment we make the request
    try {
      const { cartApi } = await import('./api');
      
      // Call the cart validation endpoint to ensure server has the cart
      const validationResponse = await cartApi.validate();
      
      if (!validationResponse.success) {
        throw new Error('Server cart validation failed. Cart may be empty on server.');
      }
      
      // Also do a direct cart fetch to ensure server has items
      const serverCart = await CartService.getCart();
      const serverTotalItems = serverCart?.total_items || (serverCart as any)?.items_count || 0;
      const serverItems = serverCart?.items || [];
      
      if (serverTotalItems === 0 || serverItems.length === 0) {
        throw new Error('Cart is empty on server. Please refresh the page and try again.');
      }
      
      const serverCartId = serverCart.id || (serverCart as any)?.cart_id || (serverCart as any)?.cartId;
      
      // CRITICAL: Verify cart IDs match (if both are available)
      // This ensures we're using the same cart that was verified
      if (verifiedCart && serverCart) {
        const verifiedCartId = verifiedCart.id || (verifiedCart as any)?.cart_id || (verifiedCart as any)?.cartId;
        if (verifiedCartId && serverCartId && verifiedCartId !== serverCartId) {
          // This might indicate a cart migration happened - use the server cart
          verifiedCart = serverCart;
        }
      }
    } catch (validationError: any) {
      if (validationError.message && validationError.message.includes('empty')) {
        throw new Error('Cart is empty on server. Please refresh the page, add items to cart, and try again.');
      }
      throw validationError;
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (isAuthenticated) {
      const token = await AuthService.getIdToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error('Authentication token not available. Please login again.');
      }
    } else {
      // For guest checkout, use session ID from guest cart service
      const { GuestCartService } = await import('./guestCartService');
      const sessionId = GuestCartService.getCurrentSessionId();
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      } else {
        throw new Error('Please login or provide session ID for guest checkout');
      }
    }
    
    // CRITICAL: Make a direct cart API call RIGHT before create-order to ensure server has cart in session
    // This is the final check - if cart is empty here, it's definitely empty on server
    // Use raw cartApi.getCart() for speed (no product enrichment)
    try {
      const { cartApi } = await import('./api');
      const cartResponse = await cartApi.getCart();
      const finalServerCart = cartResponse.data.cart;
      const finalServerItems = finalServerCart?.items || [];
      const finalServerTotal = finalServerCart?.total_items || (finalServerCart as any)?.items_count || 0;
      
      if (finalServerTotal === 0 || finalServerItems.length === 0) {
        throw new Error('Cart is empty on server. The items may not have been saved. Please add items to cart again and try checkout.');
      }
    } catch (cartError: any) {
      if (cartError.message && cartError.message.includes('empty')) {
        throw cartError; // Re-throw the error with the message about clearing cache
      }
      throw new Error('Cart verification failed. Please refresh the page and try again.');
    }
    
    // Small delay to ensure server has processed any cart updates
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const response = await fetch(buildApiUrl('/payments/magic-checkout/create-order'), {
      method: 'POST',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create order' }));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      
      // Provide more helpful error message for empty cart
      if (errorMessage.includes('empty') || errorMessage.includes('Cart is empty')) {
        throw new Error('Cart is empty on the server. This may happen if cart migration is still in progress. Please wait a moment, refresh the page, and try again.');
      }
      
      throw new Error(errorMessage);
    }
    
    const orderData = await response.json();
    return orderData;
  },
};

// ==================== CHECKOUT SERVICE ====================

export class CheckoutService {
  /**
   * Prepare checkout data
   */
  static async prepareCheckout(): Promise<CheckoutPrepareResponse['data']> {
    try {
      const response = await checkoutApi.prepareCheckout();
      return response.data;
    } catch (error) {
      console.error('Failed to prepare checkout:', error);
      throw new Error('Failed to prepare checkout. Please try again later.');
    }
  }

  /**
   * Estimate shipping costs
   */
  static async estimateShipping(address: ShippingAddress): Promise<ShippingEstimateResponse['data']> {
    try {
      const response = await checkoutApi.estimateShipping(address);
      return response.data;
    } catch (error) {
      console.error('Failed to estimate shipping:', error);
      throw new Error('Failed to estimate shipping. Please try again later.');
    }
  }

  /**
   * Create payment order
   */
  static async createOrder(shippingAddress: ShippingAddress, addressId: string): Promise<CreateOrderResponse> {
    try {
      console.log('CheckoutService.createOrder called with address:', shippingAddress, 'and addressId:', addressId); // Debug log
      const response = await checkoutApi.createOrder(shippingAddress, addressId);
      console.log('Order created successfully:', response); // Debug log
      return response;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw new Error('Failed to create order. Please try again later.');
    }
  }

  /**
   * Verify payment
   */
  static async verifyPayment(verificationData: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    try {
      const response = await checkoutApi.verifyPayment(verificationData);
      return response;
    } catch (error) {
      console.error('Failed to verify payment:', error);
      throw new Error('Failed to verify payment. Please try again later.');
    }
  }

  /**
   * Initialize Razorpay checkout
   */
  static initializeRazorpayCheckout(orderData: CreateOrderResponse): Promise<RazorpayResponse> {
    return new Promise((resolve, reject) => {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => this.openRazorpayCheckout(orderData, resolve, reject);
        script.onerror = () => reject(new Error('Failed to load Razorpay script'));
        document.head.appendChild(script);
      } else {
        this.openRazorpayCheckout(orderData, resolve, reject);
      }
    });
  }

  /**
   * Open Razorpay checkout modal
   */
  private static openRazorpayCheckout(
    orderData: CreateOrderResponse, 
    resolve: (value: any) => void, 
    reject: (reason: any) => void
  ) {
    const options = {
      key: orderData.key_id,
      order_id: orderData.order_id,
      amount: Math.round(orderData.amount * 100), // Convert to paise
      currency: orderData.currency,
      description: orderData.description,
      handler: function(response: any) {
        resolve(response);
      },
      modal: {
        ondismiss: function() {
          reject(new Error('Checkout was dismissed'));
        }
      },
      theme: {
        color: '#10B981' // Green color matching your app theme
      },
      prefill: {
        // You can prefill customer details here
      }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      reject(new Error('Failed to open Razorpay checkout'));
    }
  }
}

export default CheckoutService;
