import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Heart, ShoppingCart, Plus, Star, Truck, Shield, RotateCcw, Award, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ScrollToTop from '../components/ui/ScrollToTop';
import CartService from '../services/cartService';
import ProductService from '../services/productService';
import { useWishlistWithPolling, useRemoveFromWishlist, useClearWishlist, type WishlistItem } from '../hooks/queries/useWishlist';
import { useAddToCart } from '../hooks/queries/useCart';
import { useNotification } from '../context/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import type { Product } from '../context/AppContext';
import { getProductThumbnail } from '../components/ui/ProductMedia';

const Wishlist = () => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState<Record<string, Product>>({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  // Use React Query hooks for wishlist data - ALWAYS fetches fresh on mount
  const { data: wishlist = [], isLoading: loading, error } = useWishlistWithPolling();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const clearWishlistMutation = useClearWishlist();
  const addToCartMutation = useAddToCart();

  // Load cached product data from localStorage on mount
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem('wishlist_product_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        // Check if cache is still valid (24 hours)
        const cacheAge = Date.now() - (parsed.timestamp || 0);
        if (cacheAge < 24 * 60 * 60 * 1000) {
          setProductDetails(parsed.data || {});
        } else {
          // Clear expired cache
          localStorage.removeItem('wishlist_product_cache');
        }
      }
    } catch (err) {
      console.error('Failed to load cached product data:', err);
    }
  }, []);

  // Fetch product details for wishlist items that don't have product data
  useEffect(() => {
    const fetchMissingProductDetails = async () => {
      if (!wishlist || wishlist.length === 0) return;

      // Find items that need product details
      // Check if product has image_url OR images array with valid images
      const missingProductIds = wishlist
        .filter(item => {
          const hasImage = item.product?.image_url || 
                         (item.product?.images && Array.isArray(item.product.images) && 
                          item.product.images.some((img: any) => img.image_url && img.is_active !== false));
          return !hasImage && !productDetails[item.product_id];
        })
        .map(item => item.product_id);

      if (missingProductIds.length === 0) return;

      setLoadingProducts(true);
      console.log('Fetching missing product details for:', missingProductIds);

      try {
        // Fetch product details in parallel
        const productPromises = missingProductIds.map(async (productId) => {
          try {
            // Check cache first
            const cachedData = localStorage.getItem(`product_${productId}`);
            if (cachedData) {
              const parsed = JSON.parse(cachedData);
              const cacheAge = Date.now() - (parsed.timestamp || 0);
              if (cacheAge < 24 * 60 * 60 * 1000) {
                return { productId, product: parsed.data };
              }
            }

            // Fetch from API
            const product = await ProductService.getProductById(productId);
            
            // Cache the product data
            try {
              localStorage.setItem(`product_${productId}`, JSON.stringify({
                data: product,
                timestamp: Date.now()
              }));
            } catch (cacheErr) {
              console.warn('Failed to cache product:', cacheErr);
            }

            return { productId, product };
          } catch (err) {
            console.error(`Failed to fetch product ${productId}:`, err);
            return { productId, product: null };
          }
        });

        const results = await Promise.all(productPromises);

        // Update state with fetched products
        const newProductDetails: Record<string, Product> = { ...productDetails };
        results.forEach(({ productId, product }) => {
          if (product) {
            newProductDetails[productId] = product;
          }
        });

        setProductDetails(newProductDetails);
        
        // Update localStorage cache
        try {
          localStorage.setItem('wishlist_product_cache', JSON.stringify({
            data: newProductDetails,
            timestamp: Date.now()
          }));
        } catch (cacheErr) {
          console.warn('Failed to update product cache:', cacheErr);
        }

        console.log('Product details fetched:', newProductDetails);
      } catch (err) {
        console.error('Failed to fetch product details:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchMissingProductDetails();
  }, [wishlist]);

  // Helper to get product data - either from wishlist item or from fetched details
  const getProductData = (item: WishlistItem): Partial<Product> => {
    // First try fetched product details (most complete)
    if (productDetails[item.product_id]) {
      return productDetails[item.product_id];
    }
    // Then try the item's embedded product data
    if (item.product) {
      return item.product;
    }
    // Return empty object as fallback
    return {};
  };

  // Helper to get product image URL using the same logic as other pages
  const getProductImageUrl = (product: Partial<Product>): string => {
    if (!product) return '';
    
    // Use the getProductThumbnail helper to get the correct image
    const thumbnail = getProductThumbnail(product);
    return thumbnail.url;
  };

  // Debug: Log wishlist data when it changes
  useEffect(() => {
    console.log('Wishlist page - Data:', {
      wishlist,
      length: wishlist.length,
      loading,
      error,
      items: wishlist,
      isArray: Array.isArray(wishlist),
      productDetails
    });
  }, [wishlist, loading, error, productDetails]);

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
      // Add to cart using mutation hook - this will update cart queries automatically
      await addToCartMutation.mutateAsync({ productId, quantity: 1 });
      
      // Invalidate cart queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      
      // Remove from wishlist after successful add to cart
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
            message: 'Product added to cart, but failed to remove from wishlist'
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
      
      // Add all wishlist items to cart using mutation hook
      for (const item of wishlist) {
        await addToCartMutation.mutateAsync({ productId: item.product_id, quantity: 1 });
      }
      
      // Invalidate cart queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      
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
            message: 'Items added to cart, but failed to clear wishlist'
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
                {wishlist.map((item) => {
                  const product = getProductData(item);
                  const imageUrl = getProductImageUrl(product);
                  const isLoadingThisProduct = loadingProducts && !imageUrl;

                  return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-beige-300/50 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {/* Product Image */}
                    <div className="relative">
                      {isLoadingThisProduct ? (
                        <div className="w-full h-48 bg-beige-100 flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name || 'Product'}
                          className="w-full h-48 object-contain bg-beige-100 p-4"
                          onError={(e) => {
                            // Hide broken image and show fallback
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                          onLoad={() => {
                            // Hide fallback when image loads successfully
                            const fallback = (e.currentTarget.nextElementSibling as HTMLElement);
                            if (fallback) fallback.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {/* Fallback placeholder - shown when no image or image fails to load */}
                      <div
                        className={`w-full h-48 bg-beige-100 items-center justify-center ${imageUrl && !isLoadingThisProduct ? 'hidden' : 'flex'}`}
                      >
                        <div className="text-center text-gray-400">
                          <Package className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">No image</p>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        {product.category || 'Product'}
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
                        {product.name || 'Loading...'}
                      </h3>

                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(product.rating || 4) ? 'text-green-500 fill-current' : 'text-black-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-black-600">({product.review_count || 0})</span>
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <span className="font-bold text-green-600">₹{product.price || 0}</span>
                        {product.actual_price && product.actual_price > (product.price || 0) && (
                          <span className="text-sm text-black-500 line-through">₹{product.actual_price}</span>
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
                  );
                })}
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
                    ₹{wishlist.reduce((sum, item) => {
                      const product = getProductData(item);
                      return sum + (product.price || 0);
                    }, 0)}
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