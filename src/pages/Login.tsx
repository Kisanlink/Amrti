import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, ArrowLeft, Shield, Truck, RotateCcw, Award } from 'lucide-react';
import AuthService from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Get redirect URL from location state or default to home
  const from = (location.state as any)?.from || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await AuthService.login({ email: formData.email, password: formData.password });
      navigate(from); // Redirect to the page they were trying to access
    } catch (err: any) {
      setError(err.message || 'Login failed');
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await AuthService.googleSignIn();
      navigate(from); // Redirect to the page they were trying to access
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      console.error('Google sign-in failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-400 to-beige-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link 
            to="/"
            className="inline-flex items-center space-x-2 text-black-700 hover:text-green-600 transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-heading font-semibold">Back to Home</span>
          </Link>
          
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <img 
                              src="/logo2.png" 
                              alt="Amrti Nature's Elixir" 
              className="w-10 h-10 object-contain"
            />
          </div>
          
          <h2 className="text-3xl font-heading font-bold text-black-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-lg text-black-700">
            Sign in to your account to continue
          </p>
        </motion.div>

        {/* Login Form */}
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
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-heading font-semibold text-black-900 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-black-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-black-300 rounded-lg bg-white text-black-900 placeholder-black-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-heading font-semibold text-black-900 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-black-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-black-300 rounded-lg bg-white text-black-900 placeholder-black-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-black-400 hover:text-black-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-black-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-black-700">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-beige-300 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-heading font-semibold py-3 px-4 rounded-lg border border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>


        </motion.div>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-black-700">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-heading font-semibold text-green-600 hover:text-green-700 transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 gap-4 mt-8"
        >
          <div className="flex items-center space-x-3 text-sm text-black-600">
            <Shield className="w-4 h-4 text-green-600" />
            <span>Secure login</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-black-600">
            <Truck className="w-4 h-4 text-green-600" />
            <span>Free shipping</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-black-600">
            <RotateCcw className="w-4 h-4 text-green-600" />
            <span>Easy returns</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-black-600">
            <Award className="w-4 h-4 text-green-600" />
            <span>Quality assured</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login; 