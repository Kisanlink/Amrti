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
              <div className="h-px bg-gradient-to-r from-transparent via-green-400 to-transparent flex-1"></div>
              <div className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-beige-500/80 rounded-full border border-green-200">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="font-heading font-semibold text-green-700 tracking-wide text-sm sm:text-base">Premium Quality</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-green-400 to-transparent flex-1"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black-900 mb-3 sm:mb-4">
              Transforming Lives Through Natural Products
            </h2>
            <p className="text-base sm:text-lg text-black-700 max-w-3xl mx-auto px-4 sm:px-0">
              Discover our commitment to sustainable farming, premium quality, and community empowerment
            </p>
          </motion.div>
        </div>
      </motion.section>

      <MissionSection />
      
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
                Our <span className="text-gradient bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Story</span>
              </h2>
              <p className="text-base sm:text-lg text-black-700 leading-relaxed mb-4 sm:mb-6">
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
                                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
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
                  className="flex items-start space-x-4 p-6 rounded-xl bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 hover:border-green-300/50 transition-all duration-300"
                >
                  <div className="flex-shrink-0">
                                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <benefit.icon className="w-6 h-6 text-white-50" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
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
        className="py-16 bg-gradient-to-r from-beige-300 via-beige-400 to-beige-300"
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
                color: "from-green-500 to-green-600"
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
                color: "from-green-600 to-green-700"
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
                <div className="relative p-8 rounded-2xl bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-beige-100/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-7 h-7 text-white-50" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-black-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-black-700 leading-relaxed">
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
        className="py-20 bg-gradient-to-br from-beige-500 via-beige-400 to-beige-600"
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
                      className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
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