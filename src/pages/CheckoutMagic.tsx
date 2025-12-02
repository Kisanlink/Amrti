import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShoppingCart,
  CheckCircle
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import LoginRequiredModal from '../components/ui/LoginRequiredModal';
import AuthService from '../services/authService';
import { 
  useCheckoutState, 
  usePrepareCheckout, 
  useCreateMagicCheckoutOrder,
  useCheckoutActions 
} from '../hooks/queries/useCheckout';
import CartService from '../services/cartService';

const CheckoutMagic: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // Redux state
  const checkoutState = useCheckoutState();
  const { setStep, clearCheckout } = useCheckoutActions();
  
  // React Query hooks
  const { refetch: prepareCheckout, isLoading: isPreparing } = usePrepareCheckout();
  const createOrderMutation = useCreateMagicCheckoutOrder();
  
  // Local state
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Initialize checkout on mount
  useEffect(() => {
    const initializeCheckout = async () => {
      // Check authentication
      if (!AuthService.isAuthenticated()) {
        setShowLoginModal(true);
        return;
      }

      try {
        // Prepare checkout to validate cart
        await prepareCheckout();
      } catch (err: any) {
        setError(err.message || 'Failed to prepare checkout');
      }
    };

    initializeCheckout();

    // Cleanup on unmount
    return () => {
      clearCheckout();
    };
  }, []);

  // Handle Magic Checkout button click
  const handleMagicCheckout = async () => {
    // Check authentication
    if (!AuthService.isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    // Validate cart
    if (!checkoutState.checkoutData?.cart || checkoutState.checkoutData.cart.total_items === 0) {
      setError('Your cart is empty. Please add items to cart.');
      showNotification({
        type: 'error',
        message: 'Your cart is empty. Please add items to cart.',
      });
      navigate('/cart');
      return;
    }

    // Show validation warnings if any
    if (checkoutState.checkoutData.validation_issues && checkoutState.checkoutData.validation_issues.length > 0) {
      const warnings = checkoutState.checkoutData.validation_issues
        .map(issue => `${issue.product_id}: ${issue.issue}`)
        .join(', ');
      showNotification({
        type: 'warning',
        message: `Some items have been updated: ${warnings}`,
      });
    }

    try {
      setError(null);
      // Create Magic Checkout order - this will automatically open the modal
      await createOrderMutation.mutateAsync();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start checkout. Please try again.';
      setError(errorMessage);
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  // Loading state
  if (isPreparing) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !checkoutState.checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/cart')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  const cart = checkoutState.checkoutData?.cart;
  const cartTotal = cart?.total_price || 0;
  const discountAmount = cart?.discount_amount || 0;
  const finalTotal = cartTotal - discountAmount;

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

        {/* Validation Warnings */}
        {checkoutState.checkoutData?.validation_issues && 
         checkoutState.checkoutData.validation_issues.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Cart Updated
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {checkoutState.checkoutData.validation_issues.map((issue, index) => (
                    <li key={index}>
                      • {issue.issue} {issue.new_price && `(New price: ₹${issue.new_price})`}
                    </li>
                  ))}
                </ul>
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
              {cart?.items && cart.items.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-4 pb-4 border-b">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product_name || 'Product'}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{item.total_price}</p>
                        <p className="text-sm text-gray-600">₹{item.unit_price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No items in cart</p>
                  <button
                    onClick={() => navigate('/products')}
                    className="mt-4 text-green-600 hover:text-green-700"
                  >
                    Continue Shopping
                  </button>
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
                  <span className="text-gray-900">{cart?.total_items || 0}</span>
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
                  !AuthService.isAuthenticated() ||
                  !cart ||
                  cart.total_items === 0
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

