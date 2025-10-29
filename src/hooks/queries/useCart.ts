import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CartService from '../../services/cartService';
import { queryKeys, handleQueryError, handleQuerySuccess } from '../../lib/queryClient';
import type { Cart, CartItem } from '../../services/api';
import type { GuestCart, GuestCartItem } from '../../services/guestCartService';

// Helper function to update all cart-related queries
const updateCartQueries = (queryClient: any, data: Cart | GuestCart) => {
  // Update all cart-related queries with new data
  queryClient.setQueryData(queryKeys.cart.all, data);
  queryClient.setQueryData(queryKeys.cart.items, data.items);
  queryClient.setQueryData(queryKeys.cart.summary, {
    total_items: data.total_items,
    total_price: data.total_price,
    discount_amount: 'discount_amount' in data ? data.discount_amount : 0,
    discounted_total: 'discounted_total' in data ? data.discounted_total : data.total_price,
    items_count: data.total_items,
    last_updated: new Date().toISOString(),
    has_expired: false,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });
  queryClient.setQueryData(queryKeys.cart.count, { item_count: data.total_items });
  
  // Invalidate to trigger refetch if needed
  queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
};

// Get cart
export const useCart = () => {
  return useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: async () => {
      try {
        const cart = await CartService.getCart();
        return cart;
      } catch (error) {
        console.warn('Failed to get cart:', error);
        // Return empty cart for unauthenticated users
        return {
          id: '',
          created_at: '',
          updated_at: '',
          created_by: '',
          updated_by: '',
          user_id: '',
          total_items: 0,
          total_price: 0,
          discount_amount: 0,
          items: []
        };
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: false, // Don't retry on error
  });
};

// Get cart items
export const useCartItems = () => {
  return useQuery({
    queryKey: queryKeys.cart.items,
    queryFn: async () => {
      try {
        const items = await CartService.getCartItems();
        return items;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 30 * 1000,
  });
};

// Get cart summary
export const useCartSummary = () => {
  return useQuery({
    queryKey: queryKeys.cart.summary,
    queryFn: async () => {
      try {
        const summary = await CartService.getSummary();
        return summary;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 30 * 1000,
  });
};

// Get cart count
export const useCartCount = () => {
  return useQuery({
    queryKey: queryKeys.cart.count,
    queryFn: async () => {
      try {
        const count = await CartService.getItemCount();
        return { item_count: count };
      } catch (error) {
        // For unauthenticated users, return 0 instead of throwing error
        console.warn('Failed to get cart count:', error);
        return { item_count: 0 };
      }
    },
    staleTime: 30 * 1000,
    retry: false, // Don't retry on error
  });
};

// Check if cart is empty
export const useIsCartEmpty = () => {
  return useQuery({
    queryKey: ['cart', 'isEmpty'],
    queryFn: async () => {
      try {
        const isEmpty = await CartService.isCartEmpty();
        return isEmpty;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 30 * 1000,
  });
};

// Get cart total
export const useCartTotal = () => {
  return useQuery({
    queryKey: ['cart', 'total'],
    queryFn: async () => {
      try {
        const total = await CartService.getCartTotal();
        return total;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 30 * 1000,
  });
};

// Get cart discount
export const useCartDiscount = () => {
  return useQuery({
    queryKey: ['cart', 'discount'],
    queryFn: async () => {
      try {
        const discount = await CartService.getCartDiscount();
        return discount;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 30 * 1000,
  });
};

// Get cart discounted total
export const useCartDiscountedTotal = () => {
  return useQuery({
    queryKey: ['cart', 'discountedTotal'],
    queryFn: async () => {
      try {
        const total = await CartService.getCartDiscountedTotal();
        return total;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 30 * 1000,
  });
};

// Get specific cart item
export const useCartItem = (productId: string) => {
  return useQuery({
    queryKey: ['cart', 'item', productId],
    queryFn: async () => {
      try {
        const item = await CartService.getCartItem(productId);
        return item;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 30 * 1000,
  });
};

// Check if product is in cart
export const useIsProductInCart = (productId: string) => {
  return useQuery({
    queryKey: ['cart', 'isProductInCart', productId],
    queryFn: async () => {
      try {
        const isInCart = await CartService.isProductInCart(productId);
        return isInCart;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 30 * 1000,
  });
};

// Get product quantity in cart
export const useProductQuantity = (productId: string) => {
  return useQuery({
    queryKey: ['cart', 'productQuantity', productId],
    queryFn: async () => {
      try {
        const quantity = await CartService.getProductQuantity(productId);
        return quantity;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 30 * 1000,
  });
};

// Add item to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      try {
        const cart = await CartService.addItem(productId, quantity);
        return cart;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    onSuccess: (data) => {
      updateCartQueries(queryClient, data);
      handleQuerySuccess(data, 'Item added to cart successfully');
    },
    onError: (error) => {
      console.error('Add to cart error:', error);
    },
  });
};

// Update item quantity
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      try {
        const cart = await CartService.updateItemQuantity(productId, quantity);
        return cart;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    onSuccess: (data) => {
      updateCartQueries(queryClient, data);
      handleQuerySuccess(data, 'Cart updated successfully');
    },
    onError: (error) => {
      console.error('Update cart item error:', error);
    },
  });
};

// Remove item from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      try {
        const cart = await CartService.removeItem(productId);
        return cart;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    onSuccess: (data) => {
      updateCartQueries(queryClient, data);
      handleQuerySuccess(data, 'Item removed from cart');
    },
    onError: (error) => {
      console.error('Remove from cart error:', error);
    },
  });
};

// Increment item quantity
export const useIncrementCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      try {
        const cart = await CartService.incrementItem(productId);
        return cart;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    onSuccess: (data) => {
      updateCartQueries(queryClient, data);
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
  
  return useMutation({
    mutationFn: async (productId: string) => {
      try {
        const cart = await CartService.decrementItem(productId);
        return cart;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    onSuccess: (data) => {
      updateCartQueries(queryClient, data);
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
  
  return useMutation({
    mutationFn: async () => {
      try {
        const cart = await CartService.clearCart();
        return cart;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    onSuccess: (data) => {
      updateCartQueries(queryClient, data);
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
  
  return useMutation({
    mutationFn: async (couponCode: string) => {
      try {
        const cart = await CartService.applyCoupon(couponCode);
        return cart;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    onSuccess: (data) => {
      updateCartQueries(queryClient, data);
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
  
  return useMutation({
    mutationFn: async () => {
      try {
        const cart = await CartService.removeCoupon();
        return cart;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    onSuccess: (data) => {
      updateCartQueries(queryClient, data);
      handleQuerySuccess(data, 'Coupon removed successfully');
    },
    onError: (error) => {
      console.error('Remove coupon error:', error);
    },
  });
};