import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Leaf, Award, Truck, Shield, RotateCcw, Filter, X, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ScrollToTop from '../components/ui/ScrollToTop';
import { getAllProducts, getProductCategories, Product } from '../services/productService';
import { addToCart, getCartItemCount } from '../services/cartService';
import { addToWishlist, removeFromWishlist, isInWishlist, getWishlistCount } from '../services/wishlistService';
import { useNotification } from '../context/NotificationContext';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [showSidebar, setShowSidebar] = useState(false);
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
    setProducts(getAllProducts());
    setCategories(getProductCategories());
    setCartCount(getCartItemCount());
    setWishlistCount(getWishlistCount());
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
    if (filters.availability === 'inStock' && !product.inStock) {
      return false;
    }
    if (filters.availability === 'outOfStock' && product.inStock) {
      return false;
    }
    
    // Discount filter
    if (filters.discount && product.originalPrice <= product.price) {
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

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
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
      {/* Product Categories */}
      {/* <section className="py-12 sm:py-16 bg-gradient-to-r from-beige-500 via-beige-400 to-beige-500">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black-900 mb-3 sm:mb-4">
              Product Categories
            </h2>
            <p className="text-base sm:text-lg text-black-700 px-4 sm:px-0">
              Explore our range of natural products by category
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group cursor-pointer"
              >
                <div className="p-4 sm:p-6 rounded-xl bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white-50" />
                  </div>
                  <h3 className="text-sm sm:text-lg font-heading font-semibold text-black-900 mb-1 sm:mb-2">
                    {category.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-black-600">
                    {category.count} products
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* All Products */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-beige-400 to-beige-500">
        <div className="container-custom">
          {/* Header with Filter Toggle */}
          <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
              className="text-center flex-1"
          >
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-black-900 mb-4 sm:mb-6">
                Our <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Natural Products</span>
            </h2>
              <p className="text-lg sm:text-xl text-black-700 max-w-3xl mx-auto">
                Discover our complete collection of premium natural products
            </p>
          </motion.div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowSidebar(true)}
              className="lg:hidden p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
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
                  
          {/* Products Grid */}
          <div className="flex gap-6 lg:gap-8">
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-heading font-bold text-black-900 mb-6 flex items-center">
                  <Sliders className="w-5 h-5 mr-2" />
                  Filters
                    </h3>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-semibold text-black-900 mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-black-600">
                      <span>₹{filters.priceRange[0]}</span>
                      <span>₹{filters.priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                      }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [parseInt(e.target.value), prev.priceRange[1]]
                      }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
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

            {/* Products Grid */}
            <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer"
                >
                  <div className="overflow-hidden rounded-xl bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="relative overflow-hidden flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                        style={{ maxHeight: '200px' }}
                      />
                      <div className="absolute top-3 right-3 bg-beige-300/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-black-700">
                        {product.category}
                      </div>
                      {product.originalPrice > product.price && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white-50 px-2 py-1 rounded-full text-xs font-semibold">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
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
                        <span className="text-xs text-black-600">({product.reviews})</span>
                      </div>

                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span className="font-bold text-green-600 text-sm sm:text-base">₹{product.price}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-xs sm:text-sm text-black-500 line-through">₹{product.originalPrice}</span>
                          )}
                        </div>
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                          product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
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
                        <button
                          onClick={() => {
                            setLoadingStates(prev => ({ ...prev, [`cart-${product.id}`]: true }));
                            try {
                              addToCart(product.id, 1, product);
                              setCartCount(getCartItemCount());
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
                        
                        {/* Add to Wishlist Button */}
                        <button
                          onClick={() => {
                            setLoadingStates(prev => ({ ...prev, [`wishlist-${product.id}`]: true }));
                            try {
                              if (isInWishlist(product.id)) {
                                removeFromWishlist(product.id);
                              } else {
                                addToWishlist(product.id, product);
                              }
                              setWishlistCount(getWishlistCount());
                            } catch (err) {
                              console.error('Failed to update wishlist:', err);
                            } finally {
                              setLoadingStates(prev => ({ ...prev, [`wishlist-${product.id}`]: false }));
                            }
                          }}
                          disabled={loadingStates[`wishlist-${product.id}`]}
                          className={`p-2 border rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isInWishlist(product.id)
                              ? 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white-50'
                              : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white-50'
                          }`}
                          title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          {loadingStates[`wishlist-${product.id}`] ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
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
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
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
                  <div className="flex justify-between text-sm text-black-600">
                    <span>₹{filters.priceRange[0]}</span>
                    <span>₹{filters.priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [parseInt(e.target.value), prev.priceRange[1]]
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
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