import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Shield, Users, Globe, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
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
                <FileText className="w-8 h-8 text-white-50" />
              </div>
            </div>
            <h1 className="text-5xl font-heading font-bold text-black-900 mb-6">
              Terms & <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Conditions</span>
            </h1>
            <p className="text-xl text-black-700 leading-relaxed">
              Please read these terms and conditions carefully before using our website and services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 bg-gradient-to-br from-beige-400 to-beige-500">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Acceptance of Terms */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-lg bg-green-600">
                  <Shield className="w-6 h-6 text-white-50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-black-900">Acceptance of Terms</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  By accessing and using the Amrti website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These terms and conditions apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
                </p>
              </div>
            </motion.div>

            {/* Use License */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-lg bg-green-600">
                  <Award className="w-6 h-6 text-white-50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-black-900">Use License</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  Permission is granted to temporarily download one copy of the materials (information or software) on Amrti's website for personal, non-commercial transitory viewing only.
                </p>
                <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the website</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
              </div>
            </motion.div>

            {/* Disclaimer */}
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
                <h2 className="text-2xl font-heading font-bold text-black-900">Disclaimer</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  The materials on Amrti's website are provided on an 'as is' basis. Amrti makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
                <p>
                  Further, Amrti does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
                </p>
              </div>
            </motion.div>

            {/* Limitations */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-lg bg-green-600">
                  <Users className="w-6 h-6 text-white-50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-black-900">Limitations</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  In no event shall Amrti or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Amrti's website, even if Amrti or an Amrti authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
                <p>
                  Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
                </p>
              </div>
            </motion.div>

            {/* Privacy Policy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-lg bg-green-600">
                  <Globe className="w-6 h-6 text-white-50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-black-900">Privacy Policy</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  Your privacy is important to us. It is Amrti's policy to respect your privacy regarding any information we may collect while operating our website.
                </p>
                <p>
                  We collect information that you provide directly to us, such as when you create an account, make a purchase, or contact us for support. We also automatically collect certain information when you visit our website, such as your IP address and browser type.
                </p>
                <p>
                  We use this information to provide, maintain, and improve our services, to process your transactions, and to communicate with you.
                </p>
              </div>
            </motion.div>

            {/* Governing Law */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-lg bg-green-600">
                  <FileText className="w-6 h-6 text-white-50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-black-900">Governing Law</h2>
              </div>
              <div className="space-y-4 text-black-700 leading-relaxed">
                <p>
                  These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                </p>
                <p>
                  Any disputes arising from these terms and conditions or your use of our website will be resolved through binding arbitration in accordance with the laws of India.
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
                Questions About Our Terms?
              </h2>
              <p className="text-lg text-black-700 mb-6">
                If you have any questions about these terms and conditions, please contact our legal team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Contact Legal Team
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-black-800 text-black-800 hover:bg-black-800 hover:text-white-50 font-heading font-semibold rounded-full transition-all duration-300"
                >
                  Privacy Policy
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Terms; 