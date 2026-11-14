import { apiRequest, getHeaders } from './api';
import { API_BASE_PATH } from '../config/apiConfig';

export interface OrderItem {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number; // This is in rupees (decimal), not paisa
  total_price: number; // This is in rupees (decimal), not paisa
  product_name?: string;
  product_image?: string;
  image_url?: string; // From API response
  product?: {
    name: string;
    image_url: string;
    image_urls?: string[];
    description?: string;
  };
}

export interface Order {
  id: string;
  order_id?: string; // Alternative ID field
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  user_id: string;
  total_amount: number; // This is in rupees (decimal), not paisa
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'confirmed';
  shipping_address: string;
  shipping_address_normalized?: {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'successful' | 'paid';
  // Fulfillment pipeline state. "needs_manual_fulfillment" = paid but no deliverable
  // address was available, so the customer may supply one (PAY-06 self-entry).
  fulfillment_status?: '' | 'pending_shipment' | 'shipment_failed' | 'needs_manual_fulfillment' | 'fulfilled' | string;
  shipment_error?: string;
  notes: string;
  razorpay_order_id: string;
  razorpay_receipt: string;
  razorpay_amount_paisa: number;
  razorpay_notes_json: string;
  shipping_carrier: string;
  shipping_mode: string;
  shipping_charge: number; // This is in rupees (decimal), not paisa
  eta_min_days: number;
  eta_max_days: number;
  delhivery_waybill: string;
  delhivery_status: string;
  tracking_url: string;
  invoice_url: string;
  item_count?: number;
  items?: OrderItem[];
  order_items?: OrderItem[];
  customer?: {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
  };
  subtotal?: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  grand_total?: number;
}

export interface OrderResponse {
  order: Order;
  items?: OrderItem[];
}

export interface OrdersResponse {
  orders: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
  message?: string;
  success?: boolean;
}

// Body for POST /orders/:id/shipping-address (customer self-entry of a missing
// delivery address). address_line_1, city, state and postal_code are required.
export interface ShippingAddressPayload {
  name?: string;
  phone?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
}

// Typed result of submitShippingAddress so callers can branch on the HTTP status
// (200 saved / shipment created, 409 no longer eligible, 400 validation) and show
// the backend's own message rather than a generic error.
export interface SubmitShippingAddressResult {
  status: number;
  success: boolean;
  message: string;
  error?: string;
  order_id?: string;
  fulfillment_status?: string;
  waybill?: string;
  tracking_url?: string;
}

export const orderApi = {
  // Get order by ID
  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    console.log('Making API call to:', `/orders/${orderId}`);
    return apiRequest<OrderResponse>(`/orders/${orderId}`);
  },

  // Get user's orders
  getUserOrders: async (): Promise<OrdersResponse> => {
    return apiRequest<OrdersResponse>('/orders');
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  },
};

export class OrderService {
  /**
   * Get order by ID
   * @param orderId - Order ID to fetch
   * @returns Promise with order details
   */
  static async getOrderById(orderId: string): Promise<OrderResponse> {
    try {
      const response = await orderApi.getOrderById(orderId);
      return response;
    } catch (error) {
      console.error('Failed to fetch order:', error);
      throw new Error('Failed to fetch order details. Please try again later.');
    }
  }

  /**
   * Get user's orders
   * @returns Promise with user's orders
   */
  static async getUserOrders(): Promise<Order[]> {
    try {
      const response = await orderApi.getUserOrders();
      return response.orders || [];
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
      throw new Error('Failed to fetch orders. Please try again later.');
    }
  }

  /**
   * Cancel order
   * @param orderId - Order ID to cancel
   * @returns Promise with cancellation result
   */
  static async cancelOrder(orderId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await orderApi.cancelOrder(orderId);
      return response;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      throw new Error('Failed to cancel order. Please try again later.');
    }
  }

  /**
   * Submit (or correct) the shipping address for a paid order that is stuck
   * awaiting a deliverable destination (needs_manual_fulfillment). Posts to the
   * authenticated owner-only endpoint and returns a typed result so callers can
   * branch on 200 / 409 / 400 instead of the generic apiRequest error path, which
   * discards the status code and the backend's `error` text.
   * @param orderId - ID of the order whose address is being supplied
   * @param payload - The shipping address fields
   * @returns Promise with the typed submission result
   */
  static async submitShippingAddress(
    orderId: string,
    payload: ShippingAddressPayload
  ): Promise<SubmitShippingAddressResult> {
    const url = `${API_BASE_PATH}/orders/${encodeURIComponent(orderId)}/shipping-address`;
    const headers = await getHeaders();
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const body: any = await response.json().catch(() => ({}));
    return {
      status: response.status,
      success: response.ok && body?.success !== false,
      message:
        body?.message ||
        body?.error ||
        (response.ok ? 'Shipping address saved' : `Request failed (status ${response.status})`),
      error: response.ok ? undefined : body?.error || body?.message,
      order_id: body?.order_id,
      fulfillment_status: body?.fulfillment_status,
      waybill: body?.waybill,
      tracking_url: body?.tracking_url,
    };
  }

  /**
   * True when an order is paid but could not be shipped because no deliverable
   * address was available, so it can accept a customer-entered shipping address.
   * Mirrors the backend eligibility guard: paid, not yet shipped (no waybill), no
   * courier shipment already created, and fulfillment_status === needs_manual_fulfillment.
   * @param order - The order to check
   * @returns true if the self-entry address form should be shown
   */
  static needsShippingAddress(order?: Order | null): boolean {
    if (!order) return false;
    const paid = order.payment_status === 'paid' || order.payment_status === 'successful';
    const noWaybill = !order.delhivery_waybill || order.delhivery_waybill.trim() === '';
    const atCourier = (order.shipment_error || '')
      .toLowerCase()
      .includes('shipment created at courier');
    return paid && noWaybill && !atCourier && order.fulfillment_status === 'needs_manual_fulfillment';
  }

  /**
   * Format order status for display
   * @param status - Order status
   * @returns Formatted status string
   */
  static formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  /**
   * Get status color for UI
   * @param status - Order status
   * @returns Tailwind CSS color classes
   */
  static getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get payment status color for UI
   * @param status - Payment status
   * @returns Tailwind CSS color classes
   */
  static getPaymentStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'successful':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Format price for display
   * @param price - Price in rupees (decimal)
   * @returns Formatted price string
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  }

  /**
   * Format date for display
   * @param dateString - ISO date string
   * @returns Formatted date string
   */
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export default OrderService;
