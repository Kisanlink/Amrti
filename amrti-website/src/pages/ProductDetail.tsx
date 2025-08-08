import { motion } from 'framer-motion';
import { ArrowLeft, Star, Heart, Leaf, Shield, Truck, RotateCcw, Award, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ScrollToTop from '../components/ui/ScrollToTop';
import { getProductById } from '../services/productService';
import { addToCart, getCartItem } from '../services/cartService';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../services/wishlistService';
import { useNotification } from '../context/NotificationContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const { showNotification } = useNotification();

  // Load product on mount
  useEffect(() => {
    if (id) {
      const productData = getProductById(id);
      if (productData) {
        setProduct(productData);
      }
    }
  }, [id]);

  if (!product) {
    return (
      <div className="pt-20 bg-beige-300 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold text-black-900 mb-4">Product Not Found</h1>
          <Link to="/products" className="text-green-600 hover:text-green-700 font-semibold">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // For now, use basic product data since the service doesn't have variants
  const currentVariant = { size: '100g', price: product.price, originalPrice: product.originalPrice };
  const discount = Math.round(((currentVariant.originalPrice - currentVariant.price) / currentVariant.originalPrice) * 100);

  return (
    <>
      <ScrollToTop />
      <div className="pt-16 sm:pt-20 bg-beige-300 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-beige-400 to-beige-500"></div>
        <div className="relative z-10 container-custom py-8 sm:py-12 lg:py-16">
          <Link to="/products" className="inline-flex items-center space-x-2 mb-4 sm:mb-8 text-black-700 hover:text-green-600 transition-colors duration-300">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-heading font-semibold text-sm sm:text-base">Back to Products</span>
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl bg-white p-4 sm:p-6">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-auto object-contain max-h-[200px] sm:max-h-[250px] md:max-h-[300px] min-h-[150px] sm:min-h-[180px] md:min-h-[200px]" 
                />
                {discount > 0 && (
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white-50 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                    {discount}% OFF
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center lg:text-left">
                <span className="inline-block px-3 py-1 sm:px-4 sm:py-2 bg-green-600 text-white-50 rounded-full text-xs sm:text-sm font-heading font-semibold mb-3 sm:mb-4">
                  {product.category}
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-black-900 mb-3 sm:mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center justify-center lg:justify-start space-x-2 mb-3 sm:mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${i < Math.floor(product.rating) ? 'text-green-500 fill-current' : 'text-black-300'}`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-black-900 text-sm sm:text-base">{product.rating}</span>
                  <span className="text-black-600 text-sm sm:text-base">({product.reviews} reviews)</span>
                </div>
                <p className="text-base sm:text-lg lg:text-xl text-black-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="space-y-2 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-green-600">₹{currentVariant.price}</span>
                  {currentVariant.originalPrice > currentVariant.price && (
                    <span className="text-lg sm:text-xl text-black-500 line-through">₹{currentVariant.originalPrice}</span>
                  )}
                  {discount > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs sm:text-sm font-semibold rounded">
                      Save ₹{currentVariant.originalPrice - currentVariant.price}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-black-600">Inclusive of all taxes</p>
              </div>

              {/* Size - Fixed size since product.variants doesn't exist */}
              <div className="space-y-3 text-center lg:text-left">
                <h3 className="font-heading font-semibold text-black-900 text-sm sm:text-base">Size:</h3>
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3">
                  <button
                    className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg border-2 font-semibold transition-all duration-300 border-green-600 bg-green-600 text-white-50 text-sm sm:text-base"
                  >
                    100g
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-3 text-center lg:text-left">
                <h3 className="font-heading font-semibold text-black-900 text-sm sm:text-base">Quantity:</h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-center lg:justify-start gap-3 sm:space-x-4">
                  <div className="flex items-center border border-black-300 rounded-lg bg-white">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="p-3 hover:bg-black-100 transition-colors rounded-l-lg"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-3 font-semibold text-base min-w-[60px] text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)} 
                      className="p-3 hover:bg-black-100 transition-colors rounded-r-lg"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-black-600 text-sm sm:text-base font-semibold">Total: ₹{currentVariant.price * quantity}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4">
                <button 
                  onClick={() => {
                    setIsAddingToCart(true);
                    try {
                      addToCart(product.id, quantity, product);
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
                      setIsAddingToCart(false);
                    }
                  }}
                  disabled={isAddingToCart}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold py-3 sm:py-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setIsUpdatingWishlist(true);
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
                      } catch (err) {
                        console.error('Failed to update wishlist:', err);
                        showNotification({
                          type: 'error',
                          message: 'Failed to update wishlist'
                        });
                      } finally {
                        setIsUpdatingWishlist(false);
                      }
                    }}
                    disabled={isUpdatingWishlist}
                    className={`w-full py-3 sm:py-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${
                      isInWishlist(product.id)
                        ? 'bg-red-600 text-white-50 hover:bg-red-700'
                        : 'border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white-50'
                    }`}
                  >
                    {isUpdatingWishlist ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    )}
                    <span>{isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                  </button>
                  
                  <button className="w-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white-50 font-heading font-semibold py-3 sm:py-4 rounded-lg transition-all duration-300 text-sm sm:text-base">
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-black-200">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-black-700">Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-black-700">Quality Assured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-black-700">Easy Returns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-black-700">Certified Organic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-16 bg-gradient-to-br from-beige-400 to-beige-500">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Description */}
            <div className="space-y-6">
              <div className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-lg bg-green-600">
                    <Leaf className="w-6 h-6 text-white-50" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-black-900">Product Description</h2>
                </div>
                <p className="text-black-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Product Features */}
            <div className="space-y-6">
              <div className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-lg bg-green-600">
                    <Award className="w-6 h-6 text-white-50" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-black-900">Product Features</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-beige-200/50 border border-beige-300/50">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white-50 flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <span className="text-black-700">100% Natural & Organic</span>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-beige-200/50 border border-beige-300/50">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white-50 flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <span className="text-black-700">Premium Quality</span>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-beige-200/50 border border-beige-300/50">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white-50 flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
                      3
                    </div>
                    <span className="text-black-700">Certified Organic</span>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-beige-200/50 border border-beige-300/50">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white-50 flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
                      4
                    </div>
                    <span className="text-black-700">No Artificial Additives</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default ProductDetail;
