import { motion } from 'framer-motion';
import { ArrowLeft, Star, Heart, Leaf, Shield, Truck, RotateCcw, Award, Plus, Minus, ShoppingCart, ChevronDown, ChevronUp, ChevronRight, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ScrollToTop from '../components/ui/ScrollToTop';
import ProductService from '../services/productService';
import CartService from '../services/cartService';
import ReviewService, { type Review } from '../services/reviewService';
import ReviewCard from '../components/ui/ReviewCard';
import ReviewForm from '../components/ui/ReviewForm';
import { useNotification } from '../context/NotificationContext';
import { useIsInWishlist, useToggleWishlist } from '../hooks/queries/useWishlist';

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  // Use React Query hooks for wishlist
  const { data: isInWishlist = false, isLoading: isCheckingWishlist } = useIsInWishlist(id || '');
  const toggleWishlistMutation = useToggleWishlist();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    ingredients: true,
    usage: false,
    benefits: false,
    storage: false
  });
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const { showNotification } = useNotification();


  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!id || !product) return;
    
    toggleWishlistMutation.mutate(
      { productId: id, isInWishlist },
      {
        onSuccess: () => {
          showNotification({
            type: 'success',
            message: isInWishlist 
              ? `${product.name} removed from wishlist`
              : `${product.name} added to wishlist successfully!`
          });
        },
        onError: () => {
          showNotification({
            type: 'error',
            message: 'Failed to update wishlist'
          });
        }
      }
    );
  };


  // Auto-scroll functionality
  useEffect(() => {
    if (!product || !isAutoScroll) {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        setAutoScrollInterval(null);
      }
      return;
    }

    const allImageUrls = [
      product.image_url,
      product.image_url_1,
      product.image_url_2,
      product.image_url_3,
      product.image_url_4
    ].filter(url => url && url.trim() !== '');

    if (allImageUrls.length <= 1) {
      return; // No need to auto-scroll if there's only one image
    }

    const interval = setInterval(() => {
      setSelectedImageIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % allImageUrls.length;
        console.log('Auto-scrolling to image:', nextIndex);
        return nextIndex;
      });
    }, 3000); // Change image every 3 seconds

    setAutoScrollInterval(interval);

    return () => {
      clearInterval(interval);
      setAutoScrollInterval(null);
    };
  }, [product, isAutoScroll]);

  // Load product, reviews, and suggested products on mount
  useEffect(() => {
    const loadProductData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

        try {
          setLoading(true);
        setReviewsLoading(true);
        
        // Load product data
          const productData = await ProductService.getProductById(id);
          setProduct(productData);
          setSelectedImageIndex(0); // Reset to first image when loading new product
          setIsZoomed(false); // Reset zoom state
          setMousePosition({ x: 50, y: 50 }); // Reset mouse position
        
        // Load reviews
        const reviewsResponse = await Promise.allSettled([
          ReviewService.getProductReviews(id, 1, 10)
        ]).then(results => results[0]);
        
        // Handle reviews
        if (reviewsResponse.status === 'fulfilled') {
          const response = reviewsResponse.value;
          // For moringa products, always show static reviews first, then add API reviews
          if (productData && (productData.name?.toLowerCase().includes('moringa') || productData.category?.toLowerCase().includes('moringa'))) {
            const staticReviews = ReviewService.getFallbackReviews();
            setReviews([...staticReviews, ...response.reviews]);
          } else {
            // For non-moringa products, show only API reviews (will be empty for new products)
            setReviews(response.reviews);
          }
        } else {
          console.error('Failed to load reviews:', reviewsResponse.reason);
          // Use fallback reviews for moringa products only
          if (productData && (productData.name?.toLowerCase().includes('moringa') || productData.category?.toLowerCase().includes('moringa'))) {
            setReviews(ReviewService.getFallbackReviews());
          } else {
            setReviews([]);
          }
        }
        
        // Wishlist status is now handled by React Query hooks
          
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
        setReviewsLoading(false);
      }
    };
    
    loadProductData();
  }, [id]);

  // Wishlist updates are now handled by React Query automatically

  // Handle review like update
  const handleReviewLikeUpdate = (reviewId: string, likesCount: number, hasUserLiked: boolean) => {
    console.log('handleReviewLikeUpdate called:', { reviewId, likesCount, hasUserLiked });
    setReviews(prevReviews => {
      const updatedReviews = prevReviews.map(review => 
        review.id === reviewId 
          ? { ...review, likes_count: likesCount, is_user_liked: hasUserLiked }
          : review
      );
      console.log('Updated reviews:', updatedReviews);
      return updatedReviews;
    });
  };

  const handleReviewDelete = (reviewId: string) => {
    console.log('handleReviewDelete called:', { reviewId });
    setReviews(prevReviews => {
      const updatedReviews = prevReviews.filter(review => review.id !== reviewId);
      console.log('Updated reviews after delete:', updatedReviews);
      return updatedReviews;
    });
  };

  // Handle new review submission
  const handleReviewSubmitted = (newReview: Review) => {
    setReviews(prevReviews => [newReview, ...prevReviews]);
    setShowReviewForm(false);
  };

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

  // Handle mouse events for zoom functionality
  const handleMouseEnter = () => {
    console.log('Mouse entered - setting zoom to true');
    setIsZoomed(true);
    
    // Pause auto-scroll when hovering for zoom
    if (isAutoScroll) {
      setIsAutoScroll(false);
      console.log('Auto-scroll paused due to hover');
    }
  };

  const handleMouseLeave = () => {
    console.log('Mouse left - setting zoom to false');
    setIsZoomed(false);
    // Reset mouse position when leaving
    setMousePosition({ x: 50, y: 50 });
    
    // Resume auto-scroll after a short delay when leaving hover
    setTimeout(() => {
      if (!isAutoScroll) {
        setIsAutoScroll(true);
        console.log('Auto-scroll resumed after hover');
      }
    }, 1000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setMousePosition({ x, y });
      console.log('Mouse move:', { x, y, isZoomed });
    } catch (error) {
      console.error('Error in handleMouseMove:', error);
      // Fallback to center position
      setMousePosition({ x: 50, y: 50 });
    }
  };

  // Reset zoom state when image changes
  const handleImageChange = (index: number) => {
    console.log('Changing image to index:', index);
    setSelectedImageIndex(index);
    setIsZoomed(false);
    setMousePosition({ x: 50, y: 50 });
    
    // Pause auto-scroll when user manually selects an image
    if (isAutoScroll) {
      setIsAutoScroll(false);
      console.log('Auto-scroll paused due to manual image selection');
    }
  };


  return (
    <>
      <ScrollToTop />
      <div className="pt-16 sm:pt-20 bg-beige-300 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-beige-400 to-beige-500"></div>
        <div className="relative z-10 container-custom py-6 sm:py-8 lg:py-12 px-4 sm:px-6">
          <Link to="/products" className="inline-flex items-center space-x-2 mb-4 sm:mb-6 text-black-700 hover:text-green-600 transition-colors duration-300">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-heading font-semibold text-sm sm:text-base">Back to Products</span>
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 items-start">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Product Image - Larger size with interactive zoom feature */}
              <div className="relative">
                <div 
                  className="relative overflow-hidden rounded-xl shadow-xl bg-white aspect-square cursor-zoom-in transition-all duration-300 ease-out"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                  style={{
                    boxShadow: isZoomed ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                {(() => {
                  // Get all available image URLs
                  const allImageUrls = [
                    product.image_url,
                    product.image_url_1,
                    product.image_url_2,
                    product.image_url_3,
                    product.image_url_4
                  ].filter(url => url && url.trim() !== '');
                  
                  // Ensure we have at least one image
                  if (allImageUrls.length === 0) {
                    return (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="text-center text-gray-500">
                          <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📦</span>
                          </div>
                          <p className="text-sm">No image available</p>
                        </div>
                      </div>
                    );
                  }
                  
                  // Get the current image to display
                  const safeIndex = Math.min(selectedImageIndex, allImageUrls.length - 1);
                  const currentImage = allImageUrls[safeIndex];
                  
                  console.log('Rendering image:', { currentImage, isZoomed, mousePosition, safeIndex });
                  
                  return (
                     <img 
                       key={`main-image-${safeIndex}`}
                       src={currentImage} 
                       alt={product.name} 
                       className="w-full h-full object-contain p-6 transition-all duration-300 ease-out pointer-events-none"
                       style={{
                         transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                         transform: isZoomed ? `scale(2.2) translate(${(50 - mousePosition.x) * 0.3}%, ${(50 - mousePosition.y) * 0.3}%)` : 'scale(1)',
                         filter: isZoomed ? 'brightness(1.05)' : 'brightness(1)',
                         willChange: 'transform'
                       }}
                       onError={(e) => {
                         console.error('Failed to load product image:', currentImage);
                         // Show fallback content instead of hiding
                         e.currentTarget.style.display = 'none';
                         const fallbackDiv = document.createElement('div');
                         fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-gray-100';
                         fallbackDiv.innerHTML = `
                           <div class="text-center text-gray-500">
                             <div class="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                               <span class="text-2xl">📦</span>
                             </div>
                             <p class="text-sm">Image failed to load</p>
                           </div>
                         `;
                         e.currentTarget.parentNode?.appendChild(fallbackDiv);
                       }}
                       onLoad={() => {
                         console.log('Image loaded successfully:', currentImage);
                       }}
                     />
                  );
                })()}
                {discount > 0 && (
                     <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold z-10">
                    {discount}% OFF
                  </div>
                )}
                   {/* Wishlist Icon */}
                   <div className="absolute top-3 left-3 z-10">
                     <button 
                       onClick={handleWishlistToggle}
                       disabled={toggleWishlistMutation.isPending || isCheckingWishlist}
                       className={`p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors disabled:opacity-50 ${
                         isInWishlist ? 'text-red-500' : 'text-gray-600'
                       }`}
                       title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                     >
                       {toggleWishlistMutation.isPending || isCheckingWishlist ? (
                         <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                       ) : (
                         <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                       )}
                     </button>
                   </div>
                   {/* Zoom indicator */}
                   <div className={`absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs transition-all duration-300 z-10 ${
                     isZoomed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                   }`}>
                     {isZoomed ? 'Move mouse to explore' : 'Hover to zoom'}
                   </div>
                 </div>
              </div>

              {/* Thumbnail Gallery - Below main image */}
              <div className="flex justify-center">
                <div className="flex gap-3 overflow-x-auto pb-2">
                   {/* Create array of all available image URLs */}
                    {(() => {
                      const allImageUrls = [
                        product.image_url,
                        product.image_url_1,
                        product.image_url_2,
                        product.image_url_3,
                        product.image_url_4
                      ].filter(url => url && url.trim() !== '');
                      
                      // If no images available, don't show thumbnails
                      if (allImageUrls.length === 0) {
                        return null;
                      }
                      
                      return allImageUrls.map((imageUrl, index) => (
                         <div 
                           key={`thumb-${index}`}
                           onClick={() => handleImageChange(index)}
                           className={`relative overflow-hidden rounded-lg bg-white p-2 shadow-sm hover:border-green-600 transition-all duration-300 cursor-pointer w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 ${
                             index === selectedImageIndex ? 'border-2 border-green-600 shadow-md scale-105' : 'border border-gray-200 hover:scale-105'
                           }`}
                         >
                         <img 
                           src={imageUrl} 
                           alt={`${product.name} - Image ${index + 1}`} 
                           className="w-full h-full object-contain" 
                           onError={(e) => {
                             console.error('Failed to load thumbnail image:', imageUrl);
                             // Show a placeholder for failed thumbnails
                             e.currentTarget.style.display = 'none';
                             const placeholder = document.createElement('div');
                             placeholder.className = 'w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs';
                             placeholder.textContent = '📦';
                             e.currentTarget.parentNode?.appendChild(placeholder);
                           }}
                         />
                         </div>
                       ));
                   })()}
                 </div>
               </div>
            </div>

            {/* Product Info */}
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              {/* Product Title & Rating */}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-heading font-bold text-black-900 mb-1 sm:mb-2">
                  {product.name}
                </h1>
                
                {/* Product Description */}
                <p className="text-black-600 text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 leading-relaxed">
                  {product.description}
                </p>
                
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-black-600 text-xs sm:text-sm">({product.reviews} reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">₹{currentVariant.price}</span>
                  {currentVariant.originalPrice > currentVariant.price && (
                    <span className="text-base sm:text-lg lg:text-xl text-black-500 line-through">₹{currentVariant.originalPrice}</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-black-600">Inclusive of all taxes</p>
              </div>

              {/* Size Display - Fixed 100g */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-heading font-semibold text-black-900 text-sm sm:text-base">Size:</h3>
                <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg border-2 border-green-600 bg-green-600 text-white font-semibold text-sm sm:text-base w-fit">
                  100g
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-heading font-semibold text-black-900 text-sm sm:text-base">Quantity:</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg bg-white w-fit">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="p-2 sm:p-3 hover:bg-gray-100 transition-colors rounded-l-lg"
                    >
                      <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <span className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base min-w-[50px] sm:min-w-[60px] lg:min-w-[80px] text-center">{quantity}</span>
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
              <div className="space-y-1 sm:space-y-2">
                {product.stock === 0 || product.stock_status === "Comming Soon" ? (
                  <button 
                    disabled
                    className="w-full bg-gray-400 text-white font-heading font-semibold py-2.5 sm:py-3 lg:py-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 cursor-not-allowed text-sm sm:text-base"
                  >
                    <span>COMING SOON</span>
                  </button>
                ) : (
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
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-heading font-semibold py-2.5 sm:py-3 lg:py-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Highlights Section */}
      {/* <section className="py-4 sm:py-6 lg:py-8">
        <div className="container-custom px-4 sm:px-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
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
      </section> */}

        {/* Product Information Sections - Only for Moringa Products */}
        {product && (product.name?.toLowerCase().includes('moringa') || product.category?.toLowerCase().includes('moringa')) && (
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
        )}

        {/* Suggested Products Section */}
        {suggestedProducts.length > 0 && (
          <section className="py-8 sm:py-12 lg:py-16 bg-beige-100">
            <div className="container-custom px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-8 sm:mb-10 lg:mb-12"
              >
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black-900 mb-2 sm:mb-4">
                  You Might Also Like
                </h2>
                <p className="text-base sm:text-lg text-black-600 max-w-2xl mx-auto">
                  Discover more amazing products that complement your selection
                </p>
              </motion.div>

              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-4 min-w-max">
                {suggestedProducts.map((suggestedProduct, index) => (
                  <motion.div
                    key={suggestedProduct.id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                      className="group cursor-pointer flex-shrink-0"
                  >
                    <Link to={`/product/${suggestedProduct.id}`}>
                        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden w-64 h-64 flex flex-col">
                        <div className="relative overflow-hidden flex-shrink-0">
                          <img
                            src={suggestedProduct.image_url}
                            alt={suggestedProduct.name}
                              className="w-full h-32 object-contain group-hover:scale-105 transition-transform duration-300 p-2"
                            onError={(e) => {
                              console.error('Failed to load suggested product image:', suggestedProduct.image_url);
                              // Show fallback for suggested product images
                              e.currentTarget.style.display = 'none';
                              const fallbackDiv = document.createElement('div');
                              fallbackDiv.className = 'w-full h-32 flex items-center justify-center bg-gray-100';
                              fallbackDiv.innerHTML = `
                                <div class="text-center text-gray-400">
                                  <div class="text-2xl mb-1">📦</div>
                                  <div class="text-xs">No Image</div>
                                </div>
                              `;
                              e.currentTarget.parentNode?.appendChild(fallbackDiv);
                            }}
                          />
                          {suggestedProduct.originalPrice > suggestedProduct.price && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold">
                              {Math.round(((suggestedProduct.originalPrice - suggestedProduct.price) / suggestedProduct.originalPrice) * 100)}% OFF
                            </div>
                          )}
                            <div className="absolute top-2 right-2 bg-beige-300/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-xs font-semibold text-black-700">
                            {suggestedProduct.category}
                          </div>
                        </div>
                        
                          <div className="p-2 flex flex-col flex-grow">
                            <h3 className="text-sm font-heading font-semibold text-black-900 mb-1 group-hover:text-green-700 transition-colors duration-300 line-clamp-2">
                            {suggestedProduct.name}
                          </h3>
                          
                            <div className="flex items-center space-x-1 mb-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                    className={`w-3 h-3 ${i < Math.floor(suggestedProduct.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                              </div>
                              <span className="text-xs text-black-600">({suggestedProduct.reviews})</span>
                          </div>

                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-1">
                                <span className="font-bold text-green-600 text-sm">₹{suggestedProduct.price}</span>
                              {suggestedProduct.originalPrice > suggestedProduct.price && (
                                  <span className="text-xs text-black-500 line-through">₹{suggestedProduct.originalPrice}</span>
                              )}
                            </div>
                              <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                              suggestedProduct.stock_status === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {suggestedProduct.stock_status}
                            </span>
                          </div>

                            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 rounded-lg transition-colors duration-300 text-xs mt-auto">
                              View Product
                            </button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                </div>
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

        {/* Customer Reviews Section - Show only when there are reviews */}
        {product && reviews.length > 0 && !reviewsLoading && (
        <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="container-custom px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              {/* Reviews Header */}
              <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-black-900 mb-2 sm:mb-3 lg:mb-4">Customer Reviews</h2>
                <p className="text-black-600 text-sm sm:text-base lg:text-lg">See what our customers are saying about this product</p>
            </div>

              {/* Reviews Summary Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
                <div className="flex flex-col lg:flex-row items-center justify-between">
                  {/* Overall Rating */}
                  <div className="text-center lg:text-left mb-4 sm:mb-6 lg:mb-0">
                    <div className="flex items-center justify-center lg:justify-start mb-2 sm:mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black-900 mb-1 sm:mb-2">
                        {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)} out of 5
                  </div>
                      <div className="text-black-600 text-xs sm:text-sm lg:text-base">Based on {reviews.length} reviews</div>
                </div>

                  {/* Write Review Button */}
                  <div className="mt-6 lg:mt-0">
                    <button 
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
                    >
                      Write a Review
                    </button>
                  </div>
                </div>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="mb-8">
                    <ReviewForm
                      productId={id!}
                      onReviewSubmitted={handleReviewSubmitted}
                      onCancel={() => setShowReviewForm(false)}
                  />
                </div>
                )}

              {/* Individual Reviews */}
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      productId={id}
                      onLikeUpdate={handleReviewLikeUpdate}
                      onDelete={handleReviewDelete}
                    />
                  ))}
                        </div>
                      </div>
                </div>
          </section>
        )}

        {/* Be the First to Review Section - Show when no reviews */}
        {product && reviews.length === 0 && !reviewsLoading && (
          <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-green-50 to-green-100">
            <div className="container-custom px-4 sm:px-6">
              <div className="max-w-2xl mx-auto text-center">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-2xl p-8 sm:p-12 shadow-xl border border-green-200"
                >
                  {/* Icon */}
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Star className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 mb-4">
                    Be the First to Review!
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    {product && (product.name?.toLowerCase().includes('moringa') || product.category?.toLowerCase().includes('moringa'))
                      ? "Share your experience with this moringa product and help others make informed decisions."
                      : "This is a new product. Share your experience and help others discover its benefits."
                    }
                  </p>

                  {/* Write Review Button */}
                  <button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Star className="w-5 h-5" />
                    <span>Write the First Review</span>
                </button>
          </motion.div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="mt-8">
                    <ReviewForm
                      productId={id!}
                      onReviewSubmitted={handleReviewSubmitted}
                      onCancel={() => setShowReviewForm(false)}
                    />
        </div>
      )}
            </div>
          </div>
        </section>
        )}
      </div>

    </>
  );
};

export default ProductDetail;
