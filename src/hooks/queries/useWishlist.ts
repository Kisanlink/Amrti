import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import WishlistService from '../../services/wishlistService';

// Types for wishlist items
export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  user_id: string;
  product: any; // Product details
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  favorites: {
    favorites: WishlistItem[];
    total_count: number;
  };
  timestamp: string;
}

export interface WishlistCountResponse {
  success: boolean;
  message: string;
  count: number;
  timestamp: string;
}

// Hook to get wishlist items
export const useWishlist = () => {
  return useQuery({
    queryKey: queryKeys.wishlist.items,
    queryFn: async () => {
      try {
        const wishlist = await WishlistService.getWishlist();
        return wishlist;
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry for wishlist to avoid unnecessary calls
    refetchOnMount: false,
  });
};

// Hook to get wishlist count
export const useWishlistCount = () => {
  return useQuery({
    queryKey: queryKeys.wishlist.count,
    queryFn: async () => {
      try {
        const count = await WishlistService.getWishlistCount();
        return count;
      } catch (error) {
        console.error('Failed to fetch wishlist count:', error);
        return 0;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false,
    refetchOnMount: false,
  });
};

// Hook to check if a product is in wishlist
export const useIsInWishlist = (productId: string) => {
  return useQuery({
    queryKey: queryKeys.wishlist.check(productId),
    queryFn: async () => {
      try {
        const isInWishlist = await WishlistService.isInWishlist(productId);
        return isInWishlist;
      } catch (error) {
        console.error('Failed to check wishlist status:', error);
        return false;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false,
    refetchOnMount: false,
    enabled: !!productId, // Only run if productId is provided
  });
};

// Hook to add item to wishlist
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const result = await WishlistService.addToWishlist(productId);
      return result;
    },
    onSuccess: (data, productId) => {
      // Update wishlist items cache
      queryClient.setQueryData(queryKeys.wishlist.items, (oldData: WishlistItem[] = []) => {
        // Add the new item to the cache
        const newItem: WishlistItem = {
          id: `temp_${Date.now()}`,
          product_id: productId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: '',
          updated_by: '',
          user_id: '',
          product: null, // Will be populated on next fetch
        };
        return [...oldData, newItem];
      });

      // Update wishlist count cache
      queryClient.setQueryData(queryKeys.wishlist.count, (oldCount: number = 0) => oldCount + 1);

      // Update individual product check cache
      queryClient.setQueryData(queryKeys.wishlist.check(productId), true);

      // Invalidate and refetch wishlist data
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });

      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    },
    onError: (error) => {
      console.error('Failed to add to wishlist:', error);
    },
  });
};

// Hook to remove item from wishlist
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const result = await WishlistService.removeFromWishlist(productId);
      return result;
    },
    onSuccess: (data, productId) => {
      // Update wishlist items cache
      queryClient.setQueryData(queryKeys.wishlist.items, (oldData: WishlistItem[] = []) => {
        return oldData.filter(item => item.product_id !== productId);
      });

      // Update wishlist count cache
      queryClient.setQueryData(queryKeys.wishlist.count, (oldCount: number = 0) => Math.max(0, oldCount - 1));

      // Update individual product check cache
      queryClient.setQueryData(queryKeys.wishlist.check(productId), false);

      // Invalidate and refetch wishlist data
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });

      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    },
    onError: (error) => {
      console.error('Failed to remove from wishlist:', error);
    },
  });
};

// Hook to clear wishlist
export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await WishlistService.clearWishlist();
      return result;
    },
    onSuccess: () => {
      // Clear all wishlist caches
      queryClient.setQueryData(queryKeys.wishlist.items, []);
      queryClient.setQueryData(queryKeys.wishlist.count, 0);

      // Invalidate all wishlist queries
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });

      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    },
    onError: (error) => {
      console.error('Failed to clear wishlist:', error);
    },
  });
};

// Hook to toggle wishlist item (add if not present, remove if present)
export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, isInWishlist }: { productId: string; isInWishlist: boolean }) => {
      if (isInWishlist) {
        return await WishlistService.removeFromWishlist(productId);
      } else {
        return await WishlistService.addToWishlist(productId);
      }
    },
    onSuccess: (data, { productId, isInWishlist }) => {
      // Update wishlist items cache
      queryClient.setQueryData(queryKeys.wishlist.items, (oldData: WishlistItem[] = []) => {
        if (isInWishlist) {
          // Remove item
          return oldData.filter(item => item.product_id !== productId);
        } else {
          // Add item
          const newItem: WishlistItem = {
            id: `temp_${Date.now()}`,
            product_id: productId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: '',
            updated_by: '',
            user_id: '',
            product: null,
          };
          return [...oldData, newItem];
        }
      });

      // Update wishlist count cache
      queryClient.setQueryData(queryKeys.wishlist.count, (oldCount: number = 0) => {
        return isInWishlist ? Math.max(0, oldCount - 1) : oldCount + 1;
      });

      // Update individual product check cache
      queryClient.setQueryData(queryKeys.wishlist.check(productId), !isInWishlist);

      // Invalidate and refetch wishlist data
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });

      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    },
    onError: (error) => {
      console.error('Failed to toggle wishlist:', error);
    },
  });
};
