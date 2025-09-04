import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Truck, Calendar, MapPin, CreditCard, Download, Star } from 'lucide-react';
import { OrderService, type Order, type OrderItem } from '../services/orderService';
import { useNotification } from '../context/NotificationContext';
import ScrollToTop from '../components/ui/ScrollToTop';
import AuthService from '../services/authService';

const Orders: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    console.log('=== ORDERS COMPONENT MOUNTED ===');
    console.log('Order ID from params:', orderId);
    console.log('Component state - loading:', loading, 'error:', error, 'order:', !!order);
    
    // Check authentication first
    if (!AuthService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login', { state: { from: `/orders/${orderId}` } });
      return;
    }
    
    console.log('User is authenticated, proceeding with order fetch');
    
    if (orderId) {
      console.log('Starting to fetch order details for:', orderId);
      fetchOrderDetails();
    } else {
      console.log('No orderId provided');
      setError('No order ID provided');
      setLoading(false);
    }
  }, [orderId, navigate]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('=== FETCHING ORDER DETAILS ===');
      console.log('Order ID:', orderId);
      console.log('OrderService imported:', OrderService);
      console.log('OrderService.getOrderById method:', OrderService.getOrderById);
      
      // Test the API call directly
      console.log('Making API call to OrderService.getOrderById...');
      const response = await OrderService.getOrderById(orderId);
      console.log('=== ORDER RESPONSE RECEIVED ===');
      console.log('Full response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      console.log('Order data:', response?.order);
      console.log('Items data:', response?.items);
      
      if (response && response.order) {
        setOrder(response.order);
        setOrderItems(response.items || []);
        console.log('Order and items set successfully');
      } else {
        console.error('Invalid response format:', response);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('=== ERROR FETCHING ORDER DETAILS ===');
      console.error('Error type:', typeof err);
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      console.error('Full error object:', err);
      
      setError(`Failed to load order details: ${err?.message || 'Unknown error'}`);
      showNotification({
        type: 'error',
        message: 'Failed to load order details'
      });
    } finally {
      setLoading(false);
      console.log('Loading finished');
    }
  };

  const handleDownloadInvoice = () => {
    if (order?.invoice_url) {
      window.open(order.invoice_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="pt-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
          
          {/* Debug: Test API call manually */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">Debug: Test API call manually</p>
            <button
              onClick={() => {
                console.log('Manual API test button clicked');
                fetchOrderDetails();
              }}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Test API Call
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="pt-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The order you are looking for could not be found.'}</p>
          <div className="space-y-3">
            <button
              onClick={fetchOrderDetails}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
            <br />
            <Link
              to="/"
              className="px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <div className="pt-16 sm:pt-20 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 mt-2">Order #{order.id}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Order Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${OrderService.getStatusColor(order.status)}`}>
                    {OrderService.formatStatus(order.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium text-gray-900">{OrderService.formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium text-gray-900 capitalize">{order.payment_method}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {OrderService.formatStatus(order.payment_status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Shipping Carrier</p>
                      <p className="font-medium text-gray-900">{order.shipping_carrier}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 text-green-600 mr-2" />
                  Shipping Address
                </h2>
                <p className="text-gray-700">{order.shipping_address}</p>
              </motion.div>

              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
                
                {orderItems && orderItems.length > 0 ? (
                  <div className="space-y-4">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">Product ID: {item.product_id}</h3>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                                                 <div className="text-right">
                           <p className="font-semibold text-green-600">₹{item.total_price.toFixed(2)}</p>
                           <p className="text-sm text-gray-600">₹{item.unit_price.toFixed(2)} each</p>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No items found for this order</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID</span>
                    <span className="font-medium text-gray-900">{order.id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">₹{(order.total_amount - order.shipping_charge).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-900">₹{order.shipping_charge.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-green-600 text-lg">₹{order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadInvoice}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Invoice
                  </button>
                  
                  <Link
                    to="/"
                    className="w-full border border-green-600 text-green-600 py-3 px-4 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </motion.div>

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Info</h2>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Razorpay Order ID:</span>
                    <p className="font-medium text-gray-900">{order.razorpay_order_id}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Shipping Mode:</span>
                    <p className="font-medium text-gray-900">{order.shipping_mode}</p>
                  </div>
                  
                  {order.tracking_url && (
                    <div>
                      <span className="text-gray-600">Tracking:</span>
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Track Package
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Orders;
