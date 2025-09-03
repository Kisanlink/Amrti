import { motion } from 'framer-motion';
import { ArrowLeft, Play, Leaf, Users, Award, FileText, Youtube, Clock, Star, CheckCircle, Shield, Truck, RotateCcw, Plus, Minus, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import ScrollToTop from '../components/ui/ScrollToTop';
import { useNotification } from '../context/NotificationContext';
import { addToCart } from '../services/cartService';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../services/wishlistService';

const MoringaDetail = () => {
  const { showNotification } = useNotification();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const product = {
    id: 'moringa-powder-101',
    name: 'Moringa Powder',
    description: 'Premium quality moringa powder with comprehensive lab testing and certification',
    price: 299,
    originalPrice: 399,
    image: '/products/pouch front mockup.jpg',
    category: 'Natural Powders',
    rating: 4.8,
    reviews: 156,
    inStock: true,
    batchNumber: '101',
    labReport: '/Test_report.pdf'
  };

  const currentVariant = { size: '100g', price: product.price, originalPrice: product.originalPrice };
  const discount = Math.round(((currentVariant.originalPrice - currentVariant.price) / currentVariant.originalPrice) * 100);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    try {
      addToCart(product.id, quantity, product);
      showNotification({
        type: 'success',
        message: `${product.name} added to cart successfully!`
      });
    } catch (err) {
      showNotification({
        type: 'error',
        message: 'Failed to add item to cart'
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    setIsUpdatingWishlist(true);
    try {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
        showNotification({
          type: 'success',
          message: `${product.name} removed from wishlist`
        });
      } else {
        addToWishlist(product);
        showNotification({
          type: 'success',
          message: `${product.name} added to wishlist`
        });
      }
    } catch (err) {
      showNotification({
        type: 'error',
        message: 'Failed to update wishlist'
      });
    } finally {
      setIsUpdatingWishlist(false);
    }
  };

  const isWishlisted = isInWishlist(product.id);

  return (
    <>
      <ScrollToTop />
      <div className="pt-16 sm:pt-20 bg-beige-300 min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-beige-400 to-beige-500"></div>
          <div className="relative z-10 container-custom py-8 sm:py-12 lg:py-16">
            <Link to="/moringa" className="inline-flex items-center space-x-2 mb-6 text-black-700 hover:text-green-600 transition-colors duration-300">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-heading font-semibold text-sm sm:text-base">Back to Moringa</span>
            </Link>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
              {/* Product Images */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex-1"
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-auto object-contain rounded-2xl shadow-xl"
                  />
                </motion.div>
              </div>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Batch #{product.batchNumber}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      Lab Tested
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-black-900 mb-4">
                    {product.name}
                  </h1>
                  <p className="text-lg text-black-700 mb-6">
                    {product.description}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-black-700 font-medium">{product.rating}</span>
                  <span className="text-black-600">({product.reviews} reviews)</span>
                </div>

                {/* Price */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-heading font-bold text-black-900">₹{currentVariant.price}</span>
                    <span className="text-xl text-black-500 line-through">₹{currentVariant.originalPrice}</span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                      {discount}% OFF
                    </span>
                  </div>
                  <p className="text-green-600 font-medium">Free shipping on orders above ₹500</p>
                </div>

                {/* Quantity and Actions */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-black-700">Size: {currentVariant.size}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-elegant hover:shadow-premium transition-all duration-300 disabled:opacity-50"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
                    </button>
                    <button
                      onClick={handleWishlistToggle}
                      disabled={isUpdatingWishlist}
                      className={`px-6 py-3 border-2 rounded-lg transition-all duration-300 ${
                        isWishlisted 
                          ? 'border-red-500 text-red-600 hover:bg-red-50' 
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-black-700">Lab Tested</p>
                  </div>
                  <div className="text-center">
                    <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-black-700">Free Shipping</p>
                  </div>
                  <div className="text-center">
                    <RotateCcw className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-black-700">Easy Returns</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-12 lg:py-16">
          <div className="container-custom">
            <div className="flex flex-wrap justify-center border-b border-gray-200 mb-8">
              {[
                { id: 'overview', label: 'Overview', icon: Leaf },
                { id: 'lab-report', label: 'Lab Report', icon: FileText },
                { id: 'benefits', label: 'Benefits', icon: Award },
                { id: 'usage', label: 'Usage', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-black-600 hover:text-black-900'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="max-w-4xl mx-auto">
              {activeTab === 'overview' && <OverviewContent />}
              {activeTab === 'lab-report' && <LabReportContent />}
              {activeTab === 'benefits' && <BenefitsContent />}
              {activeTab === 'usage' && <UsageContent />}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

// Overview Content Component
const OverviewContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-black-900 mb-4">
          Product <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Overview</span>
        </h2>
        <p className="text-lg text-black-700">
          Premium quality moringa powder with comprehensive testing and certification
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-heading font-bold text-black-900 mb-4">Product Details</h3>
          <ul className="space-y-3 text-black-700">
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>100% Pure Moringa Oleifera Leaf Powder</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>No additives, preservatives, or fillers</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Batch #{101} - Lab tested and certified</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>GMP certified manufacturing facility</span>
            </li>
          </ul>
        </div>

        <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-heading font-bold text-black-900 mb-4">Nutritional Profile</h3>
          <ul className="space-y-3 text-black-700">
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Rich in Vitamin C, A, and E</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>High in Iron, Calcium, and Potassium</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Powerful antioxidants and amino acids</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Natural anti-inflammatory properties</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

// Lab Report Content Component
const LabReportContent = () => {
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-black-900 mb-4">
          Lab <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Report</span>
        </h2>
        <p className="text-lg text-black-700">
          View our comprehensive quality testing and certification reports
        </p>
      </div>

      <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
        <div className="text-center mb-4 sm:mb-6">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-heading font-bold text-black-900 mb-3 sm:mb-4">
            Test Report - Batch #{101}
          </h3>
          <p className="text-black-700 mb-4 sm:mb-6 text-sm sm:text-base">
            View our comprehensive quality testing report
          </p>
        </div>
        
        {/* PDF Viewer */}
        <div className="w-full h-80 sm:h-96 md:h-[500px] lg:h-[600px] bg-white rounded-lg overflow-hidden shadow-lg relative">
          {pdfLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}
          
          {pdfError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center p-6">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Unable to load PDF viewer</p>
                <p className="text-sm text-gray-500">Please use the download link below</p>
              </div>
            </div>
          ) : (
            <iframe
              src="/Test_report.pdf#toolbar=1&navpanes=1&scrollbar=1"
              className="w-full h-full"
              title="Test Report PDF"
              allowFullScreen
              onLoad={() => setPdfLoading(false)}
              onError={() => {
                setPdfLoading(false);
                setPdfError(true);
              }}
            />
          )}
        </div>
        
        {/* Fallback Download Link */}
        <div className="mt-4 text-center">
          <a
            href="/Test_report.pdf"
            download="Amrti_Quality_Test_Report_Batch_101.pdf"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-elegant hover:shadow-premium transition-all duration-300"
          >
            <FileText className="w-5 h-5" />
            <span>Download Test Report</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

// Benefits Content Component
const BenefitsContent = () => {
  const benefits = [
    {
      icon: Leaf,
      title: 'Immune Support',
      description: 'Rich in vitamin C and antioxidants that help strengthen your immune system'
    },
    {
      icon: Award,
      title: 'Energy Boost',
      description: 'Natural source of iron and B vitamins for sustained energy throughout the day'
    },
    {
      icon: Shield,
      title: 'Anti-inflammatory',
      description: 'Contains compounds that help reduce inflammation and support joint health'
    },
    {
      icon: Users,
      title: 'Digestive Health',
      description: 'High fiber content supports healthy digestion and gut microbiome'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-black-900 mb-4">
          Health <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Benefits</span>
        </h2>
        <p className="text-lg text-black-700">
          Discover the incredible health benefits of our premium moringa powder
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <benefit.icon className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-heading font-bold text-black-900 mb-3">{benefit.title}</h3>
            <p className="text-black-700">{benefit.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Usage Content Component
const UsageContent = () => {
  const usageMethods = [
    {
      title: 'Smoothies & Shakes',
      description: 'Add 1-2 teaspoons to your favorite smoothie or protein shake',
      icon: '🥤'
    },
    {
      title: 'Tea & Beverages',
      description: 'Mix with hot water, honey, and lemon for a nutritious tea',
      icon: '☕'
    },
    {
      title: 'Cooking & Baking',
      description: 'Incorporate into soups, sauces, or baked goods for added nutrition',
      icon: '🍳'
    },
    {
      title: 'Direct Consumption',
      description: 'Take 1/2 to 1 teaspoon with water or juice on an empty stomach',
      icon: '💊'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-black-900 mb-4">
          How to <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Use</span>
        </h2>
        <p className="text-lg text-black-700">
          Simple and effective ways to incorporate moringa powder into your daily routine
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {usageMethods.map((method, index) => (
          <motion.div
            key={method.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="text-4xl mb-4">{method.icon}</div>
            <h3 className="text-xl font-heading font-bold text-black-900 mb-3">{method.title}</h3>
            <p className="text-black-700">{method.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
        <h3 className="text-lg font-heading font-bold text-yellow-800 mb-3">Recommended Dosage</h3>
        <p className="text-yellow-700 mb-3">
          Start with 1/2 teaspoon daily and gradually increase to 1-2 teaspoons based on your body's response.
        </p>
        <p className="text-yellow-700 text-sm">
          <strong>Note:</strong> Consult with your healthcare provider before starting any new supplement, especially if you have underlying health conditions or are taking medications.
        </p>
      </div>
    </motion.div>
  );
};

export default MoringaDetail;
