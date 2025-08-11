import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, ArrowRight, CheckCircle } from 'lucide-react';

const Contact = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '[Insert your office/registered address here]',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+91-XXXXXXXXXX\n(Mon–Fri, 10am–6pm IST)',
      color: 'from-beige-500 to-beige-600'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: 'info@amrti.com',
      color: 'from-green-600 to-green-700'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Monday - Friday: 10:00 AM - 6:00 PM IST',
      color: 'from-beige-600 to-beige-700'
    }
  ];

  const faqs = [
    {
      question: 'How can I place an order?',
      answer: 'You can place orders through our website, mobile app, or by calling our customer service. We offer secure payment options and doorstep delivery.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all products in their original packaging. Contact our customer service for return authorization.'
    },
    {
      question: 'Do you ship nationwide?',
      answer: 'Yes, we deliver across India with reliable shipping partners. Delivery times vary by location, typically 3-7 business days.'
    },
    {
      question: 'Are your products organic certified?',
      answer: 'Yes, all our products are certified organic and meet strict quality standards. We maintain transparency in our sourcing and processing.'
    }
  ];

  return (
    <div className="pt-20 bg-beige-200 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-beige-400 via-beige-300 to-beige-500">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="relative z-10 container-custom py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white-50 rounded-full text-sm font-heading font-semibold mb-6">
              <MessageCircle className="w-5 h-5" />
              <span>Get in Touch</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-heading font-bold text-black-900 mb-6">
              Contact <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Us</span>
            </h1>
            <p className="text-xl text-black-700 max-w-3xl mx-auto leading-relaxed">
              We're here to help! Reach out to us for any questions about our products, orders, or partnerships
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-beige-100">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold text-black-900 mb-4">
              Get in <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Touch</span>
            </h2>
            <p className="text-lg text-black-700 max-w-2xl mx-auto">
              Multiple ways to reach us for support and inquiries
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-beige-200/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-6">
                      <div className={`p-4 rounded-full bg-gradient-to-br ${info.color}`}>
                        <info.icon className="w-8 h-8 text-white-50" />
                      </div>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-black-900 mb-4">{info.title}</h3>
                    <p className="text-black-700 leading-relaxed whitespace-pre-line">{info.details}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gradient-to-br from-green-100 to-green-200">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-beige-200/30 to-transparent rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                      <Send className="w-6 h-6 text-white-50" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-black-900">Send Message</h2>
                  </div>
                  
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-heading font-semibold text-black-900 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-lg border border-beige-400/50 bg-beige-200/50 text-black-900 placeholder-black-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-heading font-semibold text-black-900 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-lg border border-beige-400/50 bg-beige-200/50 text-black-900 placeholder-black-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-heading font-semibold text-black-900 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 rounded-lg border border-beige-400/50 bg-beige-200/50 text-black-900 placeholder-black-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your email address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-heading font-semibold text-black-900 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 rounded-lg border border-beige-400/50 bg-beige-200/50 text-black-900 placeholder-black-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-heading font-semibold text-black-900 mb-2">
                        Subject *
                      </label>
                      <select className="w-full px-4 py-3 rounded-lg border border-beige-400/50 bg-beige-200/50 text-black-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300">
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="order">Order Support</option>
                        <option value="product">Product Information</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-heading font-semibold text-black-900 mb-2">
                        Message *
                      </label>
                      <textarea
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border border-beige-400/50 bg-beige-200/50 text-black-900 placeholder-black-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-none"
                        placeholder="Tell us how we can help you..."
                      ></textarea>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <span>Send Message</span>
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-green-200/30 to-transparent rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-beige-500 to-beige-600">
                      <MessageCircle className="w-6 h-6 text-white-50" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-black-900">Frequently Asked</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {faqs.map((faq, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="p-6 rounded-xl bg-beige-200/50 border border-beige-300/50 hover:border-green-300/50 transition-all duration-300"
                      >
                        <h3 className="text-lg font-heading font-semibold text-black-900 mb-3">
                          {faq.question}
                        </h3>
                        <p className="text-black-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gradient-to-br from-beige-300 to-beige-400">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold text-black-900 mb-4">
              Visit Our <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Location</span>
            </h2>
            <p className="text-lg text-black-700 max-w-2xl mx-auto">
              Find us at our headquarters in Bangalore
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="aspect-video bg-gradient-to-br from-green-200 to-green-300 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-2xl font-heading font-bold text-black-900 mb-2">Interactive Map</h3>
                <p className="text-black-700">123 Wellness Street, Organic District<br />Bangalore, Karnataka 560001</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-500 to-green-600">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="relative p-12 rounded-3xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-beige-100/50 to-green-100/30 rounded-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 rounded-full bg-green-600">
                    <CheckCircle className="w-8 h-8 text-white-50" />
                  </div>
                </div>
                <h2 className="text-4xl font-heading font-bold text-black-900 mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-black-700 mb-8 leading-relaxed">
                  Our team is ready to assist you with any questions about our products, partnerships, or services
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <span className="flex items-center space-x-2">
                      <span>Contact Us</span>
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-black-800 text-black-800 hover:bg-black-800 hover:text-white-50 font-heading font-semibold rounded-full transition-all duration-300"
                  >
                    <span className="flex items-center space-x-2">
                      <span>Learn More</span>
                      <MessageCircle className="w-5 h-5" />
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact; 