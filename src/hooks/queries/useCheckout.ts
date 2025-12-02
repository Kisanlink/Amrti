import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkoutApi } from '../../services/checkoutService';
import type { ShippingAddress, PaymentVerificationRequest } from '../../services/checkoutService';
import {
  prepareCheckout,
  estimateShipping,
  createMagicCheckoutOrder,
  verifyPayment,
  setStep,
  setShippingAddress,
  setAddressId,
  setSelectedShipping,
  clearCheckout,
  setPaymentSuccess,
} from '../../store/slices/checkoutSlice';
import type { AppDispatch, RootState } from '../../store';
import AuthService from '../../services/authService';

// Hook to get checkout state from Redux
export const useCheckoutState = () => {
  return useSelector((state: RootState) => state.checkout);
};

// Hook to prepare checkout
export const usePrepareCheckout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['checkout', 'prepare'],
    queryFn: async () => {
      const result = await dispatch(prepareCheckout());
      if (prepareCheckout.fulfilled.match(result)) {
        return result.payload;
      }
      throw result.payload;
    },
    enabled: false, // Manual trigger only
    retry: 1,
  });
};

// Hook to estimate shipping
export const useEstimateShipping = () => {
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: async (address: ShippingAddress) => {
      const result = await dispatch(estimateShipping(address));
      if (estimateShipping.fulfilled.match(result)) {
        return result.payload;
      }
      throw result.payload;
    },
    onSuccess: (data) => {
      // Update Redux state with shipping options and address ID
      if (data) {
        // The Redux slice already handles this in extraReducers
      }
    },
  });
};

// Hook to create Magic Checkout order
export const useCreateMagicCheckoutOrder = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      // Call API directly instead of through Redux thunk for better error handling
      const orderData = await checkoutApi.createMagicCheckoutOrder();
      // Update Redux state
      dispatch({
        type: 'checkout/createMagicCheckoutOrder/fulfilled',
        payload: orderData,
      });
      return orderData;
    },
    onSuccess: (orderData) => {
      // Open Razorpay Magic Checkout modal
      if (orderData && typeof window !== 'undefined') {
        openMagicCheckoutModal(orderData, dispatch, navigate);
      }
    },
  });
};

// Hook to verify payment
export const useVerifyPayment = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (verificationData: PaymentVerificationRequest) => {
      const result = await dispatch(verifyPayment(verificationData));
      if (verifyPayment.fulfilled.match(result)) {
        return result.payload;
      }
      throw result.payload;
    },
    onSuccess: (data) => {
      if (data.success) {
        dispatch(setPaymentSuccess({ success: true, orderId: data.order_id }));
        // Redirect to success page
        navigate(`/order-success?order_id=${data.order_id}`);
      }
    },
  });
};

// Function to open Razorpay Magic Checkout modal
const openMagicCheckoutModal = async (
  orderData: any,
  dispatch: AppDispatch,
  navigate: (path: string) => void
) => {
  // Load Razorpay Magic Checkout script if not already loaded
  if (!(window as any).Razorpay) {
    await loadRazorpayScript('https://checkout.razorpay.com/v1/magic-checkout.js');
  }

  // Get auth token
  const token = await AuthService.getIdToken();

  const options = {
    key: orderData.key_id,
    order_id: orderData.order_id,
    
    // CRITICAL: Enable Magic Checkout
    one_click_checkout: true,
    show_coupons: true,
    
    // Handler for successful payment
    handler: async function(response: any) {
      try {
        // Verify payment on backend
        const verifyResponse = await fetch('http://localhost:8082/api/v1/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        const verifyResult = await verifyResponse.json();
        
        if (verifyResult.success) {
          dispatch(setPaymentSuccess({ success: true, orderId: verifyResult.order_id }));
          // Redirect to success page
          navigate(`/order-success?order_id=${verifyResult.order_id}`);
        } else {
          throw new Error(verifyResult.message || 'Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        dispatch(setPaymentSuccess({ success: false, orderId: null }));
        // Show error notification
        window.dispatchEvent(new CustomEvent('showNotification', {
          detail: {
            type: 'error',
            message: error.message || 'Payment verification failed. Please contact support.',
          },
        }));
      }
    },
    
    // Handle modal dismissal
    modal: {
      ondismiss: function() {
        console.log('Magic Checkout cancelled');
        // Optionally show a message or update state
      },
    },
    
    // Theme customization
    theme: {
      color: '#10B981', // Green color matching app theme
    },
  };

  try {
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('Failed to open Razorpay Magic Checkout:', error);
    throw new Error('Failed to open checkout. Please try again.');
  }
};

// Helper function to load Razorpay script
const loadRazorpayScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if ((window as any).Razorpay) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      // Wait for it to load
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')));
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.head.appendChild(script);
  });
};

// Export checkout actions for direct use
export const useCheckoutActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  return {
    setStep: (step: 'address' | 'shipping' | 'payment') => dispatch(setStep(step)),
    setShippingAddress: (address: ShippingAddress) => dispatch(setShippingAddress(address)),
    setAddressId: (id: string) => dispatch(setAddressId(id)),
    setSelectedShipping: (shipping: any) => dispatch(setSelectedShipping(shipping)),
    clearCheckout: () => dispatch(clearCheckout()),
    setPaymentSuccess: (data: { success: boolean; orderId?: string }) => dispatch(setPaymentSuccess(data)),
  };
};

