import { apiRequest } from './api';

export interface AdminOrder {
  id: string;
  user_id: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number | undefined;
  shipping_charges: number | undefined;
  discount_amount: number | undefined;
  created_at: string;
  updated_at: string;
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };
  items?: AdminOrderItem[];
  shipping_address?: string;
}

export interface AdminOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: {
    id: string;
    name: string;
    image_url?: string;
  };
}

export interface AdminOrderListResponse {
  orders: AdminOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface AdminOrderStats {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  total_revenue: number;
}

class AdminOrderService {
  async listOrders(page = 1, status?: string): Promise<AdminOrderListResponse> {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (status && status !== 'all') params.set('status', status);
    return apiRequest<AdminOrderListResponse>(`/admin/orders?${params.toString()}`);
  }

  async getOrderDetail(id: string): Promise<AdminOrder> {
    const res = await apiRequest<{ order: AdminOrder }>(`/admin/orders/${id}`);
    return res.order;
  }

  async updateOrderStatus(id: string, status: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async confirmOrder(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/admin/orders/${id}/confirm`, {
      method: 'POST',
    });
  }

  async getStats(): Promise<AdminOrderStats> {
    return apiRequest<AdminOrderStats>('/admin/orders/stats');
  }
}

export default new AdminOrderService();
