import { motion } from 'framer-motion';
import { ArrowRight, Star, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProductService from '../../services/productService';
import type { Product } from '../../context/AppContext';
import CartService from '../../services/cartService';
import WishlistService from '../../services/wishlistService';
import { useNotification } from '../../context/NotificationContext';

const ProductsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set()); // Track wishlist items locally
  const { showNotification } = useNotification();

  // Load products on mount - show only 4 products for homepage
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await ProductService.getAllProducts(1, 4);
        setProducts(response.data);
        try {
          const cartCount = await CartService.getItemCount();
          setCartCount(cartCount);
        } catch (error) {
          console.error('Failed to get cart count:', error);
          setCartCount(0);
        }
        
        try {
          const wishlistCount = await WishlistService.getWishlistCount();
          setWishlistCount(wishlistCount);
        } catch (error) {
          console.error('Failed to get wishlist count:', error);
          setWishlistCount(0);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
      }
    };
    
    loadProducts();
  }, []);

  // Helper function to check if product is in wishlist
  const isProductInWishlist = (productId: string): boolean => {
    return wishlistItems.has(productId);
  };

  const ProductCard = ({ product }: { product: any }) => {
    const discount = Math.round(((product.actual_price - product.price) / product.actual_price) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -10 }}
        transition={{ duration: 0.6 }}
        className="group cursor-pointer"
      >
                 <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-beige-200/50 shadow-elegant hover:shadow-premium transition-all duration-300 h-full flex flex-col">
          <div className="relative overflow-hidden flex-shrink-0">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-300"
              style={{ maxHeight: '200px' }}
            />
                            <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              {product.category}
            </div>
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white-50 px-2 py-1 rounded-full text-xs font-semibold">
                {discount}% OFF
              </div>
            )}
          </div>
          
          <div className="p-5 flex flex-col flex-grow">
                                         <h3 className="text-lg font-heading font-bold text-russet-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
               {product.name}
             </h3>
                           <p className="text-russet-700 text-sm mb-4 leading-relaxed flex-grow">
              {product.description}
            </p>
            
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                                         className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-green-600 fill-current' : 'text-russet-400'}`}
                  />
                ))}
              </div>
                             <span className="text-xs text-russet-600">({product.review_count})</span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                                 <span className="font-bold text-green-600">₹{product.price}</span>
                                 {product.actual_price !== product.price && (
                   <span className="text-sm text-russet-500 line-through">₹{product.actual_price}</span>
                 )}
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-auto">
              <Link
                to={`/product/${product.id}`}
                                 className="flex-1 inline-flex items-center justify-center font-heading font-semibold text-green-600 hover:text-green-700 transition-colors duration-300 group-hover:translate-x-1 text-sm py-2 px-4 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white"
              >
                View Details
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
                onClick={async () => {
                  setLoadingStates(prev => ({ ...prev, [`cart-${product.id}`]: true }));
                  try {
                    await CartService.addItem(product.id, 1);
                    const cartCount = await CartService.getItemCount();
                    setCartCount(cartCount);
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
                                 className="p-2 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                onClick={async () => {
                  setLoadingStates(prev => ({ ...prev, [`wishlist-${product.id}`]: true }));
                  try {
                    if (await WishlistService.isInWishlist(product.id)) {
                      await WishlistService.removeFromWishlist(product.id);
                      showNotification({
                        type: 'success',
                        message: `${product.name} removed from wishlist`
                      });
                    } else {
                      await WishlistService.addToWishlist(product.id);
                      showNotification({
                        type: 'success',
                        message: `${product.name} added to wishlist successfully!`
                      });
                    }
                    const wishlistCount = await WishlistService.getWishlistCount();
                    setWishlistCount(wishlistCount);
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
                className={`p-2 border rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  WishlistService.isInWishlist(product.id)
                    ? 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white-50'
                    : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                }`}
                title={WishlistService.isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                {loadingStates[`wishlist-${product.id}`] ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Heart className={`w-4 h-4 ${WishlistService.isInWishlist(product.id) ? 'fill-current' : ''}`} />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
         <section className="py-12 sm:py-16 bg-gradient-to-br from-beige-50 to-beige-100">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
                     <h2 className="text-4xl font-heading font-bold text-russet-900 mb-6">
             Our <span className="text-green-600">Premium Products</span>
           </h2>
           <p className="text-xl text-russet-800 max-w-3xl mx-auto font-medium">
            Discover our carefully sourced natural powders that bring the power of traditional wisdom to modern wellness
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Link
            to="/products"
                            className="inline-flex items-center space-x-2 px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full shadow-elegant hover:shadow-premium transition-all duration-300"
          >
            <span>View All Products</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsSection; 