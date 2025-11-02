import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryKeys } from '../../lib/queryClient';
import WishlistService from '../../services/wishlistService';
import { useAppDispatch, useAppSelector } from '../../store';
import { setWishlistCount, resetCounters } from '../../store/slices/counterSlice';

// Types for wishlist items
export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  user_id: string;
  product?: any;
}

// Hook to get wishlist items - general use
export const useWishlist = () => {
  const dispatch = useAppDispatch();
  
  return useQuery({
    queryKey: queryKeys.wishlist.items,
    queryFn: async () => {
      console.log('useWishlist: Fetching wishlist from API...');
      const wishlist = await WishlistService.getWishlist();
      console.log('useWishlist: Wishlist fetched:', wishlist);
      // Sync Redux count IMMEDIATELY
      dispatch(setWishlistCount(wishlist.length));
      return wishlist;
    },
    staleTime: 30 * 1000,
    retry: false,
    refetchOnMount: 'always', // Always fetch on mount to ensure fresh data
    refetchOnWindowFocus: true,
  });
};

// Hook to get wishlist items - for Wishlist page (ALWAYS fetches fresh data)
export const useWishlistWithPolling = () => {
  const dispatch = useAppDispatch();
  
  return useQuery({
    queryKey: queryKeys.wishlist.items,
    queryFn: async () => {
      console.log('useWishlistWithPolling: Fetching wishlist from API...');
      const wishlist = await WishlistService.getWishlist();
      console.log('useWishlistWithPolling: Wishlist fetched:', wishlist, 'Length:', wishlist.length);
      // Sync Redux count IMMEDIATELY
      dispatch(setWishlistCount(wishlist.length));
      return wishlist;
    },
    staleTime: 0, // Always consider data stale - always fetch
    retry: false,
    refetchOnMount: 'always', // ALWAYS refetch on mount, ignore cache completely
    refetchOnWindowFocus: true,
    refetchInterval: false,
    // Force fresh fetch every time
    gcTime: 0, // Don't cache at all - always fresh
  });
};

// Hook to get wishlist count - SIMPLE: just read from Redux
export const useWishlistCount = () => {
  const count = useAppSelector((state) => state.counter.wishlistCount);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // Sync from cache whenever cache changes AND on mount
  useEffect(() => {
    const updateFromCache = () => {
      const cachedWishlist = queryClient.getQueryData<WishlistItem[]>(queryKeys.wishlist.items);
      if (cachedWishlist && Array.isArray(cachedWishlist)) {
        const cachedCount = cachedWishlist.length;
        console.log('Syncing wishlist count from cache:', cachedCount);
        dispatch(setWishlistCount(cachedCount));
      }
    };

    // Initial sync
    updateFromCache();

    // Listen to cache updates
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === 'wishlist' && 
          event?.query?.queryKey?.[1] === 'items') {
        setTimeout(updateFromCache, 0);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, dispatch]);

  return { data: count, isLoading: false, error: null };
};

// Hook to check if a product is in wishlist
export const useIsInWishlist = (productId: string) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: queryKeys.wishlist.check(productId),
    queryFn: async () => {
      const cachedWishlist = queryClient.getQueryData<WishlistItem[]>(queryKeys.wishlist.items);
      if (cachedWishlist && Array.isArray(cachedWishlist)) {
        return cachedWishlist.some(item => item.product_id === productId);
      }
      return false;
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!productId,
    initialData: () => {
      const cachedWishlist = queryClient.getQueryData<WishlistItem[]>(queryKeys.wishlist.items);
      if (cachedWishlist && Array.isArray(cachedWishlist)) {
        return cachedWishlist.some(item => item.product_id === productId);
      }
      return false;
    },
  });
};

