import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Clock, Shield, Mail, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CancellationRefund = () => {
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
                <RotateCcw className="w-8 h-8 text-white-50" />
              </div>
            </div>
            <h1 className="text-5xl font-heading font-bold text-black-900 mb-6">
              Cancellation & <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Refund Policy</span>
            </h1>
            <p className="text-xl text-black-700 leading-relaxed">
              We strive to deliver exceptional products/services to our customers at amrti.com. If you are not satisfied, the following applies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 bg-gradient-to-br from-beige-400 to-beige-500">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Order Cancellation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-lg bg-green-600">
                  <Clock className="w-6 h-6 text-white-50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-black-900">Order Cancellation</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  Orders can be cancelled within 24 hours of placement or before shipment. Contact our support at{' '}
                  <a href="mailto:info@amrti.com" className="text-green-600 hover:text-green-700 font-semibold">
                    info@amrti.com
                  </a>{' '}
                  with your order number to request cancellation.
                </p>
                <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg">
                  <p className="text-green-800 font-semibold">Important:</p>
                  <p className="text-green-700">Cancellations are only possible before your order is shipped. Once dispatched, standard return policies apply.</p>
                </div>
              </div>
            </motion.div>

            {/* Refunds */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-lg bg-green-600">
                  <Shield className="w-6 h-6 text-white-50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-black-900">Refunds</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  Once an order is cancelled/returned in line with our guidelines, a full refund will be processed to your original payment method within 7–10 business days.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-heading font-semibold text-green-800 mb-1">Full Refund</h4>
                      <p className="text-green-700 text-sm">Complete refund including shipping costs for valid returns</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-heading font-semibold text-blue-800 mb-1">Processing Time</h4>
                      <p className="text-blue-700 text-sm">7-10 business days to your original payment method</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Eligibility */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-lg bg-green-600">
                  <Shield className="w-6 h-6 text-white-50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-black-900">Eligibility</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  Refunds and cancellations are not applicable once orders have been dispatched or consumed, unless there are manufacturing defects or service issues.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-heading font-semibold text-black-900 mb-3 flex items-center">
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      Not Eligible
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                        <span>Dispatched orders</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                        <span>Consumed products</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                        <span>Personalized items</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-black-900 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      Eligible
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                        <span>Manufacturing defects</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                        <span>Service issues</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                        <span>Wrong items received</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Returns */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-lg bg-green-600">
                  <RotateCcw className="w-6 h-6 text-white-50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-black-900">Returns</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  Products must be unused and in original packaging. Return requests should be submitted within 7 days of delivery.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-r-lg">
                  <p className="text-yellow-800 font-semibold">Return Requirements:</p>
                  <ul className="text-yellow-700 mt-2 space-y-1">
                    <li>• Products must be unused and in original packaging</li>
                    <li>• All seals and labels must be intact</li>
                    <li>• Return requests within 7 days of delivery</li>
                    <li>• Original receipt or order confirmation required</li>
                  </ul>
                </div>
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
                Need Help with Cancellations or Refunds?
              </h2>
              <p className="text-lg text-black-700 mb-6">
                Our customer support team is here to help you with any questions about cancellations, returns, or refunds.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center justify-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-semibold">info@amrti.com</span>
                </div>
                <div className="flex items-center justify-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-semibold">+91-XXXXXXXXXX</span>
                </div>
                <div className="flex items-center justify-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-800 font-semibold">Mon–Fri, 10am–6pm IST</span>
                </div>
              </div>
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

export default CancellationRefund; 