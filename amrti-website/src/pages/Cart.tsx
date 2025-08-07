import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Heart, Truck, Shield, RotateCcw, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ScrollToTop from '../components/ui/ScrollToTop';
import { getCart, updateQuantity, removeFromCart, clearCart, Cart as CartType } from '../services/cartService';

const Cart = () => {
  const [cart, setCart] = useState<CartType>({ items: [], total: 0, subtotal: 0, discount: 0, shipping: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Load cart on mount
  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(productId);
    try {
      const updatedCart = updateQuantity(productId, newQuantity);
      setCart(updatedCart);
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Failed to update quantity');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = (productId: string) => {
    try {
      const updatedCart = removeFromCart(productId);
      setCart(updatedCart);
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item');
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        const updatedCart = clearCart();
        setCart(updatedCart);
      } catch (err) {
        console.error('Failed to clear cart:', err);
        setError('Failed to clear cart');
      }
    }
  };

  if (cart.items.length === 0) {
    return (
      <>
        <ScrollToTop />
        <div className="pt-16 sm:pt-20 bg-beige-300 min-h-screen">
        <div className="container-custom py-12 sm:py-16">
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <ShoppingBag className="w-16 h-16 sm:w-24 sm:h-24 text-green-600 mx-auto mb-4 sm:mb-6" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-black-900 mb-3 sm:mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-black-700 mb-6 sm:mb-8 px-4 sm:px-0">
                Looks like you haven't added any products to your cart yet.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                to="/products"
                className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
              >
                <span>Start Shopping</span>
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
              </Link>
              
              <div className="text-xs sm:text-sm text-black-600 px-4 sm:px-0">
                <p>Free shipping on orders over ₹500</p>
                <p>10% discount on orders over ₹1000</p>
              </div>
            </div>
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
      <div className="container-custom py-12 sm:py-16">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center lg:text-left">
          <Link to="/products" className="inline-flex items-center space-x-2 text-black-700 hover:text-green-600 transition-colors duration-300 mb-3 sm:mb-4">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-heading font-semibold text-sm sm:text-base">Continue Shopping</span>
          </Link>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-black-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-base sm:text-lg text-black-700">
            {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700"
          >
            {error}
          </motion.div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 rounded-2xl shadow-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-black-900">
                  Cart Items
                </h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 font-semibold text-xs sm:text-sm flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Clear Cart</span>
                </button>
              </div>

              <div className="space-y-6">
                {cart.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 bg-white rounded-xl border border-beige-300/50"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg bg-beige-100"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow min-w-0 text-center sm:text-left">
                      <h3 className="font-heading font-semibold text-black-900 mb-2 truncate text-base sm:text-lg">
                        {item.name}
                      </h3>
                      <p className="text-sm sm:text-base text-black-600 mb-3">
                        {item.category}
                      </p>
                      <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <span className="font-bold text-green-600 text-base sm:text-lg">₹{item.price}</span>
                        {item.originalPrice > item.price && (
                          <span className="text-sm sm:text-base text-black-500 line-through">₹{item.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-center sm:justify-start space-x-3 w-full sm:w-auto">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={isUpdating === item.id}
                        className="p-3 border border-black-300 rounded-lg hover:bg-black-100 transition-colors disabled:opacity-50 bg-white"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      
                      <span className="w-16 text-center font-semibold text-base min-w-[60px]">
                        {isUpdating === item.id ? '...' : item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={isUpdating === item.id}
                        className="p-3 border border-black-300 rounded-lg hover:bg-black-100 transition-colors disabled:opacity-50 bg-white"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors self-center sm:self-start"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 rounded-2xl shadow-xl p-6 sticky top-24">
              <h2 className="text-2xl font-heading font-bold text-black-900 mb-6">
                Order Summary
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-black-700">Subtotal</span>
                  <span className="font-semibold">₹{cart.subtotal}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-black-700">Shipping</span>
                  <span className="font-semibold">
                    {cart.shipping === 0 ? 'Free' : `₹${cart.shipping}`}
                  </span>
                </div>
                
                {cart.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{cart.discount}</span>
                  </div>
                )}
                
                <div className="border-t border-black-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{cart.total}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              {/* Features */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3 text-sm text-black-600">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span>Free shipping on orders over ₹500</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-black-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-black-600">
                  <RotateCcw className="w-4 h-4 text-green-600" />
                  <span>Easy returns</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-black-600">
                  <Award className="w-4 h-4 text-green-600" />
                  <span>Quality assured</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-heading font-bold text-black-900 mb-8">
            You Might Also Like
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Add recommended products here */}
            <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-xl p-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-heading font-semibold text-black-900 mb-2">
                Add More Products
              </h3>
              <p className="text-sm text-black-600 mb-3">
                Discover our premium natural powders
              </p>
              <Link
                to="/products"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold text-sm"
              >
                Browse Products
                <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Cart; 