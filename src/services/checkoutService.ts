import { apiRequest } from './api';
import type { RazorpayResponse } from '../types/razorpay';

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
    
    console.log('Estimating shipping with payload:', payload); // Debug log
    
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
    
    console.log('Creating order with payload:', payload); // Debug log
      
      try {
        const response = await apiRequest<CreateOrderResponse>('/payments/create-order', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      console.log('Order created successfully:', response);
        return response;
      } catch (error: any) {
      console.error('Failed to create order:', error);
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
    
    // Use the same API base URL as apiRequest
    const API_BASE_URL = 'http://localhost:8082';
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
      // For guest checkout, use session ID
      const sessionId = localStorage.getItem('sessionId') || sessionStorage.getItem('sessionId');
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      } else {
        throw new Error('Please login or provide session ID for guest checkout');
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v1/payments/magic-checkout/create-order`, {
      method: 'POST',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create order' }));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    return response.json();
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
