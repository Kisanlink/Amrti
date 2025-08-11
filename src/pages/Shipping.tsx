import { motion } from 'framer-motion';
import { ArrowLeft, Truck, Clock, MapPin, Package, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Shipping = () => {
  return (
    <div className="pt-20 bg-beige-300 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-beige-400 to-beige-500"></div>
        <div className="relative z-10 container-custom py-16">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8 text-black-700 hover:text-green-600 transition-colors duration-300">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-heading font-semibold">Back to Home</span>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 rounded-full bg-green-600">
                <Truck className="w-8 h-8 text-white-50" />
              </div>
            </div>
            <h1 className="text-5xl font-heading font-bold text-black-900 mb-6">
              Shipping <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-black-700 leading-relaxed">
              We aim to deliver your orders swiftly and safely.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Shipping Content */}
      <section className="py-16 bg-gradient-to-br from-beige-400 to-beige-500">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Shipping Regions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-lg bg-green-600">
                  <MapPin className="w-6 h-6 text-white-50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-black-900">Shipping Regions</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  We currently deliver within India. For international shipping, please contact us.
                </p>
              </div>
            </motion.div>

            {/* Processing Time */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-lg bg-green-600">
                  <Clock className="w-6 h-6 text-white-50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-black-900">Processing Time</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  Orders are processed and shipped within 2–3 business days.
                </p>
              </div>
            </motion.div>

            {/* Delivery Time */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-lg bg-green-600">
                  <Truck className="w-6 h-6 text-white-50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-black-900">Delivery Time</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  Typically, 5–7 business days post-dispatch (may vary by location).
                </p>
              </div>
            </motion.div>

            {/* Charges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-lg bg-green-600">
                  <Package className="w-6 h-6 text-white-50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-black-900">Charges</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  Shipping costs are calculated at checkout and displayed prior to payment.
                </p>
              </div>
            </motion.div>

            {/* Delays */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-lg bg-green-600">
                  <AlertCircle className="w-6 h-6 text-white-50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-black-900">Delays</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  While we ensure timely delivery, delays due to unforeseen events may occur. We notify customers if a delay is expected.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-beige-300 to-beige-400">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
              <h2 className="text-3xl font-heading font-bold text-black-900 mb-4">
                Questions About Shipping?
              </h2>
              <p className="text-lg text-black-700 mb-6">
                Our customer support team is here to help you with any shipping-related questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Contact Support
                </motion.button>
                <Link to="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-black-800 text-black-800 hover:bg-black-800 hover:text-white-50 font-heading font-semibold rounded-full transition-all duration-300"
                  >
                    View Contact Page
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Shipping; 