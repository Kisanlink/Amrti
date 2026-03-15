import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import InventoryService from '../../services/inventoryService';
import { useNotification } from '../../context/NotificationContext';

export const useAdminInventoryList = (page = 1, perPage = 20) => {
  return useQuery({
    queryKey: queryKeys.adminInventory.list(page, perPage),
    queryFn: () => InventoryService.listInventory(page, perPage),
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useInventoryByProduct = (productId: string) => {
  return useQuery({
    queryKey: queryKeys.adminInventory.byProduct(productId),
    queryFn: () => InventoryService.getByProduct(productId),
    enabled: !!productId,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useLowStockInventory = () => {
  return useQuery({
    queryKey: queryKeys.adminInventory.lowStock,
    queryFn: () => InventoryService.getLowStock(),
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useOutOfStockInventory = () => {
  return useQuery({
    queryKey: queryKeys.adminInventory.outOfStock,
    queryFn: () => InventoryService.getOutOfStock(),
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: ({ productId, newStock }: { productId: string; newStock: number }) =>
      InventoryService.updateStock(productId, newStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      showNotification({ type: 'success', message: 'Stock updated successfully!' });
    },
    onError: (error: any) => {
      showNotification({ type: 'error', message: error.message || 'Failed to update stock' });
    },
  });
};

export const useRestock = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      InventoryService.restock(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      showNotification({ type: 'success', message: 'Stock restocked successfully!' });
    },
    onError: (error: any) => {
      showNotification({ type: 'error', message: error.message || 'Failed to restock' });
    },
  });
};
