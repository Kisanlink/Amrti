import { motion } from 'framer-motion';
import { ArrowLeft, Star, Heart, Leaf, Shield, Truck, RotateCcw, Award, Plus, Minus, ShoppingCart, ChevronDown, ChevronUp, ChevronRight, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ScrollToTop from '../components/ui/ScrollToTop';
import ProductService from '../services/productService';
import CartService from '../services/cartService';
import WishlistService from '../services/wishlistService';
import { useNotification } from '../context/NotificationContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    ingredients: true,
    usage: false,
    benefits: false,
    storage: false
  });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    name: ''
  });
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const { showNotification } = useNotification();

  // Load product and suggested products on mount
  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        try {
          setLoading(true);
          const productData = await ProductService.getProductById(id);
          setProduct(productData);
          setSelectedImageIndex(0); // Reset to first image when loading new product
          
          // Get suggested products (same category, excluding current product)
          const allProductsResponse = await ProductService.getAllProducts(1, 100);
          const allProducts = allProductsResponse.data;
          const suggested = allProducts
            .filter(p => p.id !== id && p.category === productData.category)
            .slice(0, 4); // Show max 4 suggested products
          
          // If not enough products in same category, add some from other categories
          if (suggested.length < 4) {
            const otherProducts = allProducts
              .filter(p => p.id !== id && p.category !== productData.category)
              .slice(0, 4 - suggested.length);
            setSuggestedProducts([...suggested, ...otherProducts]);
          } else {
            setSuggestedProducts(suggested);
          }
        } catch (error) {
          console.error('Failed to load product:', error);
          setProduct(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-20 bg-beige-300 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-20 bg-beige-300 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold text-black-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">The product you are looking for could not be found.</p>
          <Link to="/products" className="text-green-600 hover:text-green-700 font-semibold">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Fixed 100g variant
  const currentVariant = { size: '100g', price: product.price, originalPrice: product.originalPrice };
  const discount = Math.round(((currentVariant.originalPrice - currentVariant.price) / currentVariant.originalPrice) * 100);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  return (
    <>
      <ScrollToTop />
      <div className="pt-16 sm:pt-20 bg-beige-300 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-beige-400 to-beige-500"></div>
        <div className="relative z-10 container-custom py-8 sm:py-12 lg:py-16">
           <Link to="/products" className="inline-flex items-center space-x-2 mb-6 text-black-700 hover:text-green-600 transition-colors duration-300">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-heading font-semibold text-sm sm:text-base">Back to Products</span>
          </Link>
          
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
            {/* Product Images */}
             <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
               {/* Thumbnail Gallery - Left Side */}
               <div className="flex sm:flex-col gap-3 justify-start sm:justify-between">
                 {/* Product thumbnails */}
                 <div className="flex sm:flex-col gap-3">
                   {/* Create array of all available image URLs */}
                   {(() => {
                     const allImageUrls = [
                       product.image_url,
                       product.image_url_1,
                       product.image_url_2,
                       product.image_url_3,
                       product.image_url_4
                     ];
                     
                     // Filter out empty URLs but ensure we always have at least the main image
                     const validImageUrls = allImageUrls.filter(url => url && url.trim() !== '');
                     
                     // If we only have one image, show it multiple times for better UX
                     const imageUrls = validImageUrls.length > 1 
                       ? validImageUrls 
                       : [product.image_url, product.image_url, product.image_url, product.image_url, product.image_url];
                     
                     return imageUrls.slice(0, 5).map((imageUrl, index) => (
                       <div 
                         key={index}
                         onClick={() => setSelectedImageIndex(index)}
                         className={`relative overflow-hidden rounded-lg bg-white p-2 shadow-sm hover:border-green-600 transition-colors cursor-pointer w-16 h-16 sm:w-20 sm:h-20 ${
                           index === selectedImageIndex ? 'border-2 border-green-600 shadow-md' : 'border border-gray-200'
                         }`}
                       >
                         <img 
                           src={imageUrl} 
                           alt={`${product.name} - Image ${index + 1}`} 
                           className="w-full h-full object-contain" 
                           onError={(e) => {
                             console.error('Failed to load thumbnail image:', imageUrl);
                             e.currentTarget.style.display = 'none';
                           }}
                         />
                       </div>
                     ));
                   })()}
                 </div>
               </div>
               
               {/* Main Product Image - Right Side */}
               <div className="flex-1">
                 <div className="relative overflow-hidden rounded-xl shadow-xl bg-white aspect-square sm:h-full">
                {(() => {
                  const allImageUrls = [
                    product.image_url,
                    product.image_url_1,
                    product.image_url_2,
                    product.image_url_3,
                    product.image_url_4
                  ];
                  
                  const validImageUrls = allImageUrls.filter(url => url && url.trim() !== '');
                  const imageUrls = validImageUrls.length > 1 
                    ? validImageUrls 
                    : [product.image_url, product.image_url, product.image_url, product.image_url, product.image_url];
                  
                  const currentImage = imageUrls[selectedImageIndex] || product.image_url;
                  
                  return (
                    <img 
                      src={currentImage} 
                      alt={product.name} 
                      className="w-full h-full object-contain p-4" 
                      onError={(e) => {
                        console.error('Failed to load product image:', currentImage);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  );
                })()}
                {discount > 0 && (
                     <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                    {discount}% OFF
                  </div>
                )}
                   {/* Wishlist Icon */}
                   <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                     <button className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors">
                       <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                     </button>
                   </div>
                 </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6">
                {/* Product Title & Rating */}
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-black-900 mb-2 sm:mb-3">
                  {product.name}
                </h1>
                  
                  {/* Product Description */}
                  <p className="text-black-600 text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                          className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    </div>
                    <span className="text-black-600 text-sm">({product.reviews} reviews)</span>
                  </div>
              </div>

              {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-green-600">₹{currentVariant.price}</span>
                  {currentVariant.originalPrice > currentVariant.price && (
                    <span className="text-lg sm:text-xl text-black-500 line-through">₹{currentVariant.originalPrice}</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-black-600">Inclusive of all taxes</p>
              </div>

                {/* Size Display - Fixed 100g */}
                <div className="space-y-3">
                  <h3 className="font-heading font-semibold text-black-900 text-sm sm:text-base">Size:</h3>
                  <div className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-2 border-green-600 bg-green-600 text-white font-semibold text-sm sm:text-base w-fit">
                    100g
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-3">
                  <h3 className="font-heading font-semibold text-black-900 text-sm sm:text-base">Quantity:</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white w-fit">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                        className="p-2 sm:p-3 hover:bg-gray-100 transition-colors rounded-l-lg"
                      >
                        <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <span className="px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base min-w-[60px] sm:min-w-[80px] text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)} 
                        className="p-2 sm:p-3 hover:bg-gray-100 transition-colors rounded-r-lg"
                      >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    <span className="text-black-600 text-sm">Total: ₹{currentVariant.price * quantity}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4">
                <button 
                  onClick={async () => {
                    setIsAddingToCart(true);
                    try {
                      await CartService.addItem(product.id, quantity);
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
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-heading font-semibold py-3 sm:py-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>ADD TO CART</span>
                      </>
                    )}
                  </button>
                  

                </div>


             </div>
                </div>
              </div>

         {/* Product Highlights Section */}
         <div className="mt-6 sm:mt-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
             <div className="flex items-center space-x-3 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center">
                 <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
               </div>
               <div>
                 <span className="text-xs sm:text-sm font-semibold text-green-800">100% Natural</span>
                 <p className="text-xs text-green-600">Pure & Organic</p>
               </div>
             </div>
             <div className="flex items-center space-x-3 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center">
                 <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
               </div>
               <div>
                 <span className="text-xs sm:text-sm font-semibold text-blue-800">Premium Quality</span>
                 <p className="text-xs text-blue-600">Lab Tested</p>
               </div>
             </div>
             <div className="flex items-center space-x-3 p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-100">
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 flex items-center justify-center">
                 <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
               </div>
               <div>
                 <span className="text-xs sm:text-sm font-semibold text-orange-800">Certified Organic</span>
                 <p className="text-xs text-orange-600">USDA Approved</p>
                </div>
                </div>
             <div className="flex items-center space-x-3 p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-100">
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center">
                 <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
               <div>
                 <span className="text-xs sm:text-sm font-semibold text-purple-800">Free Shipping</span>
                 <p className="text-xs text-purple-600">On Orders ₹500+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

       {/* Customer Reviews Section */}
        <section className="py-12 sm:py-16 bg-white">
        <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              {/* Reviews Header */}
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black-900 mb-3 sm:mb-4">Customer Reviews</h2>
                <p className="text-black-600 text-base sm:text-lg">See what our customers are saying about this product</p>
              </div>

              {/* Reviews Summary Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
                <div className="flex flex-col lg:flex-row items-center justify-between">
                  {/* Overall Rating */}
                  <div className="text-center lg:text-left mb-6 lg:mb-0">
                    <div className="flex items-center justify-center lg:justify-start mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-black-900 mb-2">4.88 out of 5</div>
                    <div className="text-black-600 text-sm sm:text-base">Based on 285 reviews</div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="flex-1 max-w-md mx-auto lg:mx-0 lg:ml-8">
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = stars === 5 ? 254 : stars === 4 ? 30 : stars === 1 ? 1 : 0;
                        const percentage = (count / 285) * 100;
                        return (
                          <div key={stars} className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-black-700 w-8">{stars}★</span>
                            <div className="flex-1 bg-white/50 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full bg-green-600 transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-black-700 w-12">{count}</span>
                </div>
                        );
                      })}
              </div>
            </div>

                  {/* Write Review Button */}
                  <div className="mt-6 lg:mt-0">
                    <button 
                      onClick={() => setShowReviewModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
                    >
                      Write a Review
                    </button>
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {/* Review 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">AS</span>
                      </div>
                      <div>
                        <div className="font-semibold text-black-900">Amit Sharma</div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          <span className="text-sm text-black-600 ml-2">2 days ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-black-700 leading-relaxed">Excellent product quality! The moringa powder is pure and authentic. I've been using it for my morning smoothies and noticed improved energy levels. Highly recommended!</p>
                </motion.div>

                {/* Review 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">PK</span>
                      </div>
                      <div>
                        <div className="font-semibold text-black-900">Priya Kumar</div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          <span className="text-sm text-black-600 ml-2">1 week ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-black-700 leading-relaxed">Great organic moringa powder. The packaging is excellent and the product quality is outstanding. Will definitely buy again!</p>
                </motion.div>

                {/* Review 3 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">RS</span>
                      </div>
                      <div>
                        <div className="font-semibold text-black-900">Rahul Singh</div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          <span className="text-sm text-black-600 ml-2">2 weeks ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-black-700 leading-relaxed">Pure and authentic moringa powder. I like the fact that it is a certified organic product. The taste is great and it's easy to mix in my daily routine.</p>
                </motion.div>

                {/* Review 4 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">MJ</span>
                      </div>
                      <div>
                        <div className="font-semibold text-black-900">Meera Joshi</div>
                        <div className="flex items-center space-x-1">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          {[...Array(1)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-gray-300" />
                          ))}
                          <span className="text-sm text-black-600 ml-2">3 weeks ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-black-700 leading-relaxed">Good quality product. The moringa powder is fresh and has a nice earthy taste. I use it in my tea and smoothies. Delivery was fast too!</p>
                </motion.div>

                {/* Review 5 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">VP</span>
                      </div>
                      <div>
                        <div className="font-semibold text-black-900">Vikram Patel</div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          <span className="text-sm text-black-600 ml-2">1 month ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-black-700 leading-relaxed">Amazing product! The moringa powder is of premium quality. I've been using it for my health supplements and the results are fantastic. Highly recommended for anyone looking for natural health products.</p>
                </motion.div>

                {/* Load More Reviews Button */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-center pt-6"
                >
                  <button className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold transition-colors">
                    <span>View More Reviews</span>
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Information Sections */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* INGREDIENTS */}
                <div className="border-b border-gray-200">
                  <button 
                    onClick={() => toggleSection('ingredients')}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-heading font-bold text-green-700">INGREDIENTS</h3>
                    {expandedSections.ingredients ? (
                      <ChevronDown className="w-5 h-5 text-green-700" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-green-700" />
                    )}
                  </button>
                  {expandedSections.ingredients && (
                    <div className="px-6 pb-4">
                      <p className="text-black-700 leading-relaxed">Dried moringa leaves</p>
                    </div>
                  )}
                </div>

                {/* USAGE INFO */}
                <div className="border-b border-gray-200">
                  <button 
                    onClick={() => toggleSection('usage')}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-heading font-bold text-green-700">USAGE INFO</h3>
                    {expandedSections.usage ? (
                      <ChevronDown className="w-5 h-5 text-green-700" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-green-700" />
                    )}
                  </button>
                  {expandedSections.usage && (
                    <div className="px-6 pb-4">
                      <p className="text-black-700 leading-relaxed">
                        Mix 1-2 teaspoons of moringa powder with water, juice, or smoothies. 
                        Can be added to tea, coffee, or used in cooking. Best consumed in the morning 
                        for maximum benefits. Start with a small amount and gradually increase as needed.
                      </p>
                    </div>
                  )}
                </div>

                {/* BENEFITS */}
                <div className="border-b border-gray-200">
                  <button 
                    onClick={() => toggleSection('benefits')}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-heading font-bold text-green-700">BENEFITS</h3>
                    {expandedSections.benefits ? (
                      <ChevronDown className="w-5 h-5 text-green-700" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-green-700" />
                    )}
                  </button>
                  {expandedSections.benefits && (
                    <div className="px-6 pb-4">
                      <ul className="text-black-700 leading-relaxed space-y-2">
                        <li>• Rich in vitamins A, C, and E</li>
                        <li>• High in antioxidants and minerals</li>
                        <li>• Supports immune system health</li>
                        <li>• Promotes healthy skin and hair</li>
                        <li>• Natural energy booster</li>
                        <li>• Helps maintain healthy blood sugar levels</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* STORAGE INFO */}
                <div>
                  <button 
                    onClick={() => toggleSection('storage')}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-heading font-bold text-green-700">STORAGE INFO</h3>
                    {expandedSections.storage ? (
                      <ChevronDown className="w-5 h-5 text-green-700" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-green-700" />
                    )}
                  </button>
                  {expandedSections.storage && (
                    <div className="px-6 pb-4">
                      <p className="text-black-700 leading-relaxed">
                        Store in a cool, dry place away from direct sunlight. Keep the container tightly 
                        sealed after each use. Best used within 12 months of opening. Refrigeration is 
                        not required but can help maintain freshness.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Suggested Products Section */}
        {suggestedProducts.length > 0 && (
          <section className="py-16 bg-beige-100">
            <div className="container-custom">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-heading font-bold text-black-900 mb-4">
                  You Might Also Like
                </h2>
                <p className="text-lg text-black-600 max-w-2xl mx-auto">
                  Discover more amazing products that complement your selection
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestedProducts.map((suggestedProduct, index) => (
                  <motion.div
                    key={suggestedProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer"
                  >
                    <Link to={`/product/${suggestedProduct.id}`}>
                      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                        <div className="relative overflow-hidden flex-shrink-0">
                          <img
                            src={suggestedProduct.image_url}
                            alt={suggestedProduct.name}
                            className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300 p-4"
                            onError={(e) => {
                              console.error('Failed to load suggested product image:', suggestedProduct.image_url);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          {suggestedProduct.originalPrice > suggestedProduct.price && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              {Math.round(((suggestedProduct.originalPrice - suggestedProduct.price) / suggestedProduct.originalPrice) * 100)}% OFF
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-beige-300/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-black-700">
                            {suggestedProduct.category}
                          </div>
                        </div>
                        
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="text-lg font-heading font-semibold text-black-900 mb-2 group-hover:text-green-700 transition-colors duration-300 line-clamp-2">
                            {suggestedProduct.name}
                          </h3>
                          
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(suggestedProduct.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-black-600">({suggestedProduct.reviews})</span>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-green-600 text-lg">₹{suggestedProduct.price}</span>
                              {suggestedProduct.originalPrice > suggestedProduct.price && (
                                <span className="text-sm text-black-500 line-through">₹{suggestedProduct.originalPrice}</span>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              suggestedProduct.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {suggestedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>

                          <div className="mt-auto">
                            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 text-sm">
                              View Product
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center mt-12"
              >
                <Link
                  to="/products"
                  className="inline-flex items-center space-x-2 bg-white hover:bg-gray-50 text-green-600 hover:text-green-700 font-semibold py-3 px-6 rounded-lg border border-green-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span>View All Products</span>
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </section>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              // Handle review submission here
              showNotification({
                type: 'success',
                message: 'Review submitted successfully!'
              });
              setShowReviewModal(false);
              setReviewForm({ rating: 5, title: '', comment: '', name: '' });
            }}>
              <div className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewForm.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Summarize your experience"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Comment *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Share your experience with this product..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ProductDetail;
