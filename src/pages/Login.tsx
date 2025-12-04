import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, memo, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, Lock, ArrowLeft, Shield, Truck, RotateCcw, Award, CheckCircle, Mail, User, UserPlus } from 'lucide-react';
import AuthService from '../services/authService';
import { initializeRecaptcha, getRecaptchaToken, clearRecaptcha } from '../config/firebase';
import { buildApiUrl } from '../config/apiConfig';

// Logo and Description Component - Defined outside to prevent re-creation on every render
// Using React.memo with custom comparison to prevent unnecessary re-renders
const LogoDescriptionPanel = memo(({ isLeft }: { isLeft: boolean }) => (
  <motion.div
    initial={false}
    animate={{
      x: 0,
      opacity: 1
    }}
    transition={{ duration: 0.6, ease: "easeInOut" }}
    className={`flex flex-col items-center justify-center h-full p-4 sm:p-5 lg:p-6 ${isLeft ? 'order-1' : 'order-2'}`}
    style={{
      willChange: 'auto',
      contain: 'layout style paint'
    }}
  >
    <div className="text-center space-y-3">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          willChange: 'auto'
        }}
      >
        <img 
          src="/navbar_logo.svg" 
          alt="Amrti Nature's Elixir" 
          className="h-20 sm:h-24 lg:h-28 w-auto mx-auto object-contain mb-3"
          style={{
            imageRendering: 'high-quality' as any,
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            willChange: 'auto'
          }}
        />
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
        style={{
          willChange: 'auto'
        }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-green-800 tracking-wide leading-tight">
          NATURE'S ELIXIR
        </h1>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-heading font-semibold text-green-700 tracking-wide">
          FOR YOUR WELLNESS
        </h2>
        <div className="pt-2 flex items-center justify-center space-x-3 text-green-600">
          <span className="text-sm md:text-base font-medium">Pure</span>
          <span className="text-green-500">•</span>
          <span className="text-sm md:text-base font-medium">Natural</span>
          <span className="text-green-500">•</span>
          <span className="text-sm md:text-base font-medium">Organic</span>
        </div>
      </motion.div>
    </div>
  </motion.div>
), (prevProps, nextProps) => {
  // Only re-render if isLeft prop actually changes
  return prevProps.isLeft === nextProps.isLeft;
});

