import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Package, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../store';
import CartService from '../services/cartService';
import { updateCartQueries } from '../hooks/queries/useCart';
import { queryKeys } from '../lib/queryClient';
import { clearCheckout } from '../store/slices/checkoutSlice';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [isVisible, setIsVisible] = useState(false);
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsVisible(true);
    
    // Clear cart and sync state as a fallback (in case it wasn't cleared in payment handler)
    const clearCartAndSync = async () => {
      try {
        const clearedCart = await CartService.clearCart();
        // Update all cart queries and Redux state
        updateCartQueries(queryClient, clearedCart, dispatch);
        // Invalidate queries to ensure fresh data
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
        // Clear checkout state
        dispatch(clearCheckout());
      } catch (error) {
        console.error('Failed to clear cart on order success:', error);
      }
    };
    
    clearCartAndSync();
  }, [queryClient, dispatch]);

  const handleViewOrders = () => {
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-beige-50 to-green-50 flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white/95 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-100/30 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-beige-200/30 rounded-full translate-y-24 -translate-x-24 blur-3xl"></div>
          </div>

          <div className="relative z-10 p-8 md:p-12">
            {/* Success Icon with Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.2, 
                type: "spring", 
                damping: 15, 
                stiffness: 200 
              }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                {/* Outer glow ring */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-green-400 rounded-full blur-xl"
                />
                
                {/* Main icon container */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-white" strokeWidth={2.5} />
                </div>

                {/* Sparkle effects */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [0, Math.cos(i * 60 * Math.PI / 180) * 40],
                      y: [0, Math.sin(i * 60 * Math.PI / 180) * 40]
                    }}
                    transition={{ 
                      delay: 0.5 + i * 0.1,
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <Sparkles className="w-4 h-4 text-green-400" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-green-800 mb-3">
                Payment Verified! ✅
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-2">
                Your order has been created successfully
              </p>
              {orderId && (
                <div className="mt-4 inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                  <Package className="w-5 h-5 text-green-600" />
                  <span className="text-sm sm:text-base font-medium text-green-800">
                    Order ID: <span className="font-semibold">{orderId}</span>
                  </span>
                </div>
              )}
            </motion.div>

            {/* Success Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-gradient-to-br from-green-50 to-beige-50 rounded-2xl p-6 mb-8 border border-green-100"
            >
              <div className="space-y-3 text-center">
                <p className="text-gray-700 text-sm sm:text-base">
                  🎉 Thank you for your purchase!
                </p>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Your order is being processed and you will receive a confirmation email shortly.
                </p>
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={handleViewOrders}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>View My Orders</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="flex-1 border-2 border-green-600 text-green-600 hover:bg-green-50 font-heading font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center"
              >
                Continue Shopping
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;

