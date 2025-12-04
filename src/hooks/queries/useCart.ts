import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import CartService from '../../services/cartService';
import { queryKeys, handleQueryError, handleQuerySuccess } from '../../lib/queryClient';
import type { Cart, CartItem } from '../../services/api';
import type { GuestCart, GuestCartItem } from '../../services/guestCartService';
import { useAppDispatch, useAppSelector } from '../../store';
import { setCartCount } from '../../store/slices/counterSlice';

// Helper function to update all cart-related queries and Redux
export const updateCartQueries = (queryClient: any, data: Cart | GuestCart, dispatch?: any) => {
  const totalItems = data.total_items || (data as any).items_count || 0;
  const totalPrice = data.total_price || (data as any)?.final_price || 0;
  const discountAmount = 'discount_amount' in data ? data.discount_amount : 0;
  const discountedTotal = 'discounted_total' in data 
    ? data.discounted_total 
    : ((data as any).final_price || data.total_price || 0);
  
  // Update Redux count IMMEDIATELY if dispatch is provided
  if (dispatch) {
    dispatch(setCartCount(totalItems)); // INSTANT Redux update
  }

  // Update all cart-related queries with new data
  queryClient.setQueryData(queryKeys.cart.all, data);
  queryClient.setQueryData(queryKeys.cart.items, data.items || []);
  queryClient.setQueryData(queryKeys.cart.summary, {
    total_items: totalItems,
    total_price: totalPrice,
    discount_amount: discountAmount,
    discounted_total: discountedTotal,
    items_count: totalItems,
    last_updated: new Date().toISOString(),
    has_expired: false,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });
  queryClient.setQueryData(queryKeys.cart.count, { 
    item_count: totalItems 
  });
};

// Get cart - general use
export const useCart = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: async () => {
      const cart = await CartService.getCart();
      // Sync Redux and cache IMMEDIATELY
      updateCartQueries(queryClient, cart, dispatch);
      return cart;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: false,
  });
};

// Get cart - for Cart page (always fresh on mount to catch migration updates)
export const useCartWithPolling = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: async () => {
      const cart = await CartService.getCart();
      // Sync Redux and cache IMMEDIATELY
      updateCartQueries(queryClient, cart, dispatch);
      return cart;
    },
    staleTime: 0, // Always consider data stale to ensure fresh fetch after migration
    refetchOnWindowFocus: true,
    refetchOnMount: 'always', // Always refetch on mount to catch migration updates
    refetchInterval: false,
    retry: false,
  });
};

// Get cart count - SIMPLE: just read from Redux
export const useCartCount = () => {
  const count = useAppSelector((state) => state.counter.cartCount);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // ONE-TIME sync from cache on mount (background sync only)
  useEffect(() => {
    const cachedCart = queryClient.getQueryData<Cart | GuestCart>(queryKeys.cart.all);
    if (cachedCart) {
      const totalItems = cachedCart.total_items || (cachedCart as any)?.items_count || 0;
      if (totalItems !== count) {
        dispatch(setCartCount(totalItems));
      }
    }
  }, []); // Only run once on mount

  return { data: { item_count: count }, isLoading: false, error: null };
};

// Add item to cart - INSTANT UPDATES
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      // STEP 1: Get current cart
      const currentCart = queryClient.getQueryData<Cart | GuestCart>(queryKeys.cart.all);
      
      if (currentCart) {
        const currentItems = currentCart.items || [];
        const existingItemIndex = currentItems.findIndex((item: any) => item.product_id === productId);
        
        let optimisticCart: Cart | GuestCart;
        
        if (existingItemIndex >= 0) {
          // Item exists - update quantity optimistically
          const updatedItems = [...currentItems];
          const existingItem = updatedItems[existingItemIndex];
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: (existingItem.quantity || 1) + quantity,
            total_price: ((existingItem.quantity || 1) + quantity) * (existingItem.unit_price || 0),
          };
          
          optimisticCart = {
            ...currentCart,
            items: updatedItems,
            total_items: ((currentCart.total_items || (currentCart as any)?.items_count || 0) + quantity),
            total_price: (currentCart.total_price || (currentCart as any)?.final_price || 0) + ((existingItem.unit_price || 0) * quantity),
          } as Cart | GuestCart;
        } else {
          // New item - add optimistically
          const newItem = {
            id: `temp_${Date.now()}`,
            product_id: productId,
            quantity: quantity,
            unit_price: 0,
            total_price: 0,
          } as any;
          
          optimisticCart = {
            ...currentCart,
            items: [...currentItems, newItem],
            total_items: ((currentCart.total_items || (currentCart as any)?.items_count || 0) + quantity),
          } as Cart | GuestCart;
        }
        
        // STEP 2: Update Redux and cache IMMEDIATELY (SYNCHRONOUS - instant UI update)
        updateCartQueries(queryClient, optimisticCart, dispatch);
      }
      
      // STEP 3: Make API call (ASYNC - doesn't block UI)
      try {
        const cart = await CartService.addItem(productId, quantity);
        return cart;
      } catch (error) {
        // Rollback on error
        const currentCartBackup = queryClient.getQueryData<Cart | GuestCart>(queryKeys.cart.all);
        if (currentCartBackup) {
          updateCartQueries(queryClient, currentCartBackup, dispatch);
        }
        throw handleQueryError(error);
      }
    },
    onSuccess: (data) => {
      // Update with actual API response
      updateCartQueries(queryClient, data, dispatch);
      // Refetch to get enriched product details (background)
      queryClient.refetchQueries({ queryKey: queryKeys.cart.all }).catch(() => {});
      handleQuerySuccess(data, 'Item added to cart successfully');
    },
    onError: (error) => {
      console.error('Add to cart error:', error);
    },
  });
};