LogoDescriptionPanel.displayName = 'LogoDescriptionPanel';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'phone' | 'verify' | 'admin'>('email');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<string>('');
  const [lastPhoneNumber, setLastPhoneNumber] = useState<string>('');
  const [isSignup, setIsSignup] = useState(false);
  const [signupStep, setSignupStep] = useState<'email' | 'phone' | 'verify'>('email');
  const [signupSessionInfo, setSignupSessionInfo] = useState<string>('');
  const [formData, setFormData] = useState({
    phoneNumber: '+91',
    verificationCode: '',
    email: '',
    password: '',
    name: ''
  });

  // Session timeout warning and management (exact same as HTML)
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState<NodeJS.Timeout | null>(null);
  const [sessionTimeoutTimer, setSessionTimeoutTimer] = useState<NodeJS.Timeout | null>(null);

  // Get redirect URL from location state or default to home
  const from = (location.state as any)?.from || '/';

  // Cleanup reCAPTCHA on component unmount (like HTML)
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  // Ensure reCAPTCHA container is ready when signup form is visible
  useEffect(() => {
    if (isSignup && signupStep === 'phone') {
      // Small delay to ensure DOM is updated after animation
      const timer = setTimeout(() => {
        const container = document.getElementById('recaptcha-container-signup');
        if (!container) {
          console.warn('reCAPTCHA container for signup not found yet');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSignup, signupStep]);

  // Session timeout warning and management (exact same as HTML)
  const startSessionTimeoutWarning = () => {
    // Clear any existing timers
    if (sessionTimeoutWarning) {
      clearTimeout(sessionTimeoutWarning);
    }
    if (sessionTimeoutTimer) {
      clearInterval(sessionTimeoutTimer);
    }

    // Show warning at 3 minutes (1 minute before expiry)
    const warning = setTimeout(() => {
      setError('⚠ Verification code will expire in 1 minute. Please enter your code soon or request a new one.');
      
      // Start countdown timer
      let timeLeft = 60; // 1 minute
      const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
          setError(`⚠ Verification code expires in ${timeLeft} seconds. Please enter your code or request a new one.`);
        } else {
          clearInterval(timer);
          setError('❌ Verification code has expired. Please request a new code.');
          clearSessionData();
        }
      }, 1000);
      
      setSessionTimeoutTimer(timer);
    }, 3 * 60 * 1000); // 3 minutes
    
    setSessionTimeoutWarning(warning);
  };

  const clearSessionData = () => {
    // Clear session data
    setSessionInfo('');
    setLastPhoneNumber('');
    localStorage.removeItem('phone_auth_session');
    
    // Clear timers
    if (sessionTimeoutWarning) {
      clearTimeout(sessionTimeoutWarning);
      setSessionTimeoutWarning(null);
    }
    if (sessionTimeoutTimer) {
      clearInterval(sessionTimeoutTimer);
      setSessionTimeoutTimer(null);
    }
    
    // Hide verification section
    setStep('phone');
  };

  const validateSession = () => {
    const sessionData = localStorage.getItem('phone_auth_session');
    if (!sessionData) {
      return false;
    }

    try {
      const session = JSON.parse(sessionData);
      const now = Date.now();
      
      // Check if session is expired
      if (now > session.expires_at) {
        localStorage.removeItem('phone_auth_session');
        return false;
      }
      
      // Restore session data
      setSessionInfo(session.session_info);
      setLastPhoneNumber(session.phone_number);
      
      // Calculate remaining time and restart warning if needed
      const remainingTime = session.expires_at - now;
      if (remainingTime > 0) {
        // Show verification section if session is still valid
        setStep('verify');
        
        // Show remaining time
        const minutesLeft = Math.ceil(remainingTime / (60 * 1000));
        setError(`✅ Verification session active. ${minutesLeft} minute(s) remaining.`);
        
        // Restart warning if more than 1 minute left
        if (remainingTime > 60 * 1000) {
          const warningDelay = Math.max(0, remainingTime - (60 * 1000)); // 1 minute before expiry
          setTimeout(() => {
            startSessionTimeoutWarning();
          }, warningDelay);
        }
      }
      
      return true;
    } catch (e) {
      localStorage.removeItem('phone_auth_session');
      return false;
    }
  };

  // Validate existing session on component mount (exact same as HTML)
  useEffect(() => {
    validateSession();
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
      
      // Ensure the recaptcha container exists
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (!recaptchaContainer) {
        setError('reCAPTCHA container not found. Please refresh the page.');
        setLoading(false);
        return;
      }
      
      // Initialize reCAPTCHA first (exact same as HTML)
      try {
        await initializeRecaptcha();
        console.log('reCAPTCHA initialized successfully');
      } catch (initError: any) {
        console.error('reCAPTCHA initialization error:', initError);
        setError(initError.message || 'Failed to initialize reCAPTCHA. Please refresh the page.');
        setLoading(false);
        return;
      }
      
      // Wait a moment for reCAPTCHA to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Getting reCAPTCHA token...');
      
      // Get reCAPTCHA token
      let recaptchaToken: string;
      try {
        recaptchaToken = await getRecaptchaToken();
        console.log('reCAPTCHA token obtained successfully');
      } catch (tokenError: any) {
        console.error('reCAPTCHA token error:', tokenError);
        setError(tokenError.message || 'Failed to get reCAPTCHA token. Please try again.');
        clearRecaptcha(); // Reset verifier
        setLoading(false);
        return;
      }
      
      console.log('Sending verification code...');
      
      // Call backend API instead of AuthService (exact same as HTML)
      const phoneSendCodeUrl = buildApiUrl('/auth/phone/send-code');
      console.log('Sending request to:', phoneSendCodeUrl);
      console.log('Request payload:', {
        phone_number: formData.phoneNumber,
        recaptcha_token: recaptchaToken
      });
      
      const response = await fetch(phoneSendCodeUrl, {
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
        setLastPhoneNumber(formData.phoneNumber);
      setStep('verify');
        console.log('Verification code sent! Check your phone for SMS.');
        
        // Store session info and phone number for verification with timestamp (exact same as HTML)
        const sessionData = {
          session_info: result.data.session_info,
          phone_number: formData.phoneNumber,
          timestamp: Date.now(),
          expires_at: Date.now() + (4 * 60 * 1000) // 4 minutes (Firebase expires at 5 minutes)
        };
        
        // Persist session data to localStorage
        localStorage.setItem('phone_auth_session', JSON.stringify(sessionData));
        
        // Start session timeout warning
        startSessionTimeoutWarning();
        
        // Clear the phone number input for security
        setFormData(prev => ({ ...prev, phoneNumber: '' }));
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

    // Check if session info exists and is valid
    if (!sessionInfo) {
      // Try to restore from localStorage
      if (!validateSession()) {
        setError('Please send verification code first');
        return;
      }
    }

    if (!lastPhoneNumber) {
      setError('Phone number not found. Please start the process again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Verifying code...');
      
      // Call backend API to verify the code (exact same as HTML)
      const response = await fetch(buildApiUrl('/auth/phone/verify-code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: lastPhoneNumber,
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
          clearSessionData();
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
        
        // Clear session data and timers
        clearSessionData();
        
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
    const phoneNumber = lastPhoneNumber || formData.phoneNumber;
    
    if (!phoneNumber) {
      setError('Please enter a phone number first');
      return;
    }
    
    // Clear existing session data
    clearSessionData();

    try {
      setError('Resending verification code...');
      setLoading(true);
      
      // Ensure the recaptcha container exists
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (!recaptchaContainer) {
        setError('reCAPTCHA container not found. Please refresh the page.');
        setLoading(false);
        return;
      }
      
      // Reset reCAPTCHA verifier
      clearRecaptcha();
      
      // Initialize new reCAPTCHA
      try {
        await initializeRecaptcha();
        console.log('reCAPTCHA re-initialized successfully');
      } catch (initError: any) {
        console.error('reCAPTCHA re-initialization error:', initError);
        setError(initError.message || 'Failed to initialize reCAPTCHA. Please refresh the page.');
        setLoading(false);
        return;
      }
      
      // Wait for reCAPTCHA to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get new reCAPTCHA token
      let recaptchaToken: string;
      try {
        recaptchaToken = await getRecaptchaToken();
        console.log('reCAPTCHA token obtained successfully for resend');
      } catch (tokenError: any) {
        console.error('reCAPTCHA token error on resend:', tokenError);
        setError(tokenError.message || 'Failed to get reCAPTCHA token. Please try again.');
        clearRecaptcha(); // Reset verifier
        setLoading(false);
        return;
      }
      
      // Call backend API to resend verification code
      const response = await fetch(buildApiUrl('/auth/phone/send-code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          recaptcha_token: recaptchaToken
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
        
        setError(`Failed to resend verification code: ${errorMessage}`);
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
        setError('New verification code sent! Check your phone.');
        setSessionInfo(result.data.session_info);
        setLastPhoneNumber(phoneNumber);
        
        // Store session info and phone number for verification with timestamp
        const sessionData = {
          session_info: result.data.session_info,
          phone_number: phoneNumber,
          timestamp: Date.now(),
          expires_at: Date.now() + (4 * 60 * 1000) // 4 minutes
        };
        
        // Persist session data to localStorage
        localStorage.setItem('phone_auth_session', JSON.stringify(sessionData));
        
        // Start session timeout warning
        startSessionTimeoutWarning();
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

  // Email/Password login handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call login API (same endpoint as admin login)
      const user = await AuthService.adminLogin(formData.email, formData.password);
      
      console.log('Login successful:', user);
      
      // Check if user is Admin and redirect to admin portal
      const userRole = (user as any)?.role || localStorage.getItem('userRole');
      
      if (userRole === 'Admin') {
        // Redirect to admin portal/dashboard
        navigate('/admin/portal', { replace: true });
      } else {
        // Regular user - navigate to original destination or home
        const fromPath = from || '/';
        navigate(fromPath, { replace: true });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call admin login API
      const user = await AuthService.adminLogin(formData.email, formData.password);
      
      // Check if user is Admin and redirect to admin portal (case-insensitive check)
      const userRole = (user as any)?.role || localStorage.getItem('userRole') || '';
      
      if (userRole && userRole.toLowerCase() === 'admin') {
        // Redirect to admin portal/dashboard
        navigate('/admin/portal', { replace: true });
      } else {
        // Regular user - navigate to original destination or home
        const fromPath = from || '/';
        navigate(fromPath, { replace: true });
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Email/Password signup handler
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl('/auth/signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        setError(`Signup failed: ${errorMessage}`);
        return;
      }

      const responseText = await response.text();
      if (!responseText) {
        setError('Empty response from server');
        return;
      }
      const result = JSON.parse(responseText);
      
      if (result.success) {
        // Signup successful - automatically log in the user
        try {
          const loginUser = await AuthService.adminLogin(formData.email, formData.password);
          console.log('Auto-login after signup successful:', loginUser);
          
          // Navigate to home or original destination
          const fromPath = from || '/';
          navigate(fromPath, { replace: true });
        } catch (loginError: any) {
          // If auto-login fails, redirect to login page
          console.error('Auto-login failed:', loginError);
          setError('Account created successfully! Please login with your credentials.');
          setIsSignup(false);
          setStep('email');
        }
      } else {
        setError(`Signup failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Email signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Signup handlers
  const handleSignupPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phoneNumber) {
      setError('Please enter both name and phone number');
      return;
    }

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Please enter a valid phone number with country code (e.g., +1234567890)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Wait for container to be available (in case of animation delay)
      let recaptchaContainer = document.getElementById('recaptcha-container-signup');
      let attempts = 0;
      while (!recaptchaContainer && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        recaptchaContainer = document.getElementById('recaptcha-container-signup');
        attempts++;
      }
      
      if (!recaptchaContainer) {
        setError('reCAPTCHA container not found. Please refresh the page.');
        setLoading(false);
        return;
      }
      
      // Initialize reCAPTCHA with the signup container ID
      await initializeRecaptcha('recaptcha-container-signup');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const recaptchaToken = await getRecaptchaToken();
      
      const response = await fetch(buildApiUrl('/auth/phone/send-code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phoneNumber,
          recaptcha_token: recaptchaToken
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        setError(`Failed to send verification code: ${errorMessage}`);
        return;
      }
      
      const responseText = await response.text();
      if (!responseText) {
        setError('Empty response from server');
        return;
      }
      const result = JSON.parse(responseText);
      
      if (result.success && result.data) {
        setError(null);
        setSignupSessionInfo(result.data.session_info);
        setSignupStep('verify');
      } else {
        setError(`Failed to send verification code: ${result.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Signup phone error:', error);
      setError(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(formData.verificationCode)) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl('/auth/phone/verify-code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phoneNumber,
          code: formData.verificationCode,
          session_info: signupSessionInfo
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        setError(`Verification failed: ${errorMessage}`);
        return;
      }
      
      const responseText = await response.text();
      if (!responseText) {
        setError('Empty response from server');
        return;
      }
      const result = JSON.parse(responseText);
      
      if (result.success && result.data) {
        setError(null);
        
        if (result.data.id_token) {
          localStorage.setItem('firebase_id_token', result.data.id_token);
        }
        if (result.data.refresh_token) {
          localStorage.setItem('firebase_refresh_token', result.data.refresh_token);
        }
        
        const mockUser = {
          uid: result.data.local_id || 'phone_user',
          phoneNumber: result.data.phone_number || formData.phoneNumber,
          email: null,
          displayName: formData.name,
          emailVerified: false
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('authToken', result.data.id_token);
        
        navigate(from);
      } else {
        setError(`Verification failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Signup verification error:', error);
      setError(`Verification failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.googleSignIn();
      navigate(from);
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-400 to-beige-500 flex items-center justify-center pt-24 pb-4 px-4 sm:pt-28 sm:pb-6 sm:px-6 lg:pt-32 lg:pb-8 lg:px-8">
      <div className="w-full max-w-lg lg:max-w-5xl">
        {/* Main Container with 2 Columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Form Column - Full width on mobile, half on desktop (Login or Signup) */}
            <motion.div
              key={isSignup ? 'signup' : 'login'}
              initial={{ opacity: 0, x: isSignup ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignup ? 20 : -20 }}
              transition={{ duration: 0.5 }}
              className={`p-4 sm:p-5 lg:p-6 flex flex-col justify-center w-full ${isSignup ? 'order-2 lg:order-2' : 'order-1 lg:order-1'}`}
            >
              <div className="max-w-md mx-auto w-full space-y-4">
                {/* Back to Home Link */}
          <Link 
            to="/"
                  className="inline-flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors duration-300 mb-2"
          >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-heading text-sm">Back to Home</span>
          </Link>
          
                {/* Title */}
                <div className="mb-4">
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black-900 mb-1">
                    {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
                  <p className="text-sm text-gray-600">
                    {isSignup ? 'Join us and start your wellness journey' : 'Sign in to your account to continue'}
                  </p>
                </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

                <AnimatePresence mode="wait">
                  {!isSignup ? (
                    // LOGIN FORMS
                    <motion.div
                      key="login"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {step === 'email' ? (
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                          {/* Email Field */}
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
                                value={formData.email}
                                onChange={handleInputChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-black-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                                placeholder="user@example.com"
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
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-black-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                                placeholder="Enter your password"
                              />
                            </div>
                          </div>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={loading || !formData.email || !formData.password}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
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

                          {/* Alternative Login Options */}
                          <div className="space-y-2">
                            <div className="relative my-4">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                              </div>
                              <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                              </div>
                            </div>

                            {/* Google Sign In */}
                            <button
                              type="button"
                              onClick={handleGoogleSignIn}
                              disabled={loading}
                              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-heading font-semibold py-2 px-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
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

                            {/* Phone Login Option */}
                            <button
                              type="button"
                              onClick={() => {
                                setStep('phone');
                                setError(null);
                              }}
                              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-heading font-semibold py-2 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                              <Phone className="w-5 h-5" />
                              <span>Login with Phone Number</span>
                            </button>
                          </div>
                        </form>
                      ) : step === 'phone' ? (
                        <form onSubmit={handlePhoneSubmit} className="space-y-4">
                          {/* Back to Email Login */}
                          <button
                            type="button"
                            onClick={() => {
                              setStep('email');
                              setError(null);
                            }}
                            className="text-sm text-gray-600 hover:text-green-600 transition-colors duration-300 mb-4 flex items-center space-x-1"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Email Login</span>
                          </button>

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
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-black-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your phone number with country code
                  </p>
                </div>

                          {/* reCAPTCHA Container */}
                <div id="recaptcha-container" className="flex justify-center my-4"></div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !formData.phoneNumber}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
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
            ) : step === 'admin' ? (
              <form onSubmit={handleAdminLogin} className="space-y-6">
                {/* Back to Email Login */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLogin(false);
                    setStep('email');
                    setError(null);
                  }}
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors duration-300 mb-4 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Email Login</span>
                </button>

                {/* Email Field */}
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
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-black-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="admin@example.com"
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
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-black-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !formData.email || !formData.password}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      <span>Login as Admin</span>
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
                    Enter the 6-digit code sent to {lastPhoneNumber || formData.phoneNumber}
                  </p>
                </div>

                {/* Submit Button - Verify & Sign In (moved up) */}
                <button
                  type="submit"
                  disabled={loading || !formData.verificationCode}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
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

                {/* Resend Code Button (moved down) */}
                <button
                  type="button"
                  onClick={handleResendVerificationCode}
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-heading font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Resending...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>Resend Code</span>
                    </>
                  )}
                </button>
              </form>
                    )}
                    </motion.div>
                  ) : (
                    // SIGNUP FORMS
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {signupStep === 'email' ? (
                        <form onSubmit={handleEmailSignup} className="space-y-4">
                          <div>
                            <label htmlFor="signup-name-email" className="block text-sm font-heading font-semibold text-black-900 mb-2">
                              Full Name *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-black-400" />
                              </div>
                              <input
                                id="signup-name-email"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-black-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                                placeholder="Enter your full name"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="signup-email" className="block text-sm font-heading font-semibold text-black-900 mb-2">
                              Email Address *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-black-400" />
                              </div>
                              <input
                                id="signup-email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-black-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                                placeholder="user@example.com"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="signup-password" className="block text-sm font-heading font-semibold text-black-900 mb-2">
                              Password *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-black-400" />
                              </div>
                              <input
                                id="signup-password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-black-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                                placeholder="Enter your password (min. 8 characters)"
                                minLength={8}
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Password must be at least 8 characters long
                            </p>
                          </div>

                          <div className="flex items-start">
                            <input
                              id="terms-email"
                              name="terms"
                              type="checkbox"
                              required
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                            />
                            <label htmlFor="terms-email" className="ml-2 block text-sm text-gray-700">
                              I agree to the{' '}
                              <Link to="/terms" className="text-green-600 hover:text-green-700 font-semibold">
                                Terms of Service
                              </Link>{' '}
                              and{' '}
                              <Link to="/privacy" className="text-green-600 hover:text-green-700 font-semibold">
                                Privacy Policy
                              </Link>
                            </label>
                          </div>

                          <button
                            type="submit"
                            disabled={loading || !formData.name || !formData.email || !formData.password}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {loading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Creating account...</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-5 h-5" />
                                <span>Create Account</span>
                              </>
                            )}
                          </button>

                          {/* Alternative Signup Options */}
                          <div className="space-y-3">
                            <div className="relative my-6">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                              </div>
                              <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                              </div>
                            </div>

                            {/* Google Sign Up */}
                <button
                  type="button"
                              onClick={handleGoogleSignUp}
                  disabled={loading}
                              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-heading font-semibold py-2 px-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                >
                  {loading ? (
                    <>
                                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                  <span>Creating account...</span>
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

                            {/* Phone Signup Option */}
                            <button
                              type="button"
                              onClick={() => {
                                setSignupStep('phone');
                                setError(null);
                              }}
                              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-heading font-semibold py-2 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                              <Phone className="w-5 h-5" />
                              <span>Sign up with Phone Number</span>
                            </button>
                          </div>
              </form>
                      ) : signupStep === 'phone' ? (
                        <form onSubmit={handleSignupPhoneSubmit} className="space-y-4">
                          {/* Back to Email Signup */}
                          <button
                            type="button"
                            onClick={() => {
                              setSignupStep('email');
                              setError(null);
                            }}
                            className="text-sm text-gray-600 hover:text-green-600 transition-colors duration-300 mb-4 flex items-center space-x-1"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Email Signup</span>
                          </button>
                          <div>
                            <label htmlFor="signup-name" className="block text-sm font-heading font-semibold text-black-900 mb-2">
                              Full Name *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-black-400" />
                              </div>
                              <input
                                id="signup-name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-black-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                                placeholder="Enter your full name"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="signup-phoneNumber" className="block text-sm font-heading font-semibold text-black-900 mb-2">
                              Phone Number *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-black-400" />
                              </div>
                              <input
                                id="signup-phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                required
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-black-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                                placeholder="+91 9876543210"
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Enter your phone number with country code
                            </p>
                          </div>

                          <div id="recaptcha-container-signup" className="flex justify-center my-4"></div>

                          <div className="flex items-start">
                            <input
                              id="terms"
                              name="terms"
                              type="checkbox"
                              required
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                              I agree to the{' '}
                              <Link to="/terms" className="text-green-600 hover:text-green-700 font-semibold">
                                Terms of Service
                              </Link>{' '}
                              and{' '}
                              <Link to="/privacy" className="text-green-600 hover:text-green-700 font-semibold">
                                Privacy Policy
                              </Link>
                            </label>
                          </div>

                          <button
                            type="submit"
                            disabled={loading || !formData.name || !formData.phoneNumber}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
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
                        <form onSubmit={handleSignupVerifySubmit} className="space-y-6">
                          <div>
                            <label htmlFor="signup-verificationCode" className="block text-sm font-heading font-semibold text-black-900 mb-2">
                              Verification Code
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CheckCircle className="h-5 w-5 text-black-400" />
                              </div>
                              <input
                                id="signup-verificationCode"
                                name="verificationCode"
                                type="text"
                                required
                                value={formData.verificationCode}
                                onChange={handleInputChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-black-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Enter the 6-digit code sent to {formData.phoneNumber}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSignupStep('phone')}
                            className="w-full text-green-600 hover:text-green-700 font-heading font-semibold py-2 px-4 transition-colors"
                          >
                            ← Change phone number
                          </button>

                          <button
                            type="submit"
                            disabled={loading || !formData.verificationCode}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {loading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Verifying...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                <span>Verify & Create Account</span>
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Google Sign In/Up Button - Show only if not on email login step */}
                {(!isSignup && step !== 'email') && (
                  <div className="mt-6">
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
                      onClick={isSignup ? handleGoogleSignUp : handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-heading font-semibold py-4 px-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>{isSignup ? 'Creating account...' : 'Signing in...'}</span>
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
                )}

          </div>
        </motion.div>

            {/* Right Column - Logo and Description (Desktop Only) - Memoized to prevent re-renders */}
            {useMemo(() => (
        <motion.div
                key="logo-panel-wrapper"
                initial={false}
                animate={{
                  x: 0,
                  opacity: 1
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className={`hidden lg:flex flex-col items-center justify-center p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-green-50/80 via-beige-50/80 to-green-50/80 ${isSignup ? 'order-1 lg:order-1' : 'order-2 lg:order-2'}`}
              >
                <LogoDescriptionPanel isLeft={isSignup} />
              </motion.div>
            ), [isSignup])}
          </div>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-4 space-y-2"
        >
          {!isSignup && step !== 'admin' && (
            <button
              onClick={() => {
                setShowAdminLogin(true);
                setStep('admin');
              }}
              className="text-sm text-gray-700 hover:text-green-600 transition-colors duration-300 underline"
            >
              Login as Admin
            </button>
          )}
          <p className="text-gray-700">
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError(null);
                setStep(isSignup ? 'email' : 'email');
                setSignupStep('email');
                clearRecaptcha();
              }}
              className="font-heading font-semibold text-green-600 hover:text-green-700 transition-colors underline"
            >
              {isSignup ? 'Sign in here' : 'Sign up here'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login; 