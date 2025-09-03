import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import AuthService from '../services/authService';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await AuthService.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
      console.error('Forgot password failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  if (submitted) {
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
              <Mail className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-heading font-bold text-black-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-lg text-black-700">
              We've sent a password reset link to your email address.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 rounded-2xl shadow-xl p-8 text-center"
          >
            <p className="text-black-700 mb-6">
              Please check your email and click the link to reset your password.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>Back to Login</span>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

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
            <Shield className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-heading font-bold text-black-900 mb-2">
            Forgot Password
          </h2>
          <p className="text-lg text-black-700">
            Enter your email to reset your password
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 rounded-2xl shadow-xl p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-heading font-semibold text-black-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-black-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-black-300 rounded-lg bg-white text-black-900 placeholder-black-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-black-700">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-heading font-semibold text-green-600 hover:text-green-700 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword; 