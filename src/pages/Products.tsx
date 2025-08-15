import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Leaf, Award, Truck, Shield, RotateCcw } from 'lucide-react';
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
  const { showNotification } = useNotification();

  // Load products and categories on mount
  useEffect(() => {
    setProducts(getAllProducts());
    setCategories(getProductCategories());
    setCartCount(getCartItemCount());
    setWishlistCount(getWishlistCount());
  }, []);

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'All Products' 
    ? products 
    : products.filter(product => product.category === selectedCategory);
  


  return (
    <>
      <ScrollToTop />
      <div className="pt-16 sm:pt-20 bg-beige-300">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-beige-400 via-beige-300 to-beige-500">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4 sm:mb-6"
            >
              <div className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-beige-500/80 rounded-full border border-green-200">
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="font-heading font-semibold text-green-700 tracking-wide text-sm sm:text-base">Natural Products</span>
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold mb-4 sm:mb-6 text-black-900">
              Discover Our{' '}
              <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Premium Products
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-black-700 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Experience the power of nature with our carefully sourced, organic products. 
              From traditional Ayurvedic herbs to modern wellness solutions, we bring you the best of both worlds.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Product Banner Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-beige-300 to-beige-400">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-russet-900 mb-6">
              Pure <span className="text-tea-600">Goodness</span>
            </h2>
            <p className="text-xl text-russet-800 max-w-4xl mx-auto leading-relaxed">
              Packed with Nature's Power
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <img
              src="/products/product_banner.jpg"
              alt="Amrti Natural Products Collection"
              className="w-full h-auto rounded-2xl shadow-elegant"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-russet-900/20 to-transparent rounded-2xl"></div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mt-8"
          >
            <p className="text-lg text-russet-800 max-w-3xl mx-auto font-medium">
              Our mission is to provide high quality health and wellness products sourced through organic and sustainable practices.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-beige-500 via-beige-400 to-beige-500">
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
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-gradient-to-br from-beige-400 to-beige-500">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold text-black-900 mb-6">
              Featured <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Products</span>
            </h2>
            <p className="text-xl text-black-700 max-w-3xl mx-auto">
              Our most popular natural products loved by thousands
            </p>
          </motion.div>

          {/* Featured Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {products.filter(product => product.featured).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <div className="relative overflow-hidden flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-500"
                      style={{ maxHeight: '300px' }}
                    />
                    <div className="absolute top-4 right-4 bg-green-600 text-white-50 px-3 py-1 rounded-full text-sm font-semibold">
                      {product.category}
                    </div>
                    {product.originalPrice > product.price && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white-50 px-3 py-1 rounded-full text-sm font-semibold">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  
                  <div className="relative p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-heading font-bold text-black-900 mb-3 group-hover:text-green-700 transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-black-700 mb-4 leading-relaxed flex-grow">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-green-500 fill-current' : 'text-black-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-black-600">({product.reviews} reviews)</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-lg text-black-500 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <Link
                        to={`/product/${product.id}`}
                        className="w-full bg-green-600 text-white-50 font-heading font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>
                      
                      <div className="flex space-x-2">
                        {/* Add to Cart Button */}
                        <button
                          onClick={() => {
                            setLoadingStates(prev => ({ ...prev, [`cart-${product.id}`]: true }));
                            try {
                              addToCart(product.id, 1, product);
                              setCartCount(getCartItemCount());
                              showNotification({
                                type: 'success',
                                message: `${product.name} added to cart successfully!`
                              });
                            } catch (err) {
                              console.error('Failed to add to cart:', err);
                              showNotification({
                                type: 'error',
                                message: 'Failed to add item to cart'
                              });
                            } finally {
                              setLoadingStates(prev => ({ ...prev, [`cart-${product.id}`]: false }));
                            }
                          }}
                          disabled={loadingStates[`cart-${product.id}`]}
                          className="flex-1 p-3 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white-50 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                                showNotification({
                                  type: 'success',
                                  message: `${product.name} removed from wishlist`
                                });
                              } else {
                                addToWishlist(product.id, product);
                                showNotification({
                                  type: 'success',
                                  message: `${product.name} added to wishlist successfully!`
                                });
                              }
                              setWishlistCount(getWishlistCount());
                            } catch (err) {
                              console.error('Failed to update wishlist:', err);
                              showNotification({
                                type: 'error',
                                message: 'Failed to update wishlist'
                              });
                            } finally {
                              setLoadingStates(prev => ({ ...prev, [`wishlist-${product.id}`]: false }));
                            }
                          }}
                          disabled={loadingStates[`wishlist-${product.id}`]}
                          className={`flex-1 p-3 border rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
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
                </div>
              </motion.div>
            ))}
          </div>

          {/* All Products Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-heading font-bold text-black-900 mb-8 text-center">
              All Natural Products
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredProducts.map((product, index) => (
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
                          to={product.id === 'moringa-powder' ? '/product/moringa/101' : `/product/${product.id}`}
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
    </div>
    </>
  );
};

export default Products; 