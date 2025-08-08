import { motion } from 'framer-motion';
import { Shield, Eye, Lock, FileText, ArrowRight, CheckCircle } from 'lucide-react';

const Privacy = () => {
  const privacySections = [
    {
      icon: Eye,
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include your name, email address, phone number, shipping address, and payment information.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: 'We use the information we collect to process your orders, communicate with you about your account and orders, provide customer support, send you marketing communications (with your consent), and improve our services.',
      color: 'from-beige-500 to-beige-600'
    },
    {
      icon: Shield,
      title: 'Information Sharing',
      content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with service providers who assist us in operating our website and serving you.',
      color: 'from-green-600 to-green-700'
    },
    {
      icon: FileText,
      title: 'Data Security',
      content: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.',
      color: 'from-beige-600 to-beige-700'
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
              <Shield className="w-5 h-5" />
              <span>Privacy Policy</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-heading font-bold text-black-900 mb-6">
              Privacy <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-black-700 max-w-3xl mx-auto leading-relaxed">
              Your privacy is important to us. Learn how we collect, use, and protect your personal information
            </p>
          </motion.div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-20 bg-beige-100">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold text-black-900 mb-4">
              Our <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Commitment</span>
            </h2>
            <p className="text-lg text-black-700 max-w-2xl mx-auto">
              We are committed to protecting your privacy and ensuring the security of your personal information
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {privacySections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-beige-200/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${section.color}`}>
                        <section.icon className="w-6 h-6 text-white-50" />
                      </div>
                      <h3 className="text-2xl font-heading font-bold text-black-900">{section.title}</h3>
                    </div>
                    <p className="text-lg text-black-700 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-200/30 to-transparent rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-heading font-bold text-black-900 mb-6">Your Rights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white-50" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-black-900 mb-2">Access Your Data</h4>
                    <p className="text-black-700">Request access to the personal information we hold about you</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white-50" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-black-900 mb-2">Update Information</h4>
                    <p className="text-black-700">Correct or update your personal information in your account</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white-50" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-black-900 mb-2">Delete Account</h4>
                    <p className="text-black-700">Request deletion of your account and associated data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white-50" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-black-900 mb-2">Opt-Out</h4>
                    <p className="text-black-700">Unsubscribe from marketing communications at any time</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-green-100 to-green-200">
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
                    <Shield className="w-8 h-8 text-white-50" />
                  </div>
                </div>
                <h2 className="text-4xl font-heading font-bold text-black-900 mb-6">
                  Questions About Privacy?
                </h2>
                <p className="text-xl text-black-700 mb-8 leading-relaxed">
                  If you have any questions about our privacy policy or how we handle your data, please don't hesitate to contact us
                </p>
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
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Privacy; 