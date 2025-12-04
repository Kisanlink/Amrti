import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import LoginRequiredModal from '../components/ui/LoginRequiredModal';
import AuthService from '../services/authService';
import { 
  useCheckoutState, 
  useCreateMagicCheckoutOrder
} from '../hooks/queries/useCheckout';
import CartService from '../services/cartService';
import { queryKeys } from '../lib/queryClient';
import { useQuery } from '@tanstack/react-query';

const CheckoutMagic: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  
  // Redux state
  const checkoutState = useCheckoutState();
  
  // React Query hooks
  const createOrderMutation = useCreateMagicCheckoutOrder();
  
  // Fetch cart data directly - use the same query key as the main cart query
  // IMPORTANT: Keep query enabled when authenticated to ensure cart is always available
  const isAuthenticated = AuthService.isAuthenticated();
  const { data: cart, isLoading: isLoadingCart, refetch: refetchCart } = useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: async () => {
      const cartData = await CartService.getCart();
      console.log('Cart fetched for checkout:', cartData);
      return cartData;
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: 3, // Increased retries
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
  
  // Local state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWaitingForCart, setIsWaitingForCart] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      setShowLoginModal(true);
    }
  }, []);

  // Ensure cart query is active when authenticated - MUST be before any conditional returns
  useEffect(() => {
    if (isAuthenticated && !isLoadingCart && !cart) {
      console.log('Cart data missing for authenticated user, refetching...');
      refetchCart();
    }
  }, [isAuthenticated, isLoadingCart, cart, refetchCart]);

  // Listen for user login events to refresh cart
  useEffect(() => {
    const handleUserLogin = async () => {
      setIsWaitingForCart(true);
      setShowLoginModal(false);
      
      // Wait for cart migration to complete (migration happens before event is dispatched, but give extra time)
      setTimeout(async () => {
        try {
          // Invalidate and refetch cart multiple times to ensure we get the migrated cart
          queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
          
          // Retry fetching cart up to 5 times with increasing delays
          let cartFetched = false;
          let cartData: any = null;
          
          for (let i = 0; i < 5; i++) {
            try {
              const cartResult = await refetchCart();
              cartData = cartResult.data as any;
              
              // Check if cart has items
              const totalItems = cartData?.total_items || (cartData as any)?.items_count || 0;
              const items = cartData?.items || [];
              
              if (cartData && totalItems > 0 && items.length > 0) {
                console.log(`Cart successfully loaded after login (attempt ${i + 1}):`, cartData);
                cartFetched = true;
                break;
              } else {
                console.log(`Cart fetch attempt ${i + 1}: Cart exists but empty or no items`, cartData);
              }
            } catch (err) {
              console.warn(`Cart fetch attempt ${i + 1} failed:`, err);
            }
            
            // Wait before next retry (increasing delay)
            await new Promise(resolve => setTimeout(resolve, 1000 + (i * 500)));
          }
          
          setIsWaitingForCart(false);
          
          if (!cartFetched) {
            console.warn('Cart still empty after login, user may need to refresh');
            setError('Cart migration may still be in progress. Please wait a moment and try again, or refresh the page.');
            showNotification({
              type: 'error',
              message: 'Cart migration is taking longer than expected. Please refresh the page.',
            });
          } else {
            setError(null);
            console.log('Cart migration complete, ready for checkout');
          }
        } catch (err: any) {
          setIsWaitingForCart(false);
          console.error('Failed to refresh cart after login:', err);
          setError('Failed to load cart after login. Please refresh the page.');
        }
      }, 2000); // Increased initial wait time to 2 seconds
    };

    window.addEventListener('userLoggedIn', handleUserLogin as EventListener);

    // Also check if user becomes authenticated while on this page
    const checkAuthInterval = setInterval(() => {
      if (AuthService.isAuthenticated() && showLoginModal) {
        handleUserLogin();
      }
    }, 500);

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin as EventListener);
      clearInterval(checkAuthInterval);
    };
  }, [showLoginModal, refetchCart, queryClient]);

  // Handle Magic Checkout button click
  const handleMagicCheckout = async () => {
    // Check authentication
    if (!AuthService.isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    // Check if we're still waiting for cart migration
    if (isWaitingForCart) {
      showNotification({
        type: 'info',
        message: 'Please wait for cart to load after login...',
      });
      return;
    }

    // Validate cart - refresh first to ensure we have latest data
    try {
      setError(null);
      
      // First, ensure cart query is enabled and fetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      
      // Fetch cart directly from service with retries
      let directCart: any = null;
      let retryCount = 0;
      const maxRetries = 8; // Increased retries
      
      while (retryCount < maxRetries) {
        try {
          directCart = await CartService.getCart();
          console.log(`Direct cart fetch (attempt ${retryCount + 1}):`, directCart);
          
          // Check if cart has items
          const totalItems = directCart?.total_items || (directCart as any)?.items_count || 0;
          const items = directCart?.items || [];
          
          if (directCart && totalItems > 0 && items.length > 0) {
            console.log('Cart validated with items:', totalItems, 'items');
            break; // Cart is valid, exit retry loop
          } else {
            console.log(`Cart fetch attempt ${retryCount + 1}: Cart exists but empty (items: ${items.length}, totalItems: ${totalItems})`);
          }
        } catch (err) {
          console.warn(`Cart fetch attempt ${retryCount + 1} failed:`, err);
        }
        
        retryCount++;
        
        // Wait before next retry (increasing delay)
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 + (retryCount * 300)));
        }
      }
      
      // Final validation
      const totalItems = directCart?.total_items || (directCart as any)?.items_count || 0;
      const items = directCart?.items || [];
      
      if (!directCart || totalItems === 0 || items.length === 0) {
        const errorMsg = 'Your cart appears to be empty. This may happen if cart migration is still in progress. Please wait a moment and try again, or refresh the page.';
        setError(errorMsg);
        showNotification({
          type: 'error',
          message: errorMsg,
        });
        return;
      }
      
      console.log('Cart validated, proceeding with checkout. Items:', totalItems);

      // CRITICAL: Final verification - ensure cart data is still valid and update cache
      // This prevents race conditions where cart might be cleared between validation and API call
      queryClient.setQueryData(queryKeys.cart.all, directCart);
      
      // One more direct fetch right before API call to ensure backend has the cart
      try {
        const finalCartCheck = await CartService.getCart();
        const finalTotalItems = finalCartCheck?.total_items || (finalCartCheck as any)?.items_count || 0;
        const finalItems = finalCartCheck?.items || [];
        
        if (!finalCartCheck || finalTotalItems === 0 || finalItems.length === 0) {
          console.error('Final cart check failed - cart is empty on backend');
          throw new Error('Cart appears to be empty on the server. Please refresh the page and try again.');
        }
        
        console.log('Final cart verification passed:', { totalItems: finalTotalItems, itemsCount: finalItems.length });
        
        // Update cache with final cart data
        queryClient.setQueryData(queryKeys.cart.all, finalCartCheck);
      } catch (finalCheckError: any) {
        console.error('Final cart verification failed:', finalCheckError);
        throw new Error(finalCheckError.message || 'Cart verification failed. Please refresh and try again.');
      }

      // Create Magic Checkout order - this will automatically open the modal
      await createOrderMutation.mutateAsync();
    } catch (err: any) {
      console.error('Checkout error:', err);
      const errorMessage = err.message || 'Failed to start checkout. Please try again.';
      setError(errorMessage);
      showNotification({
        type: 'error',
        message: errorMessage,
      });
      
      // If error is about empty cart, suggest refresh
      if (errorMessage.includes('empty') || errorMessage.includes('Cart is empty')) {
        showNotification({
          type: 'error',
          message: 'Cart appears empty. This may be due to migration delay. Please refresh the page and try again.',
        });
      }
    }
  };

  // Verifying payment state - show verifying UI instead of checkout page
  if (checkoutState.isVerifyingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-beige-50 to-green-50 flex items-center justify-center pt-24 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white/95 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12">
            {/* Animated Spinner */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-6"
            >
              <div className="relative w-full h-full">
                <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full"></div>
              </div>
            </motion.div>

            {/* Verifying Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 mb-3">
                Verifying Payment...
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-6">
                Please wait while we verify your payment. This may take a few moments.
              </p>
            </motion.div>

            {/* Animated Dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center space-x-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                  className="w-2 h-2 bg-green-600 rounded-full"
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading state - show loading if cart is loading OR if we're waiting for cart after login
  if (isLoadingCart || isWaitingForCart) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {isWaitingForCart ? 'Migrating your cart after login...' : 'Loading cart...'}
          </p>
          {isWaitingForCart && (
            <p className="text-sm text-gray-500 mt-2">Please wait, this may take a few seconds</p>
          )}
        </div>
      </div>
    );
  }

  const cartData = cart as any;
  const cartTotal = cartData?.total_price || 0;
  const discountAmount = cartData?.discount_amount || 0;
  const finalTotal = cartTotal - discountAmount;
  const cartItems = cartData?.items || [];
  const cartTotalItems = cartData?.total_items || (cartData as any)?.items_count || 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-6 sm:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-green-600 hover:text-green-700 mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Complete your purchase with Magic Checkout
          </p>
        </div>

        {/* Login Required Notice */}
        {!AuthService.isAuthenticated() && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800 mb-1">
                  Login Required
                </h3>
                <p className="text-sm text-blue-700">
                  Please login to continue with your checkout.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <ShoppingCart className="w-5 h-5 text-green-600 mr-2" />
                Order Summary
              </h2>

              {/* Cart Items */}
              {cartData && cartData.total_items > 0 && cartItems.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {cartItems.map((item: any) => {
                    // Get product name from various possible sources
                    const productName = item.product_name || 
                                      item.product?.name || 
                                      item.name ||
                                      `Product ${item.product_id?.slice(-4) || item.id?.slice(-4) || ''}`;
                    
                    // Get product image - handle both new (images array) and old (image_url) structures
                    let productImage: string | null = null;
                    if (item.product?.image_url) {
                      productImage = item.product.image_url;
                    } else if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
                      const primaryImage = item.product.images.find((img: any) => img.is_primary) || item.product.images[0];
                      productImage = primaryImage?.image_url || primaryImage?.url || null;
                    } else if (item.image_url) {
                      productImage = item.image_url;
                    }
                    
                    return (
                      <div key={item.id || item.product_id} className="flex items-center space-x-4 pb-4 border-b">
                        {/* Product Image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={productName}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.placeholder')) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'placeholder w-full h-full bg-gray-200 rounded-lg flex items-center justify-center';
                                  placeholder.innerHTML = '<span class="text-xs text-gray-400">📦</span>';
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-400">📦</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{productName}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">₹{item.total_price || 0}</p>
                          <p className="text-sm text-gray-600">₹{item.unit_price || 0} each</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No items in cart</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <button
                      onClick={() => refetchCart()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Refresh Cart
                    </button>
                    <button
                      onClick={() => navigate('/products')}
                      className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}

              {/* Order Total */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">₹{cartTotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-green-600">₹{finalTotal}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Checkout Button Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6 sticky top-24"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Complete Purchase
              </h3>

              <div className="mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="text-gray-900">{cartData?.total_items || 0}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-green-600">₹{finalTotal}</span>
                </div>
              </div>

              <button
                onClick={handleMagicCheckout}
                disabled={
                  createOrderMutation.isPending || 
                  !isAuthenticated ||
                  !cartData ||
                  cartTotalItems === 0 ||
                  cartItems.length === 0 ||
                  isWaitingForCart ||
                  isLoadingCart
                }
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Starting Checkout...</span>
                  </>
                ) : !AuthService.isAuthenticated() ? (
                  <span>Login to Continue</span>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Proceed to Checkout</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Magic Checkout handles address, shipping, and payment in one secure flow
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please login to continue with your checkout"
        redirectUrl="/checkout"
      />
    </div>
  );
};

export default CheckoutMagic;
