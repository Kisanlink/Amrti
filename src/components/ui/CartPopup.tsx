import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, Truck, Gift, CreditCard, ThumbsUp, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import CartService from '../../services/cartService';
import type { Cart } from '../../services/cartService';
import { useNotification } from '../../context/NotificationContext';

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartPopup = ({ isOpen, onClose }: CartPopupProps) => {
  const [cart, setCart] = useState<Cart>({ 
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
  });
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Load cart on mount and when popup opens
  useEffect(() => {
    if (isOpen) {
      const loadCart = async () => {
        try {
          const currentCart = await CartService.getCart();
          console.log('Cart popup opened, cart data:', currentCart);
          setCart(currentCart);
        } catch (err) {
          console.error('Failed to load cart:', err);
          showNotification({
            type: 'error',
            message: 'Failed to load cart'
          });
        }
      };
      
      loadCart();
      
      // Ensure popup is properly positioned
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll when popup closes
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = async () => {
      if (isOpen) {
        try {
          const currentCart = await CartService.getCart();
          console.log('Cart updated, new cart data:', currentCart);
          setCart(currentCart);
        } catch (err) {
          console.error('Failed to refresh cart:', err);
        }
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [isOpen]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(productId);
    try {
      const updatedCart = await CartService.updateItemQuantity(productId, newQuantity);
      setCart(updatedCart);
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
      const updatedCart = await CartService.removeItem(productId);
      setCart(updatedCart);
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
    try {
      const updatedCart = await CartService.clearCart();
      setCart(updatedCart);
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
  };

  // Calculate progress for free shipping
  const freeShippingThreshold = 500;
  const currentTotal = cart.total_price;
  const progressPercentage = Math.min((currentTotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(freeShippingThreshold - currentTotal, 0);

    return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9998]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={onClose}
          />
          
          {/* Cart Popup */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[9999] flex flex-col"
            style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: '100%', maxWidth: '28rem' }}
          >
                         {/* Header */}
             <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between">
               <div>
                 <h2 className="text-xl font-bold">Shopping Cart</h2>
                 <p className="text-green-100 text-sm mt-1">
                   {cart.items.length === 0 
                     ? 'Your cart is empty' 
                     : `${cart.items.length} item${cart.items.length === 1 ? '' : 's'} in your cart`
                   }
                 </p>
               </div>
               <button
                 onClick={onClose}
                 className="p-2 hover:bg-white/20 rounded-full transition-all duration-200"
               >
                 <X size={24} />
               </button>
             </div>

                         {/* Progress Bar */}
             <div className="p-4 bg-gray-50 border-b">
               <div className="text-center mb-3">
                 <p className="text-sm text-gray-700">
                   {cart.items.length === 0 
                     ? 'Add items to your cart to unlock free shipping!'
                     : `Just ₹${remainingForFreeShipping} away from FREE Shipping`
                   }
                 </p>
               </div>
              
              {/* Progress Bar */}
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div 
                  className="absolute top-0 left-0 h-full bg-green-600 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              
              {/* Milestones */}
              <div className="flex justify-center text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <Truck size={12} />
                  <span>Free Shipping</span>
                </div>
              </div>
            </div>

                                      {/* Cart Items */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {cart.items.length === 0 ? (
                 <div className="text-center py-12">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                     </svg>
                   </div>
                   <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                   <p className="text-gray-500 mb-6">Add some amazing products to get started</p>
                   <button
                     onClick={() => {
                       onClose();
                       window.location.href = '/products';
                     }}
                     className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                   >
                     Start Shopping
                   </button>
                 </div>
               ) : (
                 cart.items.map((item) => (
                   <div key={item.id} className="relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                                         <div className="flex space-x-4">
                       {/* Product Image */}
                       <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                         <img 
                           src={item.product?.image_url || '/placeholder-product.jpg'} 
                           alt={item.product?.name || 'Product'} 
                           className="w-full h-full object-cover"
                         />
                       </div>
                       
                       {/* Product Details */}
                       <div className="flex-1 min-w-0">
                         <div className="flex items-start justify-between mb-2">
                           <div className="flex-1 min-w-0">
                             <h3 className="font-semibold text-gray-900 text-base truncate">
                               {item.product?.name || 'Product Name'}
                             </h3>
                             <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                               {item.product?.description || 'Superfood | Chemical & Preservative Free - Lab Tested'}
                             </p>
                           </div>
                           <button
                             onClick={() => handleRemoveItem(item.product_id)}
                             className="ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                         
                         {/* Quantity and Price */}
                         <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                             <span className="text-sm text-gray-500">Qty:</span>
                             <div className="flex items-center bg-gray-50 rounded-lg">
                               <button
                                 onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                 disabled={isUpdating === item.id}
                                 className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 rounded-l-lg transition-colors"
                               >
                                 <Minus size={14} />
                               </button>
                               <span className="px-3 py-1 text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                                 {isUpdating === item.id ? '...' : item.quantity}
                               </span>
                               <button
                                 onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                 disabled={isUpdating === item.id}
                                 className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 rounded-r-lg transition-colors"
                               >
                                 <Plus size={14} />
                               </button>
                             </div>
                           </div>
                           <div className="text-right">
                             <span className="text-lg font-bold text-gray-900">
                               ₹{item.unit_price * item.quantity}
                             </span>
                             {item.quantity > 1 && (
                               <p className="text-xs text-gray-500">₹{item.unit_price} each</p>
                             )}
                           </div>
                         </div>
                       </div>
                     </div>
                  </div>
                ))
              )}
            </div>

                         {/* Footer */}
             <div className="border-t bg-white p-6 space-y-4">
               {/* Order Summary */}
               {cart.items.length > 0 && (
                 <div className="space-y-2 pb-4 border-b border-gray-100">
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-600">Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                     <span className="font-semibold">₹{cart.total_price}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-600">Shipping</span>
                     <span className={cart.total_price > 500 ? 'text-green-600 font-semibold' : 'font-semibold'}>
                       {cart.total_price > 500 ? 'FREE' : '₹50'}
                     </span>
                   </div>
                   {cart.discount_amount > 0 && (
                     <div className="flex justify-between text-sm">
                       <span className="text-gray-600">Discount</span>
                       <span className="text-green-600 font-semibold">-₹{cart.discount_amount}</span>
                     </div>
                   )}
                   <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                     <span>Total</span>
                     <span>₹{cart.total_price + (cart.total_price > 500 ? 0 : 50) - cart.discount_amount}</span>
                   </div>
                 </div>
               )}
               
               {/* Checkout Button */}
               <button
                 onClick={() => {
                   onClose();
                   window.location.href = '/checkout';
                 }}
                 disabled={cart.items.length === 0}
                 className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                   cart.items.length === 0
                     ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                     : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                 }`}
               >
                 {cart.items.length === 0 ? 'CART EMPTY' : 'PROCEED TO CHECKOUT'}
               </button>
               
               {/* Trust Badges */}
               <div className="grid grid-cols-3 gap-2 pt-4">
                 <div className="flex flex-col items-center text-center">
                   <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-1">
                     <CreditCard size={12} className="text-green-600" />
                   </div>
                   <span className="text-xs text-gray-600 font-medium">Secure Payment</span>
                 </div>
                 <div className="flex flex-col items-center text-center">
                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                     <ThumbsUp size={12} className="text-blue-600" />
                   </div>
                   <span className="text-xs text-gray-600 font-medium">Quality Assured</span>
                 </div>
                 <div className="flex flex-col items-center text-center">
                   <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                     <User size={12} className="text-orange-600" />
                   </div>
                   <span className="text-xs text-gray-600 font-medium">Farmer Support</span>
                 </div>
               </div>
             </div>
                     </motion.div>
         </>
       )}
     </AnimatePresence>,
     document.body
   );
 };

export default CartPopup; 