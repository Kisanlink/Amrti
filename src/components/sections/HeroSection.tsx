import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, TrendingUp, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-beige-50 via-beige-100 to-beige-200">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
                 <motion.div
                       className="absolute top-20 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-beige-200 rounded-full opacity-30"
          animate={{
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
                 <motion.div
                       className="absolute bottom-20 left-1/4 w-16 h-16 bg-green-300 rounded-full opacity-25"
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="relative z-10 container-custom py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            
                         <h1 className="text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-russet-900 mb-8 leading-tight">
               Transform Your <span className="text-green-600">Wellness</span> Journey
             </h1>
            
                         <p className="text-xl text-russet-800 mb-10 leading-relaxed max-w-2xl lg:max-w-none font-medium">
               Discover our premium collection of organic powders and probiotic kombucha drinks, 
               carefully crafted to enhance your daily wellness routine with nature's finest ingredients.
             </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center space-x-3 px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full shadow-elegant hover:shadow-premium transition-all duration-300 w-full sm:w-auto"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
               
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <button className="inline-flex items-center justify-center space-x-3 px-10 py-4 bg-russet-600 hover:bg-russet-700 text-white font-medium rounded-full shadow-elegant hover:shadow-premium transition-all duration-300 w-full sm:w-auto">
                  <Play className="w-5 h-5" />
                  <span>Our Story</span>
                </button>
              </motion.div>
            </div>
          </motion.div>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {[
              { icon: Users, value: '10K+', label: 'Happy Customers' },
              { icon: Award, value: '4.9★', label: 'Average Rating' },
              { icon: Star, value: '100%', label: 'Organic Products' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                                 className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-beige-200/50 shadow-elegant text-center"
              >
                <div className="flex justify-center mb-3">
                                     <div className="p-4 rounded-full bg-green-600 shadow-soft">
                     <stat.icon className="w-6 h-6 text-white" />
                   </div>
                </div>
                                 <div className="text-3xl font-heading font-bold text-russet-900 mb-2">
                   {stat.value}
                 </div>
                 <div className="text-sm text-russet-700 font-medium">
                   {stat.label}
                 </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
                         className="w-6 h-10 border-2 border-russet-700 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
                             className="w-1 h-3 bg-russet-700 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection; 