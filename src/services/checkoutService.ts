import { apiRequest } from './api';
import type { RazorpayResponse } from '../types/razorpay';

// ==================== CHECKOUT INTERFACES ====================

export interface ShippingAddress {
  first_name: string;
  mobile: string;
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
    validation_issues: string[];
  };
  message: string;
  success: boolean;
}

export interface ShippingEstimateResponse {
  data: {
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
    cart_items_count: number;
    cart_total: number;
    currency: string;
    shipping_address: string;
    shipping_address_id: string;
    shipping_charges: number;
    subtotal: number;
    user_id: string;
  };
  checkout_url: string;
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
    return apiRequest<ShippingEstimateResponse>('/cart/checkout/estimate-shipping', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  },

  // Create payment order
  createOrder: async (shippingAddress: ShippingAddress): Promise<CreateOrderResponse> => {
    // Try multiple payload formats to find the correct one
    const payloads = [
      // Format 1: With required first_name and mobile fields
      {
        first_name: shippingAddress.first_name,
        mobile: shippingAddress.mobile,
        shipping_address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.postal_code}, ${shippingAddress.country}`
      },
      // Format 2: Structured address object with required fields
      {
        first_name: shippingAddress.first_name,
        mobile: shippingAddress.mobile,
        shipping_address: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postal_code,
          country: shippingAddress.country
        }
      },
      // Format 3: Flat structure with required fields
      {
        first_name: shippingAddress.first_name,
        mobile: shippingAddress.mobile,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postal_code,
        country: shippingAddress.country
      },
      // Format 4: Address field with required fields
      {
        first_name: shippingAddress.first_name,
        mobile: shippingAddress.mobile,
        address: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postal_code,
          country: shippingAddress.country
        }
      },
      // Format 5: With additional required fields
      {
        first_name: shippingAddress.first_name,
        mobile: shippingAddress.mobile,
        shipping_address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.postal_code}, ${shippingAddress.country}`,
        user_id: "current_user", // Placeholder
        cart_id: "current_cart" // Placeholder
      },
      // Format 6: Minimal required fields
      {
        first_name: shippingAddress.first_name,
        mobile: shippingAddress.mobile,
        address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.postal_code}, ${shippingAddress.country}`
      }
    ];
    
    console.log('Shipping address object:', shippingAddress); // Debug log
    
    // Try each payload format until one works
    for (let i = 0; i < payloads.length; i++) {
      const payload = payloads[i];
      console.log(`Trying payload format ${i + 1}:`, payload);
      
      try {
        const response = await apiRequest<CreateOrderResponse>('/payments/create-order', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        console.log(`Payload format ${i + 1} succeeded!`);
        return response;
      } catch (error: any) {
        console.log(`Payload format ${i + 1} failed:`, error.message);
        console.log(`Full error object:`, error);
        
        // Try to extract more error details
        if (error.message && error.message.includes('Invalid request data')) {
          console.log(`API rejected payload format ${i + 1} as invalid`);
        }
        
        if (i === payloads.length - 1) {
          // Last attempt failed, throw the error
          console.error('All payload formats failed. Last error:', error);
          throw error;
        }
      }
    }
    
    throw new Error('All payload formats failed');
  },

  // Verify payment
  verifyPayment: async (verificationData: PaymentVerificationRequest): Promise<PaymentVerificationResponse> => {
    return apiRequest<PaymentVerificationResponse>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
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
  static async createOrder(shippingAddress: ShippingAddress): Promise<CreateOrderResponse> {
    try {
      console.log('CheckoutService.createOrder called with address:', shippingAddress); // Debug log
      const response = await checkoutApi.createOrder(shippingAddress);
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
