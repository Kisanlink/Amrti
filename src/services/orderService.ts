import { apiRequest } from './api';

export interface OrderItem {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number; // This is in rupees (decimal), not paisa
  total_price: number; // This is in rupees (decimal), not paisa
  product_name?: string;
  product_image?: string;
}

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  user_id: string;
  total_amount: number; // This is in rupees (decimal), not paisa
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed';
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
}

export interface OrderResponse {
  items: OrderItem[];
  order: Order & {
    items?: OrderItem[];
  };
}

export interface OrdersResponse {
  orders: Order[];
  message: string;
  success: boolean;
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
      return response.orders;
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
      case 'cancelled':
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
