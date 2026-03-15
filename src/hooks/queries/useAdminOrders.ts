import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import AdminOrderService from '../../services/adminOrderService';
import { useNotification } from '../../context/NotificationContext';

export const useAdminOrderList = (page = 1, status?: string) => {
  return useQuery({
    queryKey: queryKeys.adminOrders.list(page, status),
    queryFn: () => AdminOrderService.listOrders(page, status),
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useAdminOrderDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.adminOrders.detail(id),
    queryFn: () => AdminOrderService.getOrderDetail(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useAdminOrderStats = () => {
  return useQuery({
    queryKey: queryKeys.adminOrders.stats,
    queryFn: () => AdminOrderService.getStats(),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useConfirmOrder = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (id: string) => AdminOrderService.confirmOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInventory.all });
      showNotification({ type: 'success', message: 'Order confirmed and inventory updated!' });
    },
    onError: (error: any) => {
      showNotification({ type: 'error', message: error.message || 'Failed to confirm order' });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      AdminOrderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders.all });
      showNotification({ type: 'success', message: 'Order status updated!' });
    },
    onError: (error: any) => {
      showNotification({ type: 'error', message: error.message || 'Failed to update order status' });
    },
  });
};
