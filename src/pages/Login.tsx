import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, Lock, ArrowLeft, Shield, Truck, RotateCcw, Award, CheckCircle } from 'lucide-react';
import AuthService from '../services/authService';
import { initializeRecaptcha, getRecaptchaToken, clearRecaptcha } from '../config/firebase';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [sessionInfo, setSessionInfo] = useState<string>('');
  const [formData, setFormData] = useState({
    phoneNumber: '',
    verificationCode: ''
  });

  // Get redirect URL from location state or default to home
  const from = (location.state as any)?.from || '/';

  // Cleanup reCAPTCHA on component unmount (like HTML)
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    // Validate phone number format (exact same as HTML)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Please enter a valid phone number with country code (e.g., +1234567890)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Initializing reCAPTCHA...');
      
      // Initialize reCAPTCHA first (exact same as HTML)
      await initializeRecaptcha();
      
      // Wait a moment for reCAPTCHA to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Getting reCAPTCHA token...');
      
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken();
      
      console.log('Sending verification code...');
      
      // Call backend API instead of AuthService (exact same as HTML)
      console.log('Sending request to:', 'http://localhost:8082/api/v1/auth/phone/send-code');
      console.log('Request payload:', {
        phone_number: formData.phoneNumber,
        recaptcha_token: recaptchaToken
      });
      
      const response = await fetch('http://localhost:8082/api/v1/auth/phone/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phoneNumber,
          recaptcha_token: recaptchaToken
        })
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is ok and has content
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
          // If not JSON, use the text as is
          errorMessage = errorText || errorMessage;
        }
        
        setError(`Failed to send verification code: ${errorMessage}`);
        return;
      }
      
      // Try to parse JSON response
      let result;
      try {
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (!responseText) {
          setError('Empty response from server');
          return;
        }
        result = JSON.parse(responseText);
        console.log('Parsed result:', result);
      } catch (e) {
        setError('Invalid response format from server');
        console.error('JSON parse error:', e);
        return;
      }
      
      // Handle the response based on the backend's API format
      if (result.success && result.data) {
        setError(null);
        setSessionInfo(result.data.session_info);
        setStep('verify');
        console.log('Verification code sent! Check your phone for SMS.');
      } else {
        setError(`Failed to send verification code: ${result.message || 'Unknown error'}`);
      }
      
    } catch (error: any) {
      console.error('Phone auth error:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('reCAPTCHA')) {
        setError('reCAPTCHA verification failed. Please try again.');
        clearRecaptcha(); // Reset verifier
      } else {
        setError(`Failed to send verification code: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    // Validate OTP format (6 digits) - exact same as HTML
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(formData.verificationCode)) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Verifying code...');
      
      // Call backend API to verify the code (exact same as HTML)
      const response = await fetch('http://localhost:8082/api/v1/auth/phone/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phoneNumber,
          code: formData.verificationCode,
          session_info: sessionInfo
        })
      });
      
      // Check if response is ok and has content
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        // Handle specific error cases
        if (errorMessage.includes('session expired') || errorMessage.includes('SESSION_EXPIRED')) {
          setError('❌ Verification session expired. Please request a new code.');
          clearRecaptcha();
        } else {
          setError(`Verification failed: ${errorMessage}`);
        }
        return;
      }
      
      // Try to parse JSON response
      let result;
      try {
        const responseText = await response.text();
        if (!responseText) {
          setError('Empty response from server');
          return;
        }
        result = JSON.parse(responseText);
      } catch (e) {
        setError('Invalid response format from server');
        console.error('JSON parse error:', e);
        return;
      }
      
      // Handle the response based on the backend's API format
      if (result.success && result.data) {
        setError(null);
        console.log('Phone authentication successful! Welcome!');
        
        // Store the authentication tokens (exact same as HTML)
        if (result.data.id_token) {
          localStorage.setItem('firebase_id_token', result.data.id_token);
        }
        if (result.data.refresh_token) {
          localStorage.setItem('firebase_refresh_token', result.data.refresh_token);
        }
        
        // Create a mock user object for display (exact same as HTML)
        const mockUser = {
          uid: result.data.local_id || 'phone_user',
          phoneNumber: result.data.phone_number || formData.phoneNumber,
          email: null,
          displayName: null,
          emailVerified: false
        };
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('authToken', result.data.id_token);
        
        // Clear the verification code input
        setFormData(prev => ({ ...prev, verificationCode: '' }));
        
        // Navigate to the intended page
        navigate(from);
      } else {
        setError(`Verification failed: ${result.message || 'Unknown error'}`);
      }
      
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError(`Verification failed: ${error.message}`);
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

  // Resend Verification Code (exact same as HTML)
  const handleResendVerificationCode = async () => {
    const phoneNumber = formData.phoneNumber;
    
    if (!phoneNumber) {
      setError('Please enter a phone number first');
      return;
    }
    
    // Clear existing session data
    clearRecaptcha();

    setLoading(true);
    setError(null);

    try {
      console.log('Resending verification code...');
      
      // Reset reCAPTCHA verifier
      clearRecaptcha();
      
      // Initialize new reCAPTCHA
      await initializeRecaptcha();
      
      // Wait for reCAPTCHA to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get new reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken();
      
      // Call backend API to resend verification code (exact same as HTML)
      console.log('Sending request to:', 'http://localhost:8082/api/v1/auth/phone/send-code');
      console.log('Request payload:', {
        phone_number: phoneNumber,
        recaptcha_token: recaptchaToken
      });
      
      const response = await fetch('http://localhost:8082/api/v1/auth/phone/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          recaptcha_token: recaptchaToken
        })
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is ok and has content
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
          // If not JSON, use the text as is
          errorMessage = errorText || errorMessage;
        }
        
        setError(`Failed to resend verification code: ${errorMessage}`);
        return;
      }
      
      // Try to parse JSON response
      let result;
      try {
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (!responseText) {
          setError('Empty response from server');
          return;
        }
        result = JSON.parse(responseText);
        console.log('Parsed result:', result);
      } catch (e) {
        setError('Invalid response format from server');
        console.error('JSON parse error:', e);
        return;
      }
      
      // Handle the response based on the backend's API format
      if (result.success && result.data) {
        setError(null);
        setSessionInfo(result.data.session_info);
        console.log('New verification code sent! Check your phone.');
      } else {
        setError(`Failed to resend verification code: ${result.message || 'Unknown error'}`);
      }
      
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setError(`Failed to resend verification code: ${error.message}`);
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
            className="inline-flex items-center space-x-2 text-black-700 hover:text-green-600 transition-colors duration-300 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-heading font-semibold">Back to Home</span>
          </Link>
          
          <div className="mb-6">
            <img 
              src="/navbar_logo.svg" 
              alt="Amrti Nature's Elixir" 
              className="h-20 w-auto mx-auto object-contain"
              style={{
                imageRendering: 'high-quality' as any,
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
              }}
            />
          </div>
          
          <h2 className="text-3xl font-heading font-bold text-black-900 mb-3">
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
          className="bg-white/95 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-beige-50/50"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-beige-200/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                {/* Phone Number Field */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-heading font-semibold text-black-900 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-black-400" />
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-black-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your phone number with country code
                  </p>
                </div>

                {/* reCAPTCHA Container (exact same as HTML) */}
                <div id="recaptcha-container" className="flex justify-center my-4"></div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !formData.phoneNumber}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending code...</span>
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5" />
                      <span>Send Verification Code</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifySubmit} className="space-y-6">
                {/* Verification Code Field */}
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-heading font-semibold text-black-900 mb-2">
                    Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CheckCircle className="h-5 w-5 text-black-400" />
                    </div>
                    <input
                      id="verificationCode"
                      name="verificationCode"
                      type="text"
                      required
                      value={formData.verificationCode}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-black-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the 6-digit code sent to {formData.phoneNumber}
                  </p>
                </div>

                {/* Back to Phone Button */}
                <button
                  type="button"
                  onClick={() => {
                    clearRecaptcha();
                    setStep('phone');
                  }}
                  className="w-full text-green-600 hover:text-green-700 font-heading font-semibold py-2 px-4 transition-colors"
                >
                  ← Change phone number
                </button>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !formData.verificationCode}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Verify & Sign In</span>
                    </>
                  )}
                </button>

                {/* Resend Code Button (exact same as HTML) */}
                <button
                  type="button"
                  onClick={handleResendVerificationCode}
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-heading font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Resending...</span>
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4" />
                      <span>Resend Code</span>
                    </>
                  )}
                </button>
              </form>
            )}

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
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-heading font-semibold py-4 px-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transform hover:scale-[1.02] active:scale-[0.98]"
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
          </div>
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