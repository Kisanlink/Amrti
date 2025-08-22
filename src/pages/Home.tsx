import { motion } from 'framer-motion';
import { Play, ArrowRight, Star, Leaf, Heart, Users, Award, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollToTop from '../components/ui/ScrollToTop';
import HeroSection from '../components/sections/HeroSection';
import ValuesSection from '../components/sections/ValuesSection';
import ProductsSection from '../components/sections/ProductsSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';

const Home = () => {
  return (
    <>
      <ScrollToTop />
      <div className="pt-16 sm:pt-20 bg-beige-200">
                {/* Product Banner Section - Compact & Efficient */}
        <motion.section 
          className="py-8 sm:py-12 bg-gradient-to-br from-beige-300 to-beige-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Content Side */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-russet-900 mb-4">
                  Pure <span className="text-green-600">Goodness</span>
                </h2>
                <p className="text-lg sm:text-xl text-russet-800 mb-6 leading-relaxed">
                  Packed with Nature's Power
                </p>
                <p className="text-base sm:text-lg text-russet-700 leading-relaxed mb-6">
                  Our mission is to provide high quality health and wellness products sourced through organic and sustainable practices.
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Link
                    to="/products"
                    className="inline-flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full shadow-elegant hover:shadow-premium transition-all duration-300"
                  >
                    <span>Explore Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.div>
              
              {/* Image Side */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <img
                  src="/products/product_banner.jpg"
                  alt="Amrti Natural Products Collection"
                  className="w-full h-auto rounded-2xl shadow-elegant"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-russet-900/20 to-transparent rounded-2xl"></div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Hero Section - Transform Your Journey */}
        <HeroSection />
        
        {/* Values Section - What We Stand For */}
        <ValuesSection />
        
        {/* Products Section - Featured Products */}
        <ProductsSection />
        
        {/* Testimonials Section - Customer Reviews */}
        <TestimonialsSection />
        
        {/* Call to Action Section - Final Conversion */}
        <motion.section 
          className="py-16 sm:py-20 bg-gradient-to-br from-beige-100 via-beige-200 to-beige-300"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
        <div className="container-custom">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative p-12 rounded-3xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-beige-100/50 to-green-100/30 rounded-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 rounded-full bg-green-600">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-4xl font-heading font-bold text-russet-900 mb-6">
                  Ready to Transform Your Wellness Journey?
                </h2>
                <p className="text-xl text-russet-800 mb-8 leading-relaxed">
                  Join thousands of satisfied customers who have discovered the power of premium natural products
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/products"
                      className="inline-block px-10 py-5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full shadow-elegant hover:shadow-premium transition-all duration-300"
                    >
                      <span className="flex items-center space-x-2">
                        <span>Explore Products</span>
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/about"
                      className="inline-block px-8 py-4 border-2 border-russet-700 text-russet-700 hover:bg-russet-700 hover:text-white font-heading font-semibold rounded-full transition-all duration-300"
                    >
                      <span className="flex items-center space-x-2">
                        <Play className="w-5 h-5" />
                        <span>Our Story</span>
                      </span>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
    </>
  );
};

export default Home; 