// Remove item from cart - INSTANT UPDATES
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      // STEP 1: Get current cart
      const currentCart = queryClient.getQueryData<Cart | GuestCart>(queryKeys.cart.all);
      
      if (currentCart) {
        const currentItems = currentCart.items || [];
        const itemToRemove = currentItems.find((item: any) => item.product_id === productId);
        const optimisticItems = currentItems.filter((item: any) => item.product_id !== productId);
        
        const removedQuantity = itemToRemove?.quantity || 1;
        const optimisticCart = {
          ...currentCart,
          items: optimisticItems,
          total_items: Math.max(0, (currentCart.total_items || (currentCart as any)?.items_count || 0) - removedQuantity),
          total_price: Math.max(0, (currentCart.total_price || (currentCart as any)?.final_price || 0) - ((itemToRemove?.total_price || itemToRemove?.unit_price || 0) * removedQuantity)),
        } as Cart | GuestCart;
        
        // STEP 2: Update Redux and cache IMMEDIATELY (SYNCHRONOUS - instant UI update)
        updateCartQueries(queryClient, optimisticCart, dispatch);
      }
      
      // STEP 3: Make API call (ASYNC - doesn't block UI)
      try {
        const cart = await CartService.removeItem(productId);
        return cart;
      } catch (error) {
        // Rollback on error
        const currentCartBackup = queryClient.getQueryData<Cart | GuestCart>(queryKeys.cart.all);
        if (currentCartBackup) {
          updateCartQueries(queryClient, currentCartBackup, dispatch);
        }
        throw handleQueryError(error);
      }
    },
    onSuccess: (data) => {
      // Update with actual API response
      updateCartQueries(queryClient, data, dispatch);
      // Refetch to get enriched product details (background)
      queryClient.refetchQueries({ queryKey: queryKeys.cart.all }).catch(() => {});
      handleQuerySuccess(data, 'Item removed from cart');
    },
    onError: (error) => {
      console.error('Remove from cart error:', error);
    },
  });
};

// Update item quantity
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const cart = await CartService.updateItemQuantity(productId, quantity);
      return cart;
    },
    onSuccess: (data) => {
      updateCartQueries(queryClient, data, dispatch);
      handleQuerySuccess(data, 'Cart updated successfully');
    },
    onError: (error) => {
      console.error('Update cart item error:', error);
    },
  });
};

// Increment item quantity
export const useIncrementCartItem = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      const cart = await CartService.incrementItem(productId);
      return cart;
    },
    onSuccess: (data) => {
      updateCartQueries(queryClient, data, dispatch);
      handleQuerySuccess(data, 'Item quantity increased');
    },
    onError: (error) => {
      console.error('Increment cart item error:', error);
    },
  });
};

// Decrement item quantity
export const useDecrementCartItem = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      const cart = await CartService.decrementItem(productId);
      return cart;
    },
    onSuccess: (data) => {
      updateCartQueries(queryClient, data, dispatch);
      handleQuerySuccess(data, 'Item quantity decreased');
    },
    onError: (error) => {
      console.error('Decrement cart item error:', error);
    },
  });
};

// Clear cart
export const useClearCart = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: async () => {
      const cart = await CartService.clearCart();
      return cart;
    },
    onSuccess: (data) => {
      updateCartQueries(queryClient, data, dispatch);
      handleQuerySuccess(data, 'Cart cleared successfully');
    },
    onError: (error) => {
      console.error('Clear cart error:', error);
    },
  });
};

// Apply coupon
export const useApplyCoupon = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: async (couponCode: string) => {
      const cart = await CartService.applyCoupon(couponCode);
      return cart;
    },
    onSuccess: (data) => {
      updateCartQueries(queryClient, data, dispatch);
      handleQuerySuccess(data, 'Coupon applied successfully');
    },
    onError: (error) => {
      console.error('Apply coupon error:', error);
    },
  });
};

// Remove coupon
export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: async () => {
      const cart = await CartService.removeCoupon();
      return cart;
    },
    onSuccess: (data) => {
      updateCartQueries(queryClient, data, dispatch);
      handleQuerySuccess(data, 'Coupon removed successfully');
    },
    onError: (error) => {
      console.error('Remove coupon error:', error);
    },
  });
};

// Get cart items
export const useCartItems = () => {
  return useQuery({
    queryKey: queryKeys.cart.items,
    queryFn: async () => {
      const items = await CartService.getCartItems();
      return items;
    },
    staleTime: 30 * 1000,
  });
};

// Get cart summary
export const useCartSummary = () => {
  return useQuery({
    queryKey: queryKeys.cart.summary,
    queryFn: async () => {
      const summary = await CartService.getSummary();
      return summary;
    },
    staleTime: 30 * 1000,
  });
};

// Check if cart is empty
export const useIsCartEmpty = () => {
  return useQuery({
    queryKey: ['cart', 'isEmpty'],
    queryFn: async () => {
      const isEmpty = await CartService.isCartEmpty();
      return isEmpty;
    },
    staleTime: 30 * 1000,
  });
};

// Check if product is in cart
export const useIsProductInCart = (productId: string) => {
  return useQuery({
    queryKey: ['cart', 'item', productId],
    queryFn: async () => {
      const item = await CartService.getCartItem(productId);
      return item;
    },
    staleTime: 30 * 1000,
  });
};

// Get product quantity in cart
export const useProductQuantity = (productId: string) => {
  return useQuery({
    queryKey: ['cart', 'productQuantity', productId],
    queryFn: async () => {
      const quantity = await CartService.getProductQuantity(productId);
      return quantity;
    },
    staleTime: 30 * 1000,
  });
};
