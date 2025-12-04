import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Heart, Truck, Shield, RotateCcw, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ScrollToTop from '../components/ui/ScrollToTop';
import { useCartWithPolling, useRemoveFromCart, useIncrementCartItem, useDecrementCartItem, useClearCart } from '../hooks/queries/useCart';
import { useNotification } from '../context/NotificationContext';


const Cart = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Use React Query hooks for cart data - updates via cache invalidation from mutations
  const { data: cartData, isLoading: loading, error: cartError } = useCartWithPolling();
  const removeFromCartMutation = useRemoveFromCart();
  const incrementMutation = useIncrementCartItem();
  const decrementMutation = useDecrementCartItem();
  const clearCartMutation = useClearCart();

  // Normalize cart data for component use - ensure we always have valid data
  const cart = cartData || null;
  
  // Handle both Cart and GuestCart types - ensure we check data properly
  const totalItems = cart ? (cart.total_items || (cart as any)?.items_count || 0) : 0;
  const cartItems = cart ? (cart.items || []) : [];
  
  const error = cartError ? 'Failed to load cart' : null;
  
  // Cart page automatically polls every 1 second - no need for event listeners

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (!cart || !cartItems.length) return;
    
    setIsUpdating(productId);
    try {
      // Find current quantity
      const currentItem = cartItems.find((item: any) => item.product_id === productId);
      const currentQuantity = currentItem?.quantity || 0;
      
      // Use increment or decrement mutation based on new quantity
      if (newQuantity > currentQuantity) {
        await incrementMutation.mutateAsync(productId);
      } else {
        await decrementMutation.mutateAsync(productId);
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
      showNotification({
        type: 'error',
        message: 'Failed to update quantity'
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCartMutation.mutateAsync(productId);
      showNotification({
        type: 'success',
        message: 'Item removed from cart'
      });
    } catch (err) {
      console.error('Failed to remove item:', err);
      showNotification({
        type: 'error',
        message: 'Failed to remove item'
      });
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCartMutation.mutateAsync();
        showNotification({
          type: 'success',
          message: 'Cart cleared successfully'
        });
      } catch (err) {
        console.error('Failed to clear cart:', err);
        showNotification({
          type: 'error',
          message: 'Failed to clear cart'
        });
      }
    }
  };

  // Calculate shipping cost - Free shipping by default
  const shippingCost = 0;
  
  // Calculate total - use discounted_total if available, otherwise calculate manually
  const total = cart && ('discounted_total' in cart ? cart.discounted_total : null) 
    || (cart ? ((cart as any).final_price || cart.total_price + shippingCost - (cart.discount_amount || 0)) : 0);

  if (loading) {
    return (
      <>
        <ScrollToTop />
        <div className="pt-16 sm:pt-20 bg-beige-300 min-h-screen">
          <div className="container-custom py-12 sm:py-16">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-lg text-black-700">Loading your cart...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ScrollToTop />
        <div className="pt-16 sm:pt-20 bg-gray-50 min-h-screen">
          <div className="container-custom py-12 sm:py-16">
            <div className="text-center max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-100"
              >
                {/* Error Icon */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
                </div>
                
                {/* Error Message */}
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 mb-3">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  We're having trouble loading your cart. Don't worry, your items are safe!
                </p>
                
                {/* Try Again Button */}
                <button 
                  onClick={() => window.location.reload()} 
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-heading font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-base mb-4"
                >
                  <span>Try Again</span>
                  <RotateCcw className="w-5 h-5" />
                </button>
                
                {/* Alternative Action */}
                <div className="pt-4 border-t border-gray-100">
                  <Link
                    to="/products"
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    Continue Shopping →
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!cart || totalItems === 0 || cartItems.length === 0) {
    return (
      <>
        <ScrollToTop />
        <div className="pt-16 sm:pt-20 bg-gray-50 min-h-screen">
          <div className="container-custom py-12 sm:py-16">
            <div className="text-center max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-100"
              >
                {/* Cart Icon */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                
                {/* Title and Description */}
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 mb-3">
                  Your Cart is Empty
                </h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Looks like you haven't added any products to your cart yet. Start exploring our amazing collection of natural products!
                </p>
                
                {/* View Products Button */}
                <Link
                  to="/products"
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-heading font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-base"
                >
                  <span>View Products</span>
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </Link>
                
                {/* Benefits */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <Truck className="w-4 h-4 text-green-600" />
                      <span>Free shipping on all orders</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Award className="w-4 h-4 text-green-600" />
                      <span>Premium quality natural products</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Secure and trusted shopping</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <div className="pt-16 sm:pt-20 bg-beige-300 min-h-screen">
      <div className="container-custom py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center lg:text-left">
          <Link to="/products" className="inline-flex items-center space-x-2 text-black-700 hover:text-green-600 transition-colors duration-300 mb-3 sm:mb-4">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-heading font-semibold text-sm sm:text-base">Continue Shopping</span>
          </Link>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-black-900 mb-1 sm:mb-2">
            Shopping Cart
          </h1>
          <p className="text-base sm:text-lg text-black-700">
            {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-black-900 mb-4 sm:mb-6">
                Cart Items
              </h2>

              <div className="space-y-4 sm:space-y-6">
                {cartItems.map((item: any) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex-shrink-0 mx-auto sm:mx-0">
                      <img
                        src={item.product?.image_url || '/placeholder-product.jpg'}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-black-900 mb-1 sm:mb-2 truncate text-sm sm:text-base">
                        {item.product?.name || `Product ${item.product_id}`}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-black-600 mb-2 sm:mb-3">
                        {item.product?.category || 'Category'} | {item.product?.description?.substring(0, 50) || 'Description'}...
                        {!item.product && <span className="text-red-500"> (Product details not loaded)</span>}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs sm:text-sm text-black-600">Qty:</span>
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                            disabled={isUpdating === item.product_id || item.quantity <= 1}
                            className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <span className="px-2 py-1 border border-gray-300 rounded min-w-[2rem] text-center text-xs sm:text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                            disabled={isUpdating === item.product_id}
                            className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="font-semibold text-green-600 text-sm sm:text-base">₹{item.unit_price} each</p>
                          <p className="text-xs sm:text-sm text-black-600">Total: ₹{item.total_price}</p>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.product_id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-end sm:self-auto"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Clear Cart Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Cart</span>
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 sticky top-24">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-black-900 mb-4 sm:mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between">
                  <span className="text-black-700 text-sm sm:text-base">Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-sm sm:text-base">₹{cart?.total_price || (cart as any)?.final_price || 0}</span>
                </div>
                
                {(() => {
                  const discountAmount = cart?.discount_amount ?? (cart as any)?.discount_amount ?? 0;
                  return discountAmount > 0 ? (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm sm:text-base">Discount</span>
                      <span className="font-semibold text-sm sm:text-base">-₹{discountAmount}</span>
                    </div>
                  ) : null;
                })()}
                
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <div className="flex justify-between text-base sm:text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading font-semibold py-3 sm:py-4 rounded-lg transition-all duration-300 mb-3 sm:mb-4 text-sm sm:text-base"
              >
                PROCEED TO CHECKOUT
              </button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-xs text-black-600">
                <div>
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-600" />
                  <span className="text-xs">Secure Payment</span>
                </div>
                <div>
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-600" />
                  <span className="text-xs">Quality Assured</span>
                </div>
                <div>
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-600" />
                  <span className="text-xs">Farmer Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Cart; 