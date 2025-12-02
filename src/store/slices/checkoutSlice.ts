import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { checkoutApi } from '../../services/checkoutService';
import type { ShippingAddress, ShippingOption, ValidationIssue } from '../../services/checkoutService';

// Types
export interface MagicCheckoutOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  receipt: string;
  has_saved_address: boolean;
  saved_address?: string;
}

export interface CheckoutState {
  // Checkout flow state
  step: 'address' | 'shipping' | 'payment';
  
  // Checkout data
  checkoutData: {
    cart: any;
    cart_updated: boolean;
    validation_issues: ValidationIssue[];
  } | null;
  
  // Shipping
  shippingAddress: ShippingAddress | null;
  shippingOptions: ShippingOption[];
  selectedShipping: ShippingOption | null;
  addressId: string;
  
  // Order
  magicCheckoutOrder: MagicCheckoutOrderResponse | null;
  
  // Payment
  paymentVerification: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  } | null;
  
  // Loading states
  isLoading: boolean;
  isCreatingOrder: boolean;
  isVerifyingPayment: boolean;
  isEstimatingShipping: boolean;
  
  // Error state
  error: string | null;
  
  // Success state
  paymentSuccess: boolean;
  successOrderId: string | null;
}

// Initial state
const initialState: CheckoutState = {
  step: 'address',
  checkoutData: null,
  shippingAddress: null,
  shippingOptions: [],
  selectedShipping: null,
  addressId: '',
  magicCheckoutOrder: null,
  paymentVerification: null,
  isLoading: false,
  isCreatingOrder: false,
  isVerifyingPayment: false,
  isEstimatingShipping: false,
  error: null,
  paymentSuccess: false,
  successOrderId: null,
};

// Async thunks
export const prepareCheckout = createAsyncThunk(
  'checkout/prepare',
  async (_, { rejectWithValue }) => {
    try {
      const response = await checkoutApi.prepareCheckout();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to prepare checkout');
    }
  }
);

export const estimateShipping = createAsyncThunk(
  'checkout/estimateShipping',
  async (address: ShippingAddress, { rejectWithValue }) => {
    try {
      const response = await checkoutApi.estimateShipping(address);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to estimate shipping');
    }
  }
);

export const createMagicCheckoutOrder = createAsyncThunk(
  'checkout/createMagicCheckoutOrder',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await checkoutApi.createMagicCheckoutOrder();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create order');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'checkout/verifyPayment',
  async (verificationData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }, { rejectWithValue }) => {
    try {
      const response = await checkoutApi.verifyPayment(verificationData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to verify payment');
    }
  }
);

// Checkout slice
const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<'address' | 'shipping' | 'payment'>) => {
      state.step = action.payload;
    },
    setShippingAddress: (state, action: PayloadAction<ShippingAddress>) => {
      state.shippingAddress = action.payload;
    },
    setAddressId: (state, action: PayloadAction<string>) => {
      state.addressId = action.payload;
    },
    setSelectedShipping: (state, action: PayloadAction<ShippingOption | null>) => {
      state.selectedShipping = action.payload;
    },
    clearCheckout: (state) => {
      return initialState;
    },
    setPaymentSuccess: (state, action: PayloadAction<{ success: boolean; orderId?: string }>) => {
      state.paymentSuccess = action.payload.success;
      state.successOrderId = action.payload.orderId || null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Prepare checkout
      .addCase(prepareCheckout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(prepareCheckout.fulfilled, (state, action) => {
        state.isLoading = false;
        state.checkoutData = action.payload;
        state.error = null;
      })
      .addCase(prepareCheckout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Estimate shipping
      .addCase(estimateShipping.pending, (state) => {
        state.isEstimatingShipping = true;
        state.error = null;
      })
      .addCase(estimateShipping.fulfilled, (state, action) => {
        state.isEstimatingShipping = false;
        state.shippingOptions = action.payload.shipping_options;
        state.addressId = action.payload.address_id;
        state.error = null;
      })
      .addCase(estimateShipping.rejected, (state, action) => {
        state.isEstimatingShipping = false;
        state.error = action.payload as string;
      })
      
      // Create Magic Checkout order
      .addCase(createMagicCheckoutOrder.pending, (state) => {
        state.isCreatingOrder = true;
        state.error = null;
      })
      .addCase(createMagicCheckoutOrder.fulfilled, (state, action) => {
        state.isCreatingOrder = false;
        state.magicCheckoutOrder = action.payload;
        state.error = null;
      })
      .addCase(createMagicCheckoutOrder.rejected, (state, action) => {
        state.isCreatingOrder = false;
        state.error = action.payload as string;
      })
      
      // Verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.isVerifyingPayment = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isVerifyingPayment = false;
        state.paymentSuccess = action.payload.success;
        state.successOrderId = action.payload.order_id;
        state.error = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isVerifyingPayment = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setStep,
  setShippingAddress,
  setAddressId,
  setSelectedShipping,
  clearCheckout,
  setPaymentSuccess,
  clearError,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;

