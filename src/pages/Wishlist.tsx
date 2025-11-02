import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Heart, ShoppingCart, Plus, Star, Truck, Shield, RotateCcw, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ScrollToTop from '../components/ui/ScrollToTop';
import CartService from '../services/cartService';
import { useWishlistWithPolling, useRemoveFromWishlist, useClearWishlist, type WishlistItem } from '../hooks/queries/useWishlist';
import { useNotification } from '../context/NotificationContext';

const Wishlist = () => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Use React Query hooks for wishlist data - ALWAYS fetches fresh on mount
  const { data: wishlist = [], isLoading: loading, error } = useWishlistWithPolling();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const clearWishlistMutation = useClearWishlist();

  // Debug: Log wishlist data when it changes
  useEffect(() => {
    console.log('Wishlist page - Data:', { 
      wishlist, 
      length: wishlist.length,
      loading,
      error,
      items: wishlist,
      isArray: Array.isArray(wishlist)
    });
  }, [wishlist, loading, error]);

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlistMutation.mutate(productId, {
      onSuccess: () => {
        showNotification({
          type: 'success',
          message: 'Product removed from wishlist'
        });
      },
      onError: () => {
        showNotification({
          type: 'error',
          message: 'Failed to remove from wishlist'
        });
      }
    });
  };

  const handleMoveToCart = async (productId: string) => {
    setIsProcessing(productId);
    try {
      // Add to cart
      await CartService.addItem(productId, 1);
      
      // Remove from wishlist
      removeFromWishlistMutation.mutate(productId, {
        onSuccess: () => {
          showNotification({
            type: 'success',
            message: 'Product moved to cart successfully!'
          });
        },
        onError: () => {
          showNotification({
            type: 'error',
            message: 'Failed to move to cart'
          });
        }
      });
    } catch (err) {
      console.error('Failed to move to cart:', err);
      showNotification({
        type: 'error',
        message: 'Failed to move to cart'
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      clearWishlistMutation.mutate(undefined, {
        onSuccess: () => {
          showNotification({
            type: 'success',
            message: 'Wishlist cleared successfully'
          });
        },
        onError: () => {
          showNotification({
            type: 'error',
            message: 'Failed to clear wishlist'
          });
        }
      });
    }
  };

  const handleAddAllToCart = async () => {
    try {
      setIsProcessing('all');
      
      // Add all wishlist items to cart
      for (const item of wishlist) {
        await CartService.addItem(item.product_id, 1);
      }
      
      // Clear wishlist
      clearWishlistMutation.mutate(undefined, {
        onSuccess: () => {
          showNotification({
            type: 'success',
            message: 'All items added to cart successfully!'
          });
        },
        onError: () => {
          showNotification({
            type: 'error',
            message: 'Failed to add all items to cart'
          });
        }
      });
    } catch (err) {
      console.error('Failed to add all to cart:', err);
      showNotification({
        type: 'error',
        message: 'Failed to add all items to cart'
      });
    } finally {
      setIsProcessing(null);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <>
        <ScrollToTop />
        <div className="pt-16 sm:pt-20 bg-beige-300 min-h-screen">
          <div className="container-custom py-12 sm:py-16">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <ScrollToTop />
        <div className="pt-16 sm:pt-20 bg-beige-300 min-h-screen">
          <div className="container-custom py-12 sm:py-16">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-4">Failed to load wishlist</div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (wishlist.length === 0) {
    return (
      <>
        <ScrollToTop />
        <div className="pt-16 sm:pt-20 bg-beige-300 min-h-screen">
        <div className="container-custom py-12 sm:py-16">
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <Heart className="w-16 h-16 sm:w-24 sm:h-24 text-green-600 mx-auto mb-4 sm:mb-6" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-black-900 mb-3 sm:mb-4">
                Your Wishlist is Empty
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-black-700 mb-6 sm:mb-8 px-4 sm:px-0">
                Start adding products to your wishlist to save them for later.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                to="/products"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span>Start Shopping</span>
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
              
              <div className="text-sm text-black-600">
                <p>Save your favorite products for later</p>
                <p>Get notified when prices drop</p>
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
        <div className="mb-8 text-center lg:text-left">
          <Link to="/products" className="inline-flex items-center space-x-2 text-black-700 hover:text-green-600 transition-colors duration-300 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-heading font-semibold">Continue Shopping</span>
          </Link>
          
          <h1 className="text-4xl font-heading font-bold text-black-900 mb-2">
            My Wishlist
          </h1>
          <p className="text-lg text-black-700">
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in your wishlist
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Wishlist Items */}
          <div className="lg:col-span-3">
            <div className="bg-white backdrop-blur-sm border border-beige-400/50 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-heading font-bold text-black-900">
                  Wishlist Items
                </h2>
                <button
                  onClick={handleClearWishlist}
                  className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Wishlist</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-beige-300/50 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {/* Product Image */}
                    <div className="relative">
                      <img
                        src={item.product?.image_url || '/placeholder-product.jpg'}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-48 object-contain bg-beige-100"
                      />
                      <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        {item.product?.category || 'Category'}
                      </div>
                                              <button
                          onClick={() => handleRemoveFromWishlist(item.product_id)}
                          className="absolute top-3 left-3 p-2 bg-red-500 text-white-50 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-heading font-semibold text-black-900 mb-2 truncate">
                        {item.product?.name || 'Product Name'}
                      </h3>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < 4 ? 'text-green-500 fill-current' : 'text-black-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-black-600">(4.8)</span>
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <span className="font-bold text-green-600">₹{item.product?.price || 0}</span>
                        {item.product?.actual_price && item.product?.actual_price > (item.product?.price || 0) && (
                          <span className="text-sm text-black-500 line-through">₹{item.product.actual_price}</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={() => handleMoveToCart(item.product_id)}
                          disabled={isProcessing === item.id}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {isProcessing === item.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                        
                        <Link
                          to={`/product/${item.product_id}`}
                          className="w-full border border-green-600 text-green-600 hover:bg-green-700 hover:text-white-50 font-heading font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                          <span>View Details</span>
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Wishlist Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white backdrop-blur-sm border border-beige-400/50 rounded-2xl shadow-xl p-6 sticky top-24">
              <h2 className="text-2xl font-heading font-bold text-black-900 mb-6">
                Wishlist Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-black-700">Total Items</span>
                  <span className="font-semibold">{wishlist.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-black-700">Total Value</span>
                  <span className="font-semibold">
                    ₹{wishlist.reduce((sum, item) => sum + (item.product?.price || 0), 0)}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleAddAllToCart}
                  disabled={isProcessing === 'all'}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing === 'all' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add All to Cart</span>
                    </>
                  )}
                </button>
                
                <Link
                  to="/products"
                  className="w-full border border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-heading font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add More Items</span>
                </Link>
              </div>

              {/* Features */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3 text-sm text-black-600">
                  <Heart className="w-4 h-4 text-green-600" />
                  <span>Save your favorites</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-black-600">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span>Free shipping available</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-black-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Secure shopping</span>
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
            <div className="bg-white backdrop-blur-sm border border-beige-400/50 rounded-xl p-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Plus className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-heading font-semibold text-black-900 mb-2">
                Discover More
              </h3>
              <p className="text-sm text-black-600 mb-3">
                Explore our premium natural powders
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

export default Wishlist; 