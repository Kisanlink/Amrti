import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import AdminUserService from '../../services/adminUserService';

export const useAdminUserList = (page = 1) => {
  return useQuery({
    queryKey: queryKeys.adminUsers.list(page),
    queryFn: () => AdminUserService.listUsers(page),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useAdminUserDetail = (id: string) => {
  return useQuery({
    queryKey: ['adminUsers', 'detail', id],
    queryFn: () => AdminUserService.getUserDetail(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};
