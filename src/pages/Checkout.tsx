import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Truck, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import CheckoutService, { 
  type ShippingAddress, 
  type ShippingOption 
} from '../services/checkoutService';
import CartService from '../services/cartService';
import { useNotification } from '../context/NotificationContext';

import AuthService from '../services/authService';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // State
  const [step, setStep] = useState<'address' | 'shipping' | 'payment'>('address');
  const stepRef = useRef(step);
  
  // Force step update function
  const forceStepUpdate = (newStep: 'address' | 'shipping' | 'payment') => {
    setStep(newStep);
    stepRef.current = newStep;
    localStorage.setItem('checkout-step', newStep);
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string>('');
  
  // Checkout data
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  

  
  // Address form
  const [address, setAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India'
  });







  // Check if user is authenticated and reset checkout state
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    
    // Reset checkout state to start fresh
    setStep('address');
    setPaymentSuccess(false);
    setSuccessOrderId('');
    localStorage.removeItem('checkout-step');
    
    initializeCheckout();
  }, [navigate]);

  const initializeCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure we start from step 1
      if (step !== 'address') {
        setStep('address');
        stepRef.current = 'address';
      }
      
      // Prepare checkout data
      const data = await CheckoutService.prepareCheckout();
      setCheckoutData(data);
      
      // Check if cart has validation issues
      if (data.validation_issues && data.validation_issues.length > 0) {
        setError(`Cart validation issues: ${data.validation_issues.join(', ')}`);
        return;
      }
      
      // Check if cart is empty
      if (data.cart.total_items === 0) {
        setError('Your cart is empty. Please add items before checkout.');
        return;
      }
      
    } catch (err) {
      setError('Failed to initialize checkout. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate address
      if (!address.street || !address.city || !address.state || !address.postal_code) {
        setError('Please fill in all required address fields.');
        return;
      }
      
          // Estimate shipping
    const shippingData = await CheckoutService.estimateShipping(address);
    setShippingOptions(shippingData.shipping_options);
    
    if (shippingData.shipping_options.length === 0) {
      setError('No shipping options available for this address.');
      return;
    }
    
    // Auto-select first shipping option
    setSelectedShipping(shippingData.shipping_options[0]);
    setStep('shipping');
    localStorage.setItem('checkout-step', 'shipping');
      
    } catch (err) {
      setError('Failed to estimate shipping. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingSubmit = async () => {
    if (!selectedShipping) {
      setError('Please select a shipping option.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
  
      
      // Create payment order with shipping address
      const order = await CheckoutService.createOrder(address);
      setOrderData(order);
      setStep('payment');
        localStorage.setItem('checkout-step', 'payment');
      
    } catch (err) {
      setError('Failed to create order. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!orderData) {
      setError('Order data not available.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Initialize Razorpay checkout
      const paymentResponse = await CheckoutService.initializeRazorpayCheckout(orderData);
      
      // Verify payment
      const verificationData = {
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_signature: paymentResponse.razorpay_signature
      };
      
      const verification = await CheckoutService.verifyPayment(verificationData);
      
      if (verification.success) {
        // Extract order ID from the verification response
        const orderId = verification.order_id;
        
        // Set success states
        setSuccessOrderId(orderId);
        setPaymentSuccess(true);
        setError(null);
        setLoading(false);
        
        // Clear cart
        await CartService.clearCart();
        
        // Show success message
        showNotification({
          type: 'success',
          message: 'Order placed successfully! Redirecting to order details...'
        });
        
        return; // Stop execution here
      } else {
        throw new Error('Payment verification failed');
      }
      
    } catch (err) {
      setError('Payment failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress(prev => {
      const newAddress = { ...prev, [name]: value };
      return newAddress;
    });
  };

  if (loading && step === 'address') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  if (error && step === 'address') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/cart')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['address', 'shipping', 'payment'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName 
                    ? 'bg-green-600 text-white' 
                    : ['address', 'shipping', 'payment'].indexOf(step) > index
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {['address', 'shipping', 'payment'].indexOf(step) > index ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 2 && (
                  <div className={`w-16 h-0.5 ${
                    ['address', 'shipping', 'payment'].indexOf(step) > index
                      ? 'bg-green-100'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-4 space-x-16">
            {['Shipping Address', 'Shipping Options', 'Payment'].map((label, index) => (
              <span key={label} className={`text-sm font-medium ${
                step === ['address', 'shipping', 'payment'][index]
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}>
                {label}
              </span>
            ))}
          </div>
        </div>



        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">

          
          {step === 'address' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="w-6 h-6 text-green-600 mr-3" />
                Shipping Address
              </h2>
              
              <form onSubmit={handleAddressSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={address.street}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter street address"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={address.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={address.postal_code}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter postal code"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={address.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Estimating Shipping...' : 'Continue to Shipping'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 'shipping' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Truck className="w-6 h-6 text-green-600 mr-3" />
                Shipping Options
              </h2>
              
              <div className="space-y-4 mb-6">
                {shippingOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedShipping === option
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedShipping(option)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{option.carrier} - {option.service_level}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                        <p className="text-sm text-gray-500">
                          {option.delivery_days_min}-{option.delivery_days_max} business days
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">₹{option.cost}</p>
                        {selectedShipping === option && (
                          <CheckCircle className="w-5 h-5 text-green-600 ml-auto mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleShippingSubmit}
                disabled={loading || !selectedShipping}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating Order...' : 'Continue to Payment'}
              </button>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              {!paymentSuccess ? (
                <>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-600 mr-3" />
                    Payment
                  </h2>
                  
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{checkoutData?.cart.total_price || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>₹{selectedShipping?.cost || 0}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>₹{(checkoutData?.cart.total_price || 0) + (selectedShipping?.cost || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing Payment...' : 'Pay Now'}
                  </button>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Order Placed Successfully! 🎉
                  </h2>
                  
                  <p className="text-gray-600 mb-6">
                    Thank you for your purchase! Your order has been confirmed.
                  </p>
                  
                  {successOrderId && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Order ID:</span> {successOrderId}
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      window.location.href = `/orders/${successOrderId}`;
                    }}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors mb-3"
                  >
                    View Order Details
                  </button>
                  
                  <button
                    onClick={() => navigate('/')}
                    className="w-full border border-green-600 text-green-600 py-3 px-6 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
