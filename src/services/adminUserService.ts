import { apiRequest } from './api';

export interface AdminUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

class AdminUserService {
  async listUsers(page = 1): Promise<AdminUserListResponse> {
    return apiRequest<AdminUserListResponse>(`/admin/users?page=${page}&limit=20`);
  }

  async getUserDetail(id: string): Promise<AdminUser> {
    return apiRequest<AdminUser>(`/admin/users/${id}`);
  }
}

export default new AdminUserService();
