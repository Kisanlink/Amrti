import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Heart, Truck, Shield, RotateCcw, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ScrollToTop from '../components/ui/ScrollToTop';
import CartService from '../services/cartService';
import type { Cart as CartType } from '../services/cartService';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartType>({ 
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const cartData = await CartService.getCart();
        console.log('Cart data received in component:', cartData);
        console.log('Cart items with products:', cartData.items);
        setCart(cartData);
      } catch (err) {
        console.error('Failed to load cart:', err);
        setError('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };
    
    loadCart();
  }, []);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(productId);
    try {
      const updatedCart = await CartService.updateItemQuantity(productId, newQuantity);
      setCart(updatedCart);
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Failed to update quantity');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const updatedCart = await CartService.removeItem(productId);
      setCart(updatedCart);
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        const updatedCart = await CartService.clearCart();
        setCart(updatedCart);
      } catch (err) {
        console.error('Failed to clear cart:', err);
        setError('Failed to clear cart');
      }
    }
  };

  // Calculate shipping cost
  const shippingCost = cart.total_price > 500 ? 0 : 50;
  
  // Calculate total
  const total = cart.total_price + shippingCost - cart.discount_amount;

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
        <div className="pt-16 sm:pt-20 bg-beige-300 min-h-screen">
          <div className="container-custom py-12 sm:py-16">
            <div className="text-center">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

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
            {cart.total_items} item{cart.total_items !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Free Shipping Banner */}
        {cart.total_price < 500 && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800 font-medium">
              Just ₹{500 - cart.total_price} away from FREE Shipping!
            </p>
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
                {cart.items.map((item) => (
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
                      
                      {/* Debug info - remove this later */}
                      <div className="text-xs text-gray-500 mb-2">
                        <p>Product ID: {item.product_id}</p>
                        <p>Has product object: {item.product ? 'Yes' : 'No'}</p>
                        {item.product && (
                          <p>Product name: {item.product.name}</p>
                        )}
                      </div>

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
                  <span className="text-black-700 text-sm sm:text-base">Subtotal ({cart.total_items} items)</span>
                  <span className="font-semibold text-sm sm:text-base">₹{cart.total_price}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-black-700 text-sm sm:text-base">Shipping</span>
                  <span className="font-semibold text-sm sm:text-base">
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                  </span>
                </div>

                {cart.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm sm:text-base">Discount</span>
                    <span className="font-semibold text-sm sm:text-base">-₹{cart.discount_amount}</span>
                  </div>
                )}
                
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