// Hook to add item to wishlist - INSTANT UPDATES
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (productId: string) => {
      // STEP 1: Get current state (may be empty if not loaded yet)
      const currentWishlist = queryClient.getQueryData<WishlistItem[]>(queryKeys.wishlist.items) || [];
      const currentCount = currentWishlist.length;
      
      // STEP 2: Update Redux IMMEDIATELY (SYNCHRONOUS - instant UI update)
      // Always update Redux, even if product might already be in wishlist (optimistic)
      if (!currentWishlist.some(item => item.product_id === productId)) {
        const newCount = currentCount + 1;
        console.log('Add to wishlist - Optimistic update:', { currentCount, newCount, productId });
        dispatch(setWishlistCount(newCount)); // INSTANT Redux update - this triggers Navbar re-render
        
        // STEP 3: Update cache optimistically (SYNCHRONOUS - instant UI update)
        const optimisticWishlist: WishlistItem[] = [...currentWishlist, {
          id: `temp_${Date.now()}`,
          product_id: productId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: '',
          updated_by: '',
          user_id: '',
        } as WishlistItem];
        queryClient.setQueryData(queryKeys.wishlist.items, optimisticWishlist);
        queryClient.setQueryData(queryKeys.wishlist.check(productId), true);
      } else {
        console.log('Add to wishlist - Already in wishlist, skipping optimistic update');
      }
      
      // STEP 4: Make API call (ASYNC - doesn't block UI)
      const result = await WishlistService.addToWishlist(productId);
      return { result, productId };
    },
    onSuccess: ({ result, productId }) => {
      // Update with actual API response
      console.log('Add to wishlist success:', result);
      dispatch(setWishlistCount(result.length));
      queryClient.setQueryData(queryKeys.wishlist.items, result);
      queryClient.setQueryData(queryKeys.wishlist.count, result.length);
      queryClient.setQueryData(queryKeys.wishlist.check(productId), true);
      // Invalidate to force refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.items });
    },
    onError: (error, productId) => {
      // Rollback on error
      const currentWishlist = queryClient.getQueryData<WishlistItem[]>(queryKeys.wishlist.items) || [];
      const rolledBack = currentWishlist.filter(item => item.product_id !== productId);
      queryClient.setQueryData(queryKeys.wishlist.items, rolledBack);
      dispatch(setWishlistCount(rolledBack.length));
      console.error('Failed to add to wishlist:', error);
    },
  });
};

// Hook to remove item from wishlist - INSTANT UPDATES
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (productId: string) => {
      // STEP 1: Get current state
      const currentWishlist = queryClient.getQueryData<WishlistItem[]>(queryKeys.wishlist.items) || [];
      
      // STEP 2: Update Redux IMMEDIATELY (SYNCHRONOUS - instant UI update)
      const newWishlist = currentWishlist.filter(item => item.product_id !== productId);
      const newCount = newWishlist.length;
      dispatch(setWishlistCount(newCount)); // INSTANT Redux update
      
      // STEP 3: Update cache optimistically (SYNCHRONOUS - instant UI update)
      queryClient.setQueryData(queryKeys.wishlist.items, newWishlist);
      queryClient.setQueryData(queryKeys.wishlist.check(productId), false);
      
      // STEP 4: Make API call (ASYNC - doesn't block UI)
      const result = await WishlistService.removeFromWishlist(productId);
      return { result, productId };
    },
    onSuccess: ({ result, productId }) => {
      // Update with actual API response
      console.log('Remove from wishlist success:', result);
      dispatch(setWishlistCount(result.length));
      queryClient.setQueryData(queryKeys.wishlist.items, result);
      queryClient.setQueryData(queryKeys.wishlist.count, result.length);
      queryClient.setQueryData(queryKeys.wishlist.check(productId), false);
      // Invalidate to force refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.items });
    },
    onError: (error, productId) => {
      // Rollback on error - refetch actual data
      queryClient.refetchQueries({ queryKey: queryKeys.wishlist.items });
      console.error('Failed to remove from wishlist:', error);
    },
  });
};

// Hook to clear wishlist
export const useClearWishlist = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async () => {
      // STEP 1: Update Redux IMMEDIATELY (SYNCHRONOUS - instant UI update)
      dispatch(setWishlistCount(0));
      
      // STEP 2: Update cache optimistically (SYNCHRONOUS - instant UI update)
      queryClient.setQueryData(queryKeys.wishlist.items, []);
      queryClient.setQueryData(queryKeys.wishlist.count, 0);
      
      // STEP 3: Make API call (ASYNC - doesn't block UI)
      const result = await WishlistService.clearWishlist();
      return result;
    },
    onSuccess: () => {
      // Already updated in mutationFn
      dispatch(setWishlistCount(0));
      queryClient.setQueryData(queryKeys.wishlist.items, []);
      queryClient.setQueryData(queryKeys.wishlist.count, 0);
    },
    onError: (error) => {
      // Refetch actual data on error
      queryClient.refetchQueries({ queryKey: queryKeys.wishlist.items });
      console.error('Failed to clear wishlist:', error);
    },
  });
};

