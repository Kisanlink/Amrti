import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Package, Truck, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: 'Product Information',
      icon: Package,
      items: [
        {
          question: 'What makes Amrti products different from others?',
          answer: 'Amrti products are sourced directly from farmers using sustainable practices. Our solar drying technology preserves maximum nutrients while supporting local farming communities. All products are organic, non-GMO, and undergo rigorous quality testing.'
        },
        {
          question: 'Are your products organic and certified?',
          answer: 'Yes, all Amrti products are certified organic and non-GMO. We work with certified organic farms and our processing facilities maintain organic certification standards.'
        },
        {
          question: 'How should I store Amrti products?',
          answer: 'Store all products in a cool, dry place away from direct sunlight. For best results, keep in an airtight container. Most products have a shelf life of 12-18 months when stored properly.'
        },
        {
          question: 'Do you offer bulk quantities?',
          answer: 'Yes, we offer bulk quantities for businesses and individuals. Contact our sales team for bulk pricing and custom packaging options.'
        }
      ]
    },
    {
      title: 'Shipping & Delivery',
      icon: Truck,
      items: [
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping takes 3-5 business days within India. Express shipping (1-2 days) is available for select locations. International shipping takes 7-14 business days depending on the destination.'
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to most countries. International shipping rates and delivery times vary by location. Contact us for specific country availability and pricing.'
        },
        {
          question: 'Is shipping free?',
          answer: 'Free shipping is available on orders above ₹999 within India. International orders have shipping charges based on weight and destination.'
        },
        {
          question: 'How can I track my order?',
          answer: 'You\'ll receive a tracking number via email once your order ships. You can also track your order through your account dashboard on our website.'
        }
      ]
    },
    {
      title: 'Returns & Refunds',
      icon: Shield,
      items: [
        {
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy for unused products in original packaging. Returns must be initiated within 30 days of delivery. Contact our customer service team to start a return.'
        },
        {
          question: 'How long do refunds take?',
          answer: 'Refunds are processed within 5-7 business days after we receive your return. The refund will appear in your original payment method within 3-5 additional business days.'
        },
        {
          question: 'Do you cover return shipping?',
          answer: 'Yes, we provide prepaid return labels for domestic orders within our return window. International returns may have shipping costs depending on the reason for return.'
        },
        {
          question: 'What if I receive a damaged product?',
          answer: 'If you receive a damaged product, please contact us within 48 hours with photos. We\'ll arrange a replacement or refund immediately.'
        }
      ]
    },
    {
      title: 'Customer Support',
      icon: Clock,
      items: [
        {
          question: 'How can I contact customer support?',
          answer: 'You can reach us via email at support@amrti.com, phone at +91-XXXXXXXXXX, or through our contact form. Our support team is available Monday to Friday, 9 AM to 6 PM IST.'
        },
        {
          question: 'Do you offer product recommendations?',
          answer: 'Yes, our wellness experts can provide personalized product recommendations based on your health goals and preferences. Contact us for a consultation.'
        },
        {
          question: 'Can I cancel my order?',
          answer: 'Orders can be cancelled within 2 hours of placement if they haven\'t been processed for shipping. Contact us immediately if you need to cancel an order.'
        },
        {
          question: 'Do you have a loyalty program?',
          answer: 'Yes, we have a rewards program where you earn points on every purchase. Points can be redeemed for discounts on future orders.'
        }
      ]
    }
  ];

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
                <HelpCircle className="w-8 h-8 text-white-50" />
              </div>
            </div>
            <h1 className="text-5xl font-heading font-bold text-black-900 mb-6">
              Frequently Asked <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Questions</span>
            </h1>
            <p className="text-xl text-black-700 leading-relaxed">
              Find answers to common questions about our products, shipping, returns, and more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-gradient-to-br from-beige-400 to-beige-500">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
                className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
              >
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 rounded-lg bg-green-600">
                    <category.icon className="w-6 h-6 text-white-50" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-black-900">{category.title}</h2>
                </div>
                
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => {
                    const isOpen = openItems.includes(categoryIndex * 100 + itemIndex);
                    return (
                      <motion.div
                        key={itemIndex}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: itemIndex * 0.1 }}
                        className="border border-beige-400/50 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(categoryIndex * 100 + itemIndex)}
                          className="w-full px-6 py-4 text-left bg-beige-200/50 hover:bg-beige-200/70 transition-colors duration-300 flex items-center justify-between"
                        >
                          <span className="font-heading font-semibold text-black-900">
                            {item.question}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-green-600" />
                          )}
                        </button>
                        
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-6 py-4 bg-beige-100/50"
                          >
                            <p className="text-black-700 leading-relaxed">
                              {item.answer}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
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
                Still Have Questions?
              </h2>
              <p className="text-lg text-black-700 mb-6">
                Can't find what you're looking for? Our customer support team is here to help.
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
                  Live Chat
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQ; 