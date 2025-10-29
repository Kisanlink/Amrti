import { X, Trash2, Plus, Minus, Gift } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveFromCart, useIncrementCartItem, useDecrementCartItem, useApplyCoupon, useRemoveCoupon } from '../../hooks/queries/useCart';
import type { Cart } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartPopup = ({ isOpen, onClose }: CartPopupProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // TanStack Query hooks
  const { data: cart, isLoading, error } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const incrementCartItem = useIncrementCartItem();
  const decrementCartItem = useDecrementCartItem();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();

  // Available coupons
  const availableCoupons = [
    { code: 'DEAL5', discount: '5%' },
    { code: 'SAVE10', discount: '10%' }
  ];

  // Handle quantity update
  const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    try {
      await updateCartItem.mutateAsync({ productId, quantity: newQuantity });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart.mutateAsync(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  // Handle increment
  const handleIncrement = async (productId: string) => {
    try {
      await incrementCartItem.mutateAsync(productId);
    } catch (error) {
      console.error('Failed to increment item:', error);
    }
  };

  // Handle decrement
  const handleDecrement = async (productId: string) => {
    try {
      await decrementCartItem.mutateAsync(productId);
    } catch (error) {
      console.error('Failed to decrement item:', error);
    }
  };

  // Handle coupon application
  const handleApplyCoupon = async (couponToApply?: string) => {
    const codeToApply = couponToApply || couponCode.trim();
    if (!codeToApply) return;

      setIsApplyingCoupon(true);
    try {
      await applyCoupon.mutateAsync(codeToApply);
      setAppliedCoupon(codeToApply);
      setCouponCode('');
      showNotification({
        type: 'success',
        message: 'Coupon applied successfully!'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to apply coupon'
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon.mutateAsync();
      setAppliedCoupon(null);
      showNotification({
        type: 'success',
        message: 'Coupon removed successfully!'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to remove coupon'
      });
    }
  };

  // Handle checkout navigation
  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      showNotification({
        type: 'error',
        message: 'Your cart is empty'
      });
      return;
    }
    
    // Close the cart popup
    onClose();
    
    // Navigate to checkout page
    navigate('/checkout');
  };

  if (!isOpen) return null;

  // Loading state
  if (isLoading) {
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2">Loading cart...</span>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Error state
  if (error) {
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load cart</p>
            <button
            onClick={onClose}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Empty cart state
  if (!cart || cart.total_items === 0) {
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-gray-400" />
               </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some items to get started!</p>
               <button
                 onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
               >
              Continue Shopping
               </button>
             </div>
                   </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="relative w-full max-w-md bg-white shadow-lg flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
                   <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
                   </button>
                 </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                       {/* Product Image */}
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.product?.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  )}
                       </div>
                       
                       {/* Product Details */}
                       <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate text-sm">
                    {item.product?.name || 'Product'}
                             </h3>
                  <p className="text-xs text-gray-600">
                    ₹{item.unit_price} each
                  </p>
                         </div>
                         
                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                               <button
                    onClick={() => handleDecrement(item.product_id)}
                    disabled={decrementCartItem.isPending}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                               </button>
                  <span className="w-8 text-center font-medium text-sm">
                    {item.quantity}
                               </span>
                               <button
                    onClick={() => handleIncrement(item.product_id)}
                    disabled={incrementCartItem.isPending}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                               </button>
                             </div>

                {/* Price */}
                           <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">
                    ₹{item.total_price}
                  </p>
            </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.product_id)}
                  disabled={removeFromCart.isPending}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                   </div>
            ))}
                   </div>
                 </div>

               {/* Coupon Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <Gift className="w-4 h-4 text-green-600" />
            <span className="font-medium text-gray-900 text-sm">Apply Coupon</span>
                         </div>
          
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg mb-3">
              <span className="text-green-800 font-medium text-sm">
                Coupon: {appliedCoupon} applied
                         </span>
                       <button
                         onClick={handleRemoveCoupon}
                disabled={removeCoupon.isPending}
                className="text-red-600 hover:text-red-700 disabled:opacity-50 text-sm"
                       >
                Remove
                       </button>
                     </div>
                   ) : (
            <div className="flex space-x-2 mb-3">
                         <input
                           type="text"
                           value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                         />
                         <button
                           onClick={() => handleApplyCoupon()}
                           disabled={isApplyingCoupon || !couponCode.trim()}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                         >
                {isApplyingCoupon ? 'Applying...' : 'Apply'}
                         </button>
                 </div>
               )}
               
          {/* Available Coupons */}
          <div>
            <p className="text-xs text-gray-600 mb-2">Available coupons:</p>
            <div className="flex flex-wrap gap-1">
              {availableCoupons.map((coupon) => (
               <button
                  key={coupon.code}
                  onClick={() => handleApplyCoupon(coupon.code)}
                  disabled={isApplyingCoupon || appliedCoupon === coupon.code}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {coupon.code} - {coupon.discount}
               </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Subtotal ({cart.total_items} items)</span>
              <span className="font-medium text-sm">₹{cart.total_price}</span>
                   </div>
            {cart.discount_amount > 0 && (
              <div className="flex justify-between text-green-600 text-sm">
                <span>Discount</span>
                <span>-₹{cart.discount_amount}</span>
                 </div>
            )}
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>₹{'discounted_total' in cart ? cart.discounted_total : cart.total_price}</span>
                   </div>
                 </div>

          <div className="space-y-2">
            <button 
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Continue Shopping
            </button>
                 </div>
               </div>
             </div>
    </div>,
     document.body
   );
 };

export default CartPopup; 