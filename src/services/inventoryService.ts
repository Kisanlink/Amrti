import { apiRequest } from './api';

export interface InventoryItem {
  id: string;
  product_id: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  stock_status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Discontinued';
  last_restocked_at: string | null;
  last_sold_at: string | null;
  updated_by: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
    category?: string;
  };
}

export interface InventoryListResponse {
  inventory: InventoryItem[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    has_more: boolean;
  };
}

interface LowStockResponse {
  items: InventoryItem[];
  count: number;
}

class InventoryService {
  async listInventory(page = 1, perPage = 20): Promise<InventoryListResponse> {
    return apiRequest<InventoryListResponse>(
      `/admin/inventory?page=${page}&per_page=${perPage}`
    );
  }

  async getByProduct(productId: string): Promise<InventoryItem> {
    return apiRequest<InventoryItem>(`/admin/inventory/product/${productId}`);
  }

  async updateStock(productId: string, newStock: number): Promise<InventoryItem> {
    return apiRequest<InventoryItem>(`/admin/inventory/stock/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ new_stock: newStock }),
    });
  }

  async restock(productId: string, quantity: number): Promise<InventoryItem> {
    return apiRequest<InventoryItem>(`/admin/inventory/restock/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
  }

  async getLowStock(): Promise<InventoryItem[]> {
    const res = await apiRequest<LowStockResponse>('/admin/inventory/low-stock');
    return res.items;
  }

  async getOutOfStock(): Promise<InventoryItem[]> {
    const res = await apiRequest<LowStockResponse>('/admin/inventory/out-of-stock');
    return res.items;
  }
}

export default new InventoryService();
