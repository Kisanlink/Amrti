import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Package, Truck, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Returns = () => {
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
              Returns & <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Refunds</span>
            </h1>
            <p className="text-xl text-black-700 leading-relaxed">
              We want you to be completely satisfied with your purchase. Our hassle-free return policy ensures your peace of mind.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Return Policy Details */}
      <section className="py-16 bg-gradient-to-br from-beige-400 to-beige-500">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Return Policy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-lg bg-green-600">
                    <Package className="w-6 h-6 text-white-50" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-black-900">Return Policy</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-black-900 mb-3">30-Day Return Window</h3>
                    <p className="text-black-700 leading-relaxed">
                      You have 30 days from the date of delivery to return your purchase for a full refund or exchange.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-heading font-bold text-black-900 mb-3">Return Conditions</h3>
                    <ul className="space-y-2 text-black-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-600 mt-2.5 flex-shrink-0"></div>
                        <span>Product must be unused and in original packaging</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-600 mt-2.5 flex-shrink-0"></div>
                        <span>All seals and labels must be intact</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-600 mt-2.5 flex-shrink-0"></div>
                        <span>Original receipt or order confirmation required</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-heading font-bold text-black-900 mb-3">Non-Returnable Items</h3>
                    <ul className="space-y-2 text-black-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2.5 flex-shrink-0"></div>
                        <span>Opened or used products</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2.5 flex-shrink-0"></div>
                        <span>Damaged or tampered packaging</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2.5 flex-shrink-0"></div>
                        <span>Personalized or custom orders</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Return Process */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-lg bg-green-600">
                    <Truck className="w-6 h-6 text-white-50" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-black-900">Return Process</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    {[
                      {
                        step: '1',
                        title: 'Contact Support',
                        description: 'Email us at returns@amrti.com with your order number and reason for return'
                      },
                      {
                        step: '2',
                        title: 'Get Approval',
                        description: 'We\'ll review your request and send you a return authorization if approved'
                      },
                      {
                        step: '3',
                        title: 'Ship Back',
                        description: 'Package your item securely and ship it back using the provided label'
                      },
                      {
                        step: '4',
                        title: 'Receive Refund',
                        description: 'Once we receive and inspect your return, we\'ll process your refund within 5-7 days'
                      }
                    ].map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="flex items-start space-x-4 p-4 rounded-lg bg-beige-200/50 border border-beige-300/50"
                      >
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white-50 flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
                          {step.step}
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-black-900 mb-1">{step.title}</h4>
                          <p className="text-black-700 text-sm">{step.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Refund Information */}
      <section className="py-16 bg-gradient-to-br from-beige-300 to-beige-400">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-black-900 mb-4">
              Refund <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Information</span>
            </h2>
            <p className="text-lg text-black-700 max-w-2xl mx-auto">
              Understanding how refunds work and what to expect
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Processing Time',
                description: 'Refunds are processed within 5-7 business days after we receive your return'
              },
              {
                icon: Shield,
                title: 'Full Refund',
                description: 'You\'ll receive a full refund including original shipping costs for valid returns'
              },
              {
                icon: Truck,
                title: 'Return Shipping',
                description: 'We provide prepaid return labels for domestic orders within our return window'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-green-600">
                    <item.icon className="w-6 h-6 text-white-50" />
                  </div>
                </div>
                <h3 className="text-xl font-heading font-bold text-black-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-black-700 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-beige-400 to-beige-500">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
              <h2 className="text-3xl font-heading font-bold text-black-900 mb-4">
                Need Help with Returns?
              </h2>
              <p className="text-lg text-black-700 mb-6">
                Our customer support team is here to help you with any questions about returns or refunds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Contact Support
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-black-800 text-black-800 hover:bg-black-800 hover:text-white-50 font-heading font-semibold rounded-full transition-all duration-300"
                >
                  View FAQ
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Returns; 