import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import CartService from '../../services/cartService';
import { GuestCartService, type GuestCart, type GuestCartItem } from '../../services/guestCartService';
import type { Cart, CartItem } from '../../services/api';

// Types
export interface CartState {
  // Cart data
  items: (CartItem | GuestCartItem)[];
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  discountedTotal: number;
  
  // Loading states
  isLoading: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  
  // Error state
  error: string | null;
  
  // Cart type
  isGuestCart: boolean;
  sessionId: string | null;
  
  // Cart metadata
  lastUpdated: string | null;
  isEmpty: boolean;
}

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  discountAmount: 0,
  discountedTotal: 0,
  isLoading: false,
  isAdding: false,
  isUpdating: false,
  isRemoving: false,
  error: null,
  isGuestCart: true,
  sessionId: null,
  lastUpdated: null,
  isEmpty: true,
};

// Helper function to check if user is authenticated
const isUserAuthenticated = (): boolean => {
  try {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    return !!(user && token);
  } catch {
    return false;
  }
};

// Helper function to extract cart data from different cart types
const extractCartData = (cart: Cart | GuestCart) => {
  const isGuest = 'session_id' in cart || 'user_id' in cart;
  
  return {
    items: cart.items || [],
    totalItems: cart.total_items || 0,
    totalPrice: cart.total_price || 0,
    discountAmount: 'discount_amount' in cart ? cart.discount_amount : 0,
    discountedTotal: 'discounted_total' in cart ? cart.discounted_total : cart.total_price || 0,
    isGuestCart: isGuest,
    sessionId: isGuest ? (cart as GuestCart).id : null,
    lastUpdated: new Date().toISOString(),
    isEmpty: (cart.items || []).length === 0,
  };
};

// Async thunks
export const loadCart = createAsyncThunk(
  'cart/loadCart',
  async (_, { rejectWithValue }) => {
    try {
      const cart = await CartService.getCart();
      return extractCartData(cart);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    { productId, quantity }: { productId: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const cart = await CartService.addItem(productId, quantity);
      return extractCartData(cart);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add item to cart');
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  'cart/updateItemQuantity',
  async (
    { productId, quantity }: { productId: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const cart = await CartService.updateItemQuantity(productId, quantity);
      return extractCartData(cart);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update item quantity');
    }
  }
);

export const removeItem = createAsyncThunk(
  'cart/removeItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      const cart = await CartService.removeItem(productId);
      return extractCartData(cart);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove item from cart');
    }
  }
);

export const incrementItem = createAsyncThunk(
  'cart/incrementItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      const cart = await CartService.incrementItem(productId);
      return extractCartData(cart);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to increment item');
    }
  }
);

export const decrementItem = createAsyncThunk(
  'cart/decrementItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      const cart = await CartService.decrementItem(productId);
      return extractCartData(cart);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to decrement item');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const cart = await CartService.clearCart();
      return extractCartData(cart);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to clear cart');
    }
  }
);

export const migrateGuestCart = createAsyncThunk(
  'cart/migrateGuestCart',
  async (_, { rejectWithValue }) => {
    try {
      await CartService.migrateGuestCart();
      // Reload cart after migration
      const cart = await CartService.getCart();
      return extractCartData(cart);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to migrate guest cart');
    }
  }
);

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setGuestMode: (state) => {
      state.isGuestCart = true;
    },
    setAuthenticatedMode: (state) => {
      state.isGuestCart = false;
    },
    clearCartState: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.discountAmount = 0;
      state.discountedTotal = 0;
      state.isEmpty = true;
      state.lastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load cart
      .addCase(loadCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
        state.discountAmount = action.payload.discountAmount;
        state.discountedTotal = action.payload.discountedTotal;
        state.isGuestCart = action.payload.isGuestCart;
        state.sessionId = action.payload.sessionId;
        state.lastUpdated = action.payload.lastUpdated;
        state.isEmpty = action.payload.isEmpty;
        state.error = null;
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isAdding = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isAdding = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
        state.discountAmount = action.payload.discountAmount;
        state.discountedTotal = action.payload.discountedTotal;
        state.isGuestCart = action.payload.isGuestCart;
        state.sessionId = action.payload.sessionId;
        state.lastUpdated = action.payload.lastUpdated;
        state.isEmpty = action.payload.isEmpty;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isAdding = false;
        state.error = action.payload as string;
      })
      
      // Update item quantity
      .addCase(updateItemQuantity.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
        state.discountAmount = action.payload.discountAmount;
        state.discountedTotal = action.payload.discountedTotal;
        state.isGuestCart = action.payload.isGuestCart;
        state.sessionId = action.payload.sessionId;
        state.lastUpdated = action.payload.lastUpdated;
        state.isEmpty = action.payload.isEmpty;
        state.error = null;
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      
      // Remove item
      .addCase(removeItem.pending, (state) => {
        state.isRemoving = true;
        state.error = null;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.isRemoving = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
        state.discountAmount = action.payload.discountAmount;
        state.discountedTotal = action.payload.discountedTotal;
        state.isGuestCart = action.payload.isGuestCart;
        state.sessionId = action.payload.sessionId;
        state.lastUpdated = action.payload.lastUpdated;
        state.isEmpty = action.payload.isEmpty;
        state.error = null;
      })
      .addCase(removeItem.rejected, (state, action) => {
        state.isRemoving = false;
        state.error = action.payload as string;
      })
      
      // Increment item
      .addCase(incrementItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
        state.discountAmount = action.payload.discountAmount;
        state.discountedTotal = action.payload.discountedTotal;
        state.isGuestCart = action.payload.isGuestCart;
        state.sessionId = action.payload.sessionId;
        state.lastUpdated = action.payload.lastUpdated;
        state.isEmpty = action.payload.isEmpty;
      })
      
      // Decrement item
      .addCase(decrementItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
        state.discountAmount = action.payload.discountAmount;
        state.discountedTotal = action.payload.discountedTotal;
        state.isGuestCart = action.payload.isGuestCart;
        state.sessionId = action.payload.sessionId;
        state.lastUpdated = action.payload.lastUpdated;
        state.isEmpty = action.payload.isEmpty;
      })
      
      // Clear cart
      .addCase(clearCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
        state.discountAmount = action.payload.discountAmount;
        state.discountedTotal = action.payload.discountedTotal;
        state.isGuestCart = action.payload.isGuestCart;
        state.sessionId = action.payload.sessionId;
        state.lastUpdated = action.payload.lastUpdated;
        state.isEmpty = action.payload.isEmpty;
      })
      
      // Migrate guest cart
      .addCase(migrateGuestCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
        state.discountAmount = action.payload.discountAmount;
        state.discountedTotal = action.payload.discountedTotal;
        state.isGuestCart = action.payload.isGuestCart;
        state.sessionId = action.payload.sessionId;
        state.lastUpdated = action.payload.lastUpdated;
        state.isEmpty = action.payload.isEmpty;
      });
  },
});

export const { clearError, setGuestMode, setAuthenticatedMode, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;




