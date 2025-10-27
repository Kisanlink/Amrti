import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, User, LogIn } from 'lucide-react';
import CartService from '../../services/cartService';
import AuthService from '../../services/authService';

interface CartItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

const GuestCartTest: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample products for testing
  const sampleProducts = [
    {
      id: '1',
      name: 'Moringa Powder',
      price: 299,
      image_url: '/products/moringa-powder.jpg'
    },
    {
      id: '2', 
      name: 'Amla Powder',
      price: 199,
      image_url: '/products/amla-powder.jpg'
    },
    {
      id: '3',
      name: 'Ashwagandha Powder', 
      price: 399,
      image_url: '/products/ashwagandha-powder.jpg'
    }
  ];

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = AuthService.isAuthenticated();
      setIsAuthenticated(isAuth);
    };

    checkAuth();

    // Listen for auth state changes
    const handleAuthChange = () => {
      checkAuth();
      loadCart(); // Reload cart when auth state changes
    };

    window.addEventListener('userLoggedIn', handleAuthChange);
    window.addEventListener('userLoggedOut', handleAuthChange);

    return () => {
      window.removeEventListener('userLoggedIn', handleAuthChange);
      window.removeEventListener('userLoggedOut', handleAuthChange);
    };
  }, []);

  // Load cart data
  const loadCart = async () => {
    try {
      setLoading(true);
      const cart = await CartService.getCart();
      
      // Handle both authenticated and guest cart types
      if ('items' in cart) {
        setCartItems(cart.items as CartItem[]);
        setCartTotal(cart.total_price || 0);
        setCartCount(cart.total_items || 0);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load cart on component mount
  useEffect(() => {
    loadCart();
  }, []);

  // Add item to cart
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      setLoading(true);
      await CartService.addItem(productId, quantity);
      await loadCart(); // Reload cart after adding
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      await CartService.updateItemQuantity(productId, quantity);
      await loadCart(); // Reload cart after updating
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (productId: string) => {
    try {
      setLoading(true);
      await CartService.removeItem(productId);
      await loadCart(); // Reload cart after removing
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setLoading(true);
      await CartService.clearCart();
      await loadCart(); // Reload cart after clearing
    } catch (error) {
      console.error('Failed to clear cart:', error);
      alert('Failed to clear cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Cart Test ({isAuthenticated ? 'Authenticated' : 'Guest'})
          </h2>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 text-green-600">
                <User className="w-4 h-4" />
                <span className="text-sm">Logged In</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600">
                <LogIn className="w-4 h-4" />
                <span className="text-sm">Guest Mode</span>
              </div>
            )}
          </div>
        </div>

        {/* Sample Products */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Sample Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleProducts.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Product Image</span>
                </div>
                <h4 className="font-medium text-gray-800">{product.name}</h4>
                <p className="text-green-600 font-semibold">₹{product.price}</p>
                <button
                  onClick={() => addToCart(product.id, 1)}
                  disabled={loading}
                  className="w-full mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Items */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Cart Items ({cartCount})</h3>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                disabled={loading}
                className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add some products to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xs">IMG</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {item.product?.name || `Product ${item.product_id}`}
                      </h4>
                      <p className="text-sm text-gray-600">₹{item.unit_price} each</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        disabled={loading || item.quantity <= 1}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={loading}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">₹{item.total_price}</p>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.product_id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span className="text-green-600">₹{cartTotal}</span>
            </div>
            
            {!isAuthenticated && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Guest Mode:</strong> Your cart is saved locally. 
                  Login to save your cart permanently and access additional features!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">How to Test:</h4>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Add products to cart (works without login)</li>
            <li>2. Modify quantities or remove items</li>
            <li>3. Login to see cart migration in action</li>
            <li>4. Logout and login again to see persistent cart</li>
          </ol>
        </div>
      </motion.div>
    </div>
  );
};

export default GuestCartTest;
