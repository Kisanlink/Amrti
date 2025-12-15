import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Shield } from 'lucide-react';

const ForgotPassword = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-400 to-beige-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link 
            to="/login"
            className="inline-flex items-center space-x-2 text-black-700 hover:text-green-600 transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-heading font-semibold">Back to Login</span>
          </Link>
          
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Phone className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-heading font-bold text-black-900 mb-2">
            Phone Authentication
          </h2>
          <p className="text-lg text-black-700">
            We now use phone number authentication for enhanced security
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-beige-50/50"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-beige-200/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          
          {/* Content */}
          <div className="relative z-10 text-center">
            <div className="mb-6">
              <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-heading font-bold text-black-900 mb-2">
                No Password Required
              </h3>
              <p className="text-black-700 mb-6">
                With phone number authentication, you don't need to remember passwords. 
                Simply enter your phone number and verify with the code we send you.
              </p>
            </div>

            <div className="space-y-4 text-sm text-black-600">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-green-600" />
                <span>Enter your phone number</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Receive verification code via SMS</span>
              </div>
              <div className="flex items-center space-x-3">
                <ArrowLeft className="w-4 h-4 text-green-600" />
                <span>Enter code to sign in securely</span>
              </div>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center space-x-2 mt-8 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Phone className="w-5 h-5" />
              <span>Sign In with Phone</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-black-700">
            Don't have an account?{' '}
            <Link
              to="/login"
              className="font-heading font-semibold text-green-600 hover:text-green-700 transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword; 