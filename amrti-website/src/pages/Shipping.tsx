import { motion } from 'framer-motion';

const Shipping = () => {
  return (
    <div className="pt-20">
      <section className="section-padding bg-gradient-primary">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient">Shipping</span> Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Information about our shipping and delivery services
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-primary-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-8">Shipping Information</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                We strive to deliver your orders quickly and safely. Here's what you need to know about our shipping process.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">Delivery Time</h3>
              <p className="text-gray-600 mb-6">
                Standard delivery: 3-5 business days<br/>
                Express delivery: 1-2 business days<br/>
                Free shipping on orders above ₹999
              </p>
              
              <h3 className="text-xl font-semibold mb-4">Shipping Areas</h3>
              <p className="text-gray-600 mb-6">
                We currently ship to all major cities and towns across India. Remote areas may take additional time for delivery.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">Order Tracking</h3>
              <p className="text-gray-600 mb-6">
                You will receive tracking information via email once your order ships. You can also track your order through our website.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">Contact</h3>
              <p className="text-gray-600">
                For shipping inquiries, please contact us at contact@amrti.com
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Shipping; 