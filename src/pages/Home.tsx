import { motion } from 'framer-motion';
import { Play, ArrowRight, Star, Leaf, Heart, Users, Award, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollToTop from '../components/ui/ScrollToTop';
import HeroSection from '../components/sections/HeroSection';
import MissionSection from '../components/sections/MissionSection';
import ValuesSection from '../components/sections/ValuesSection';
import ProductsSection from '../components/sections/ProductsSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
// import StorySection from '../components/sections/StorySection';

const Home = () => {
  return (
    <>
      <ScrollToTop />
      <div className="pt-16 sm:pt-20 bg-beige-200">
      <HeroSection />
      
      {/* Professional Divider Section */}
      <motion.section 
        className="py-12 sm:py-16 bg-gradient-to-r from-beige-400 via-beige-300 to-beige-400"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="container-custom">
          <motion.div 
            className="text-center"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-4 sm:mb-6 px-4 sm:px-0">
                               <div className="h-px bg-gradient-to-r from-transparent via-tea-400 to-transparent flex-1"></div>
         <div className="flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/90 rounded-full border border-tea-200 shadow-soft">
           <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-tea-600" />
           <span className="font-medium text-tea-700 tracking-wide text-sm sm:text-base">Premium Quality</span>
           <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-tea-600" />
         </div>
         <div className="h-px bg-gradient-to-r from-transparent via-tea-400 to-transparent flex-1"></div>
            </div>
                          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-russet-800 mb-3 sm:mb-4">
              Transforming Lives Through Natural Products
            </h2>
            <p className="text-base sm:text-lg text-black-700 max-w-3xl mx-auto px-4 sm:px-0">
              Discover our commitment to sustainable farming, premium quality, and community empowerment
            </p>
          </motion.div>
        </div>
      </motion.section>

      <MissionSection />
      
      {/* Product Banner Section */}
      <motion.section 
        className="py-16 sm:py-20 bg-gradient-to-br from-beige-300 to-beige-400"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
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
      </motion.section>
      
      {/* Enhanced Story Section with Beige Background */}
      <motion.section 
        className="py-16 sm:py-20 bg-gradient-to-br from-beige-400 to-beige-500"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Story Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
                              <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4 sm:mb-6">
                  Our <span className="text-tea-600">Story</span>
                </h2>
                <p className="text-base sm:text-lg text-russet-700 leading-relaxed mb-4 sm:mb-6 font-medium">
                Amrti is a brand conceived with the intention of empowering farmers and Self-Help Groups (SHGs) 
                through an innovative buy-back model utilizing solar dryers. Our mission is to transform the 
                agricultural landscape by providing farmers with sustainable solutions that enhance their livelihoods 
                while promoting eco-friendly practices.
              </p>
              <p className="text-base sm:text-lg text-black-700 leading-relaxed mb-6 sm:mb-8">
                At Amrti, we specialize in processing dried vegetables and fruits into high-quality powders. 
                This not only extends the shelf life of these nutritious products but also adds value to the 
                raw materials sourced from our farmers.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                                    className="px-8 sm:px-10 py-4 sm:py-5 bg-tea-300 hover:bg-tea-400 text-russet-800 font-medium rounded-full shadow-elegant hover:shadow-premium transition-all duration-300 text-sm sm:text-base"
              >
                <span className="flex items-center space-x-2">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
              </motion.button>
            </motion.div>

            {/* Story Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 gap-6"
            >
              {[
                {
                  icon: Users,
                  title: 'Empowerment for Farmers',
                  description: 'Providing farmers with a steady income stream through our reliable buy-back model',
                },
                {
                  icon: Heart,
                  title: 'Support for SHGs',
                  description: 'Collaborating with Self-Help Groups to foster community development',
                },
                {
                  icon: Leaf,
                  title: 'Consumer Health',
                  description: 'Nutrient-rich products free from preservatives and additives',
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-start space-x-4 p-8 rounded-2xl bg-white/90 backdrop-blur-sm border border-beige-200/50 hover:border-tea-300/50 transition-all duration-300 shadow-elegant"
                >
                  <div className="flex-shrink-0">
                                  <div className="w-14 h-14 rounded-xl bg-tea-300 flex items-center justify-center shadow-soft">
                <benefit.icon className="w-7 h-7 text-russet-800" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-bold text-russet-800 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-russet-600 leading-relaxed font-medium">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      <ValuesSection />
      
      {/* Professional Feature Highlight */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-beige-50 via-beige-100 to-beige-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: "Premium Quality",
                description: "Solar-dried, nutrient-rich products with no preservatives",
                color: "bg-tea-300"
              },
              {
                icon: Heart,
                title: "Community Impact",
                description: "Empowering farmers and Self-Help Groups nationwide",
                color: "from-beige-600 to-beige-700"
              },
              {
                icon: Leaf,
                title: "Sustainable Process",
                description: "Eco-friendly solar drying technology for minimal environmental impact",
                color: "bg-russet-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <div className="relative p-10 rounded-2xl bg-white/90 backdrop-blur-sm border border-beige-200/50 shadow-elegant hover:shadow-premium transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-beige-100/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                                         <h3 className="text-xl font-heading font-bold text-russet-800 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-russet-600 leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <ProductsSection />
      
      {/* Call to Action Section with Beige Theme */}
      <motion.section 
        className="py-24 bg-gradient-to-br from-beige-100 via-beige-200 to-beige-300"
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
                    <Target className="w-8 h-8 text-white-50" />
                  </div>
                </div>
                <h2 className="text-4xl font-heading font-bold text-black-900 mb-6">
                  Ready to Transform Your Wellness Journey?
                </h2>
                <p className="text-xl text-black-700 mb-8 leading-relaxed">
                  Join thousands of satisfied customers who have discovered the power of premium natural products
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/products"
                      className="inline-block px-10 py-5 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-full shadow-elegant hover:shadow-premium transition-all duration-300"
                    >
                      <span className="flex items-center space-x-2">
                        <span>Explore Products</span>
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </Link>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-black-800 text-black-800 hover:bg-black-800 hover:text-white-50 font-heading font-semibold rounded-full transition-all duration-300"
                  >
                    <span className="flex items-center space-x-2">
                      <Play className="w-5 h-5" />
                      <span>Our Story</span>
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <TestimonialsSection />
    </div>
    </>
  );
};

export default Home; 