// Hook to toggle wishlist item - INSTANT UPDATES
export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async ({ productId, isInWishlist }: { productId: string; isInWishlist: boolean }) => {
      // STEP 1: Get current state (may be empty if not loaded yet)
      const currentWishlist = queryClient.getQueryData<WishlistItem[]>(queryKeys.wishlist.items) || [];
      const currentCount = currentWishlist.length;
      
      if (isInWishlist) {
        // Remove - STEP 2: Update Redux IMMEDIATELY (SYNCHRONOUS - instant UI update)
        const newWishlist = currentWishlist.filter(item => item.product_id !== productId);
        const newCount = newWishlist.length;
        console.log('Toggle wishlist (remove) - Optimistic update:', { currentCount, newCount, productId });
        dispatch(setWishlistCount(newCount)); // INSTANT Redux update - this triggers Navbar re-render
        
        // STEP 3: Update cache optimistically (SYNCHRONOUS - instant UI update)
        queryClient.setQueryData(queryKeys.wishlist.items, newWishlist);
        queryClient.setQueryData(queryKeys.wishlist.check(productId), false);
        
        // STEP 4: Make API call (ASYNC - doesn't block UI)
        const result = await WishlistService.removeFromWishlist(productId);
        return { result, productId, isInWishlist };
      } else {
        // Add - STEP 2: Update Redux IMMEDIATELY (SYNCHRONOUS - instant UI update)
        const newCount = currentCount + 1;
        console.log('Toggle wishlist (add) - Optimistic update:', { currentCount, newCount, productId });
        dispatch(setWishlistCount(newCount)); // INSTANT Redux update - this triggers Navbar re-render
        
        // STEP 3: Update cache optimistically (SYNCHRONOUS - instant UI update)
        const optimisticWishlist: WishlistItem[] = [...currentWishlist, {
          id: `temp_${Date.now()}`,
          product_id: productId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: '',
          updated_by: '',
          user_id: '',
        } as WishlistItem];
        queryClient.setQueryData(queryKeys.wishlist.items, optimisticWishlist);
        queryClient.setQueryData(queryKeys.wishlist.check(productId), true);
        
        // STEP 4: Make API call (ASYNC - doesn't block UI)
        const result = await WishlistService.addToWishlist(productId);
        return { result, productId, isInWishlist };
      }
    },
    onSuccess: ({ result, productId, isInWishlist }) => {
      // Update with actual API response
      console.log('Toggle wishlist success:', result);
      dispatch(setWishlistCount(result.length));
      queryClient.setQueryData(queryKeys.wishlist.items, result);
      queryClient.setQueryData(queryKeys.wishlist.count, result.length);
      queryClient.setQueryData(queryKeys.wishlist.check(productId), !isInWishlist);
      // Invalidate to force refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.items });
    },
    onError: (error, variables) => {
      // Rollback on error
      const currentWishlist = queryClient.getQueryData<WishlistItem[]>(queryKeys.wishlist.items) || [];
      if (variables.isInWishlist) {
        // Was removing, but error - re-add optimistically
        const rolledBack = [...currentWishlist, {
          id: `temp_${Date.now()}`,
          product_id: variables.productId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: '',
          updated_by: '',
          user_id: '',
        } as WishlistItem];
        queryClient.setQueryData(queryKeys.wishlist.items, rolledBack);
        dispatch(setWishlistCount(rolledBack.length));
      } else {
        // Was adding, but error - remove optimistically
        const rolledBack = currentWishlist.filter(item => item.product_id !== variables.productId);
        queryClient.setQueryData(queryKeys.wishlist.items, rolledBack);
        dispatch(setWishlistCount(rolledBack.length));
      }
      console.error('Failed to toggle wishlist:', error);
    },
  });
};
