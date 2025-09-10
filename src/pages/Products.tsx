import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Leaf, Award, Truck, Shield, RotateCcw, Filter, X, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ScrollToTop from '../components/ui/ScrollToTop';
import ProductService from '../services/productService';
import type { Product } from '../context/AppContext';
import CartService from '../services/cartService';
import WishlistService from '../services/wishlistService';
import { useNotification } from '../context/NotificationContext';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [showSidebar, setShowSidebar] = useState(false);
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set()); // Track wishlist items locally
  const [filters, setFilters] = useState({
    priceRange: [0, 2000],
    availability: 'all',
    discount: false,
    newArrivals: false,
    sortBy: 'name'
  });
  const { showNotification } = useNotification();

  // Load products and categories on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const productsResponse = await ProductService.getAllProducts(1, 100);
        setProducts(productsResponse.data);
        // For now, set default categories since getProductCategories doesn't exist
        setCategories(['Superfoods', 'Herbs']);
        // Initialize counts - will be updated via events
        setCartCount(0);
        setWishlistCount(0);
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
        setCategories([]);
      }
    };
    
    loadData();
  }, []);

  // Listen for cart and wishlist updates
  useEffect(() => {
    const handleCartUpdate = async () => {
      try {
        const cartCount = await CartService.getItemCount();
        setCartCount(cartCount);
      } catch (error) {
        console.error('Failed to update cart count:', error);
      }
    };

    const handleWishlistUpdate = async () => {
      try {
        const wishlistCount = await WishlistService.getWishlistCount();
        setWishlistCount(wishlistCount);
      } catch (error) {
        console.error('Failed to update wishlist count:', error);
      }
    };

    // Listen for custom events
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  // Filter products based on selected category and filters
  const filteredProducts = products.filter(product => {
    // Category filter
    if (selectedCategory !== 'All Products' && product.category !== selectedCategory) {
      return false;
    }
    
    // Price range filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }
    
    // Availability filter
    if (filters.availability === 'inStock' && product.stock_status !== 'In Stock') {
      return false;
    }
    if (filters.availability === 'outOfStock' && product.stock_status === 'In Stock') {
      return false;
    }
    
    // Discount filter
    if (filters.discount && product.discount_percent <= 0) {
      return false;
    }
    
    // New arrivals filter (products added in last 30 days)
    if (filters.newArrivals) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      // For now, consider all products as new arrivals since dateAdded is not in the interface
      // In a real app, you would add dateAdded to the Product interface
      const productDate = new Date('2024-01-01'); // Default date
      if (productDate < thirtyDaysAgo) {
        return false;
      }
    }
    
    return true;
  });

  // Helper function to check if product is in wishlist
  const isProductInWishlist = (productId: string): boolean => {
    return wishlistItems.has(productId);
  };

  // Sort products - Moringa products first, then by selected criteria
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Check if products are moringa products
    const aIsMoringa = a.name.toLowerCase().includes('moringa') || a.category.toLowerCase().includes('moringa');
    const bIsMoringa = b.name.toLowerCase().includes('moringa') || b.category.toLowerCase().includes('moringa');
    
    // If one is moringa and the other isn't, prioritize moringa
    if (aIsMoringa && !bIsMoringa) return -1;
    if (!aIsMoringa && bIsMoringa) return 1;
    
    // If both are moringa or both are not moringa, sort by selected criteria
    switch (filters.sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });
  


  return (
    <>
      <ScrollToTop />
      <div className="pt-16 sm:pt-20 bg-beige-300">
      {/* All Products */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-beige-400 to-beige-500">
        <div className="container-custom px-4 sm:px-6">
          {/* Header with Filter Toggle - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center sm:text-left flex-1"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-black-900 mb-2 sm:mb-4 lg:mb-6">
                Our <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Natural Products</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-black-700 max-w-3xl mx-auto sm:mx-0">
                Discover our complete collection of premium natural products
              </p>
            </motion.div>

            {/* Filter Buttons */}
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Desktop Filter Button */}
              <button
                onClick={() => setShowDesktopSidebar(!showDesktopSidebar)}
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filters</span>
              </button>
              
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Filters</span>
              </button>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-black-600">Showing {sortedProducts.length} products</span>
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 2000 || filters.availability !== 'all' || filters.discount || filters.newArrivals) && (
              <>
                <span className="text-black-400">•</span>
                <span className="text-sm text-black-600">Filters applied</span>
                <button
                  onClick={() => setFilters({
                    priceRange: [0, 2000],
                    availability: 'all',
                    discount: false,
                    newArrivals: false,
                    sortBy: 'name'
                  })}
                  className="text-sm text-green-600 hover:text-green-700 underline"
                >
                  Clear all
                </button>
              </>
                    )}
                  </div>
                  
          {/* Products Grid - Mobile Optimized */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            {/* Sidebar - Desktop */}
            {showDesktopSidebar && (
              <div className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-heading font-bold text-black-900 flex items-center">
                      <Sliders className="w-5 h-5 mr-2" />
                      Filters
                    </h3>
                    <button
                      onClick={() => setShowDesktopSidebar(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Close Filters"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-semibold text-black-900 mb-3">Price Range</h4>
                  <div className="space-y-3">
                    {/* Clear Min/Max Labels */}
                    <div className="flex justify-between text-sm font-medium text-gray-700">
                      <span>Min: ₹{filters.priceRange[0]}</span>
                      <span>Max: ₹{filters.priceRange[1]}</span>
                    </div>
                    
                    {/* Simple Range Slider */}
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        value={filters.priceRange[0]}
                        onChange={(e) => {
                          const value = Math.min(parseInt(e.target.value), filters.priceRange[1]);
                          setFilters(prev => ({
                            ...prev,
                            priceRange: [value, prev.priceRange[1]]
                          }));
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        value={filters.priceRange[1]}
                        onChange={(e) => {
                          const value = Math.max(parseInt(e.target.value), filters.priceRange[0]);
                          setFilters(prev => ({
                            ...prev,
                            priceRange: [prev.priceRange[0], value]
                          }));
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    
                    {/* Range Labels */}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>₹0</span>
                      <span>₹2000</span>
                    </div>
                  </div>
                </div>
                    
                {/* Availability */}
                <div className="mb-6">
                  <h4 className="font-semibold text-black-900 mb-3">Availability</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Products' },
                      { value: 'inStock', label: 'In Stock' },
                      { value: 'outOfStock', label: 'Out of Stock' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="availability"
                          value={option.value}
                          checked={filters.availability === option.value}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            availability: e.target.value
                          }))}
                          className="mr-2 text-green-600"
                        />
                        <span className="text-sm text-black-700">{option.label}</span>
                      </label>
                    ))}
                      </div>
                    </div>

                {/* Discount */}
                <div className="mb-6">
                  <h4 className="font-semibold text-black-900 mb-3">Special Offers</h4>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.discount}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          discount: e.target.checked
                        }))}
                        className="mr-2 text-green-600"
                      />
                      <span className="text-sm text-black-700">On Sale</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.newArrivals}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          newArrivals: e.target.checked
                        }))}
                        className="mr-2 text-green-600"
                      />
                      <span className="text-sm text-black-700">New Arrivals</span>
                    </label>
                  </div>
                </div>

                {/* Sort By */}
                <div className="mb-6">
                  <h4 className="font-semibold text-black-900 mb-3">Sort By</h4>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="name">Name A-Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1 w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8 sm:mb-12"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer"
                >
                  <div className="overflow-hidden rounded-xl bg-white backdrop-blur-sm border border-beige-400/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="relative overflow-hidden flex-shrink-0">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                        style={{ maxHeight: '200px' }}
                      />
                      {/* <div className="absolute top-3 right-3 bg-beige-300/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-black-700">
                        {product.category}
                      </div> */}
                                  {product.actual_price > product.price && (
              <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold ">
                {Math.round(((product.actual_price - product.price) / product.actual_price) * 100)}% OFF
              </div>
            )}
                    </div>
                    
                    <div className="p-3 sm:p-4 lg:p-5 flex flex-col flex-grow">
                      <h3 className="text-base sm:text-lg font-heading font-semibold text-black-900 mb-2 group-hover:text-green-700 transition-colors duration-300">
                        {product.name}
                      </h3>
                      <p className="text-black-700 text-xs sm:text-sm mb-3 leading-relaxed flex-grow">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < Math.floor(product.rating) ? 'text-green-500 fill-current' : 'text-black-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-black-600">({product.review_count})</span>
                      </div>

                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span className="font-bold text-green-600 text-sm sm:text-base">₹{product.price}</span>
                                          {product.actual_price > product.price && (
                  <span className="text-xs sm:text-sm text-black-500 line-through">₹{product.actual_price}</span>
                )}
                        </div>
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                          product.stock_status === 'In Stock' 
                            ? 'bg-green-100 text-green-800' 
                            : product.stock_status === 'Comming Soon' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.stock_status}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 sm:space-x-2 mt-auto">
                        <Link
                          to={`/product/${product.id}`}
                          className="flex-1 inline-flex items-center justify-center font-heading font-semibold text-green-600 hover:text-green-700 transition-colors duration-300 group-hover:translate-x-1 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white-50"
                        >
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                          <motion.span
                            className="ml-1"
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </Link>
                        
                        {/* Add to Cart Button */}
                        {product.stock === 0 || product.stock_status === "Comming Soon" ? (
                          <button
                            disabled
                            className="p-2 border border-gray-400 text-gray-400 rounded-lg cursor-not-allowed"
                            title="Coming Soon"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              setLoadingStates(prev => ({ ...prev, [`cart-${product.id}`]: true }));
                              try {
                                await CartService.addItem(product.id, 1);
                                // Cart count will be updated via event listener
                              } catch (err) {
                                console.error('Failed to add to cart:', err);
                              } finally {
                                setLoadingStates(prev => ({ ...prev, [`cart-${product.id}`]: false }));
                              }
                            }}
                            disabled={loadingStates[`cart-${product.id}`]}
                            className="p-2 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white-50 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add to Cart"
                          >
                            {loadingStates[`cart-${product.id}`] ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <ShoppingCart className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        {/* Add to Wishlist Button */}
                        <button
                          onClick={async () => {
                            setLoadingStates(prev => ({ ...prev, [`wishlist-${product.id}`]: true }));
                            try {
                              if (isProductInWishlist(product.id)) {
                                await WishlistService.removeFromWishlist(product.id);
                                // Update local state
                                setWishlistItems(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(product.id);
                                  return newSet;
                                });
                              } else {
                                await WishlistService.addToWishlist(product.id);
                                // Update local state
                                setWishlistItems(prev => {
                                  const newSet = new Set(prev);
                                  newSet.add(product.id);
                                  return newSet;
                                });
                              }
                              // Wishlist count will be updated via event listener
                            } catch (err) {
                              console.error('Failed to update wishlist:', err);
                            } finally {
                              setLoadingStates(prev => ({ ...prev, [`wishlist-${product.id}`]: false }));
                            }
                          }}
                          disabled={loadingStates[`wishlist-${product.id}`]}
                          className={`p-2 border rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isProductInWishlist(product.id)
                              ? 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white-50'
                              : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white-50'
                          }`}
                          title={isProductInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          {loadingStates[`wishlist-${product.id}`] ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Heart className={`w-4 h-4 ${isProductInWishlist(product.id) ? 'fill-current' : ''}`} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="p-12 rounded-3xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-2xl">
              <div className="max-w-2xl mx-auto">
                <div className="p-4 rounded-full bg-green-600 w-fit mx-auto mb-6">
                  <Award className="w-8 h-8 text-white-50" />
                </div>
                <h3 className="text-3xl font-heading font-bold text-black-900 mb-4">
                  Why Choose Our Products?
                </h3>
                <p className="text-lg text-black-700 mb-8">
                  Experience the difference with our premium natural products. 
                  Every item is carefully sourced and tested for quality.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-black-900">Free Shipping</p>
                      <p className="text-sm text-black-600">On orders over ₹500</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-black-900">Quality Assured</p>
                      <p className="text-sm text-black-600">100% natural</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RotateCcw className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-black-900">Easy Returns</p>
                      <p className="text-sm text-black-600">30-day policy</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-black-900">Certified Organic</p>
                      <p className="text-sm text-black-600">Premium quality</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile Sidebar Modal */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black/50 z-[9999] lg:hidden">
          <div className="fixed inset-y-0 left-0 w-80 max-w-[90vw] bg-white shadow-2xl overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg font-heading font-bold text-black-900 flex items-center">
                  <Sliders className="w-5 h-5 mr-2" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold text-black-900 mb-3">Price Range</h4>
                <div className="space-y-3">
                  {/* Clear Min/Max Labels */}
                  <div className="flex justify-between text-sm font-medium text-gray-700">
                    <span>Min: ₹{filters.priceRange[0]}</span>
                    <span>Max: ₹{filters.priceRange[1]}</span>
                  </div>
                  
                  {/* Simple Range Slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={filters.priceRange[0]}
                      onChange={(e) => {
                        const value = Math.min(parseInt(e.target.value), filters.priceRange[1]);
                        setFilters(prev => ({
                          ...prev,
                          priceRange: [value, prev.priceRange[1]]
                        }));
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={filters.priceRange[1]}
                      onChange={(e) => {
                        const value = Math.max(parseInt(e.target.value), filters.priceRange[0]);
                        setFilters(prev => ({
                          ...prev,
                          priceRange: [prev.priceRange[0], value]
                        }));
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  
                  {/* Range Labels */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>₹0</span>
                    <span>₹2000</span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <h4 className="font-semibold text-black-900 mb-3">Availability</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Products' },
                    { value: 'inStock', label: 'In Stock' },
                    { value: 'outOfStock', label: 'Out of Stock' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="availability"
                        value={option.value}
                        checked={filters.availability === option.value}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          availability: e.target.value
                        }))}
                        className="mr-2 text-green-600"
                      />
                      <span className="text-sm text-black-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div className="mb-6">
                <h4 className="font-semibold text-black-900 mb-3">Special Offers</h4>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.discount}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        discount: e.target.checked
                      }))}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-sm text-black-700">On Sale</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.newArrivals}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        newArrivals: e.target.checked
                      }))}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-sm text-black-700">New Arrivals</span>
                  </label>
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <h4 className="font-semibold text-black-900 mb-3">Sort By</h4>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    sortBy: e.target.value
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="name">Name A-Z</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Apply Filters Button */}
              <button
                onClick={() => setShowSidebar(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Products; 