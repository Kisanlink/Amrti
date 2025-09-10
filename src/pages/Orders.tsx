import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Truck, Calendar, MapPin, CreditCard, Download, Star, Eye, RefreshCw, Clock, CheckCircle } from 'lucide-react';
import { OrderService, type Order, type OrderItem } from '../services/orderService';
import { useNotification } from '../context/NotificationContext';
import ScrollToTop from '../components/ui/ScrollToTop';
import AuthService from '../services/authService';
import { productsApi } from '../services/api';

const Orders: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  // For orders listing
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'status'>('latest');
  
  // For order detail
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [productDetails, setProductDetails] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { showNotification } = useNotification();

  // Handle invoice download
  const handleInvoiceDownload = (orderItem: Order) => {
    // Direct redirect to S3 invoice file
    window.open(`https://amrti-ecommerce.s3.eu-north-1.amazonaws.com/invoices/${orderItem.id}.json`, '_blank');
  };

  // Sort orders based on selected criteria
  const sortedOrders = [...orders].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'status':
        // Sort by status: pending -> processing -> shipped -> delivered -> cancelled
        const statusOrder = { 'pending': 1, 'processing': 2, 'shipped': 3, 'delivered': 4, 'cancelled': 5 };
        return (statusOrder[a.status as keyof typeof statusOrder] || 0) - (statusOrder[b.status as keyof typeof statusOrder] || 0);
      default:
        return 0;
    }
  });

  useEffect(() => {
    // Check authentication first
    if (!AuthService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login', { state: { from: orderId ? `/orders/${orderId}` : '/orders' } });
      return;
    }
    
    if (orderId) {
      // Fetch single order details
      fetchOrderDetails();
    } else {
      // Fetch all orders
      fetchOrders();
    }
  }, [orderId, navigate, currentPage]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      console.log('=== FETCHING USER ORDERS ===');
      console.log('Page:', currentPage);
      
      const response = await OrderService.getUserOrders();
      console.log('=== ORDERS RESPONSE RECEIVED ===');
      console.log('Orders:', response);
      
      setOrders(response);
      // Note: The API response structure might need adjustment based on actual API
      // setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      console.error('=== ERROR FETCHING ORDERS ===');
      console.error('Error:', err);
      
      setOrdersError(`Failed to load orders: ${err?.message || 'Unknown error'}`);
      showNotification({
        type: 'error',
        message: 'Failed to load orders'
      });
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('=== FETCHING ORDER DETAILS ===');
      console.log('Order ID:', orderId);
      
      const response = await OrderService.getOrderById(orderId);
      console.log('=== ORDER RESPONSE RECEIVED ===');
      console.log('Full response:', response);
      
      if (response && response.order) {
        setOrder(response.order);
        setOrderItems(response.items || []);
        console.log('Order and items set successfully');
      } else {
        console.error('Invalid response format:', response);
        setError('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('=== ERROR FETCHING ORDER DETAILS ===');
      console.error('Error:', err);
      
      setError(`Failed to load order details: ${err?.message || 'Unknown error'}`);
      showNotification({
        type: 'error',
        message: 'Failed to load order details'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (order?.invoice_url) {
      window.open(order.invoice_url, '_blank');
    }
  };


  const handleRefreshOrders = () => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      fetchOrders();
    }
  };

  // Fetch product details for order items
  const fetchProductDetails = async (productId: string) => {
    try {
      const product = await productsApi.getProductById(productId);
      setProductDetails(prev => ({
        ...prev,
        [productId]: product.data
      }));
    } catch (error) {
      console.error(`Failed to fetch product ${productId}:`, error);
      // Set a fallback for failed product fetches
      setProductDetails(prev => ({
        ...prev,
        [productId]: { 
          name: `Product ${productId}`,
          image_url: null,
          error: true 
        }
      }));
    }
  };

  // Fetch all product details when order items change
  useEffect(() => {
    if (orderItems.length > 0) {
      orderItems.forEach(item => {
        if (item.product_id && !productDetails[item.product_id]) {
          fetchProductDetails(item.product_id);
        }
      });
    }
  }, [orderItems]);

  // Show loading state for orders listing
  if (!orderId && ordersLoading) {
    return (
      <div className="pt-16 sm:pt-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Show loading state for order details
  if (orderId && loading) {
    return (
      <div className="pt-16 sm:pt-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Show error state for orders listing
  if (!orderId && ordersError) {
    return (
      <div className="pt-16 sm:pt-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Failed to Load Orders</h1>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{ordersError}</p>
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={fetchOrders}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              Try Again
            </button>
            <br />
            <Link
              to="/"
              className="px-4 sm:px-6 py-2 sm:py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm sm:text-base"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for order details
  if (orderId && (error || !order)) {
    return (
      <div className="pt-16 sm:pt-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{error || 'The order you are looking for could not be found.'}</p>
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={fetchOrderDetails}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              Try Again
            </button>
            <br />
            <Link
              to="/orders"
              className="px-4 sm:px-6 py-2 sm:py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm sm:text-base"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render orders listing view
  if (!orderId) {
    return (
      <>
        <ScrollToTop />
        <div className="pt-16 sm:pt-20 bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Header */}
            <div className="mb-6 sm:mb-10">
              <Link
                to="/"
                className="inline-flex items-center text-green-600 hover:text-green-700 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Back to Home
              </Link>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">My Orders</h1>
                  <p className="text-base sm:text-lg text-gray-600">Track and manage your orders</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest' | 'status')}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    >
                      <option value="latest">Latest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="status">By Status</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleRefreshOrders}
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Orders List */}
            {orders.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {sortedOrders.map((orderItem, index) => (
                  <motion.div
                    key={orderItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="p-2 sm:p-3 lg:p-4 bg-green-50 rounded-xl border border-green-100">
                          <Package className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                            Order #{orderItem.id}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            {OrderService.formatDate(orderItem.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${OrderService.getStatusColor(orderItem.status)}`}>
                          {OrderService.formatStatus(orderItem.status)}
                        </span>
                        <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1 sm:mt-2">
                          ₹{orderItem.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                            <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-700">Payment</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 capitalize">
                          {orderItem.payment_method}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                          <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                            <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-700">Shipping</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {orderItem.shipping_carrier}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                          <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-700">Address</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {orderItem.shipping_address}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6 border-t border-gray-100 gap-3 sm:gap-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {orderItem.tracking_url && (
                          <a
                            href={orderItem.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            <Truck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Track Package
                          </a>
                        )}
                        <button
                          onClick={() => handleInvoiceDownload(orderItem)}
                          className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Invoice
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/orders/${orderItem.id}`}
                          className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="p-4 sm:p-6 bg-gray-50 rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No Orders Found</h3>
                <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">You haven't placed any orders yet. Start shopping to see your orders here.</p>
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Render order detail view
  return (
    <>
      <ScrollToTop />
      <div className="pt-16 sm:pt-20 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link
              to="/orders"
              className="inline-flex items-center text-green-600 hover:text-green-700 mb-3 sm:mb-4 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Order #{order?.id}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Order Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Order Status Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Order Status</h2>
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${OrderService.getStatusColor(order.status)}`}>
                    {OrderService.formatStatus(order.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Order Date</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{OrderService.formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium text-gray-900 capitalize text-sm sm:text-base">{order.payment_method}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Payment Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {OrderService.formatStatus(order.payment_status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Shipping Carrier</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{order.shipping_carrier}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
              >
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" />
                  Shipping Address
                </h2>
                <p className="text-gray-700 text-sm sm:text-base">{order.shipping_address}</p>
              </motion.div>

              {/* Order Tracking Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Truck className="w-5 h-5 text-green-600 mr-2" />
                  Order Tracking
                </h2>
                
                <div className="space-y-4">
                  {/* Shipping Details */}
                  <div className=" md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Shipping Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Carrier:</span>
                          <span className="font-medium text-gray-900">{order.shipping_carrier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mode:</span>
                          <span className="font-medium text-gray-900">{order.shipping_mode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Charge:</span>
                          <span className="font-medium text-gray-900">₹{order.shipping_charge.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Delivery Timeline</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ETA:</span>
                          <span className="font-medium text-gray-900">
                            {order.eta_min_days > 0 || order.eta_max_days > 0 
                              ? `${order.eta_min_days}-${order.eta_max_days} days`
                              : 'To be updated'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {OrderService.formatStatus(order.status)}
                          </span>
                        </div>
                      </div>
                    </div> */}
                  </div>

                  {/* Tracking Information */}
                  {(order.delhivery_waybill || order.delhivery_status || order.tracking_url) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Live Tracking
                      </h3>
                      
                      <div className="space-y-3">
                        {order.delhivery_waybill && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-700">Waybill Number:</span>
                            <span className="font-mono font-medium text-blue-900">{order.delhivery_waybill}</span>
                          </div>
                        )}
                        
                        {order.delhivery_status && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-700">Delivery Status:</span>
                            <span className="font-medium text-blue-900">{order.delhivery_status}</span>
                          </div>
                        )}
                        
                        {order.tracking_url && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-700">Tracking Link:</span>
                            <a
                              href={order.tracking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Truck className="w-3 h-3 mr-1" />
                              Track Package
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* No Tracking Info Message */}
                  {!order.delhivery_waybill && !order.delhivery_status && !order.tracking_url && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <Package className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-yellow-800 text-sm">
                        Tracking information will be available once your order is shipped
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
                  {Object.keys(productDetails).length > 0 && (
                    <div className="text-sm text-gray-500">
                      {Object.keys(productDetails).filter(id => !productDetails[id]?.error).length} of {orderItems.length} products loaded
                    </div>
                  )}
                </div>
                
                {orderItems && orderItems.length > 0 ? (
                  <div className="space-y-4">
                    {orderItems.map((item, index) => {
                      const product = productDetails[item.product_id];
                      const isLoading = !product;
                      const hasError = product?.error;
                      
                      return (
                        <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {isLoading ? (
                              <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                            ) : product?.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name || 'Product'} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : (
                              <Package className="w-8 h-8 text-gray-400" />
                                )}
                            {product?.image_url && (
                              <Package className="w-8 h-8 text-gray-400 hidden" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {isLoading ? (
                                <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                              ) : hasError ? (
                                <div className="flex items-center space-x-2">
                                  <span>Product {item.product_id}</span>
                                  <button
                                    onClick={() => fetchProductDetails(item.product_id)}
                                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                                  >
                                    Retry
                                  </button>
                                </div>
                              ) : (
                                product?.name || `Product ${item.product_id}`
                              )}
                            </h3>
                            
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            
                            {!isLoading && !hasError && product?.category && (
                              <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                            )}
                            
                            {!isLoading && !hasError && product?.rating && (
                              <div className="flex items-center mt-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
                                {product.review_count && (
                                  <span className="text-xs text-gray-500 ml-2">({product.review_count} reviews)</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-green-600">₹{item.total_price.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">₹{item.unit_price.toFixed(2)} each</p>
                            
                            {!isLoading && !hasError && product?.discount_percent && product.discount_percent > 0 && (
                              <div className="mt-1">
                                <span className="text-xs text-gray-500 line-through">₹{product.actual_price}</span>
                                <span className="text-xs text-green-600 ml-2">-{product.discount_percent}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                    <span className="text-gray-600">Razorpay Receipt:</span>
                    <p className="font-medium text-gray-900">{order.razorpay_receipt}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Payment Amount:</span>
                    <p className="font-medium text-gray-900">₹{(order.razorpay_amount_paisa / 100).toFixed(2)}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Order Notes:</span>
                    <p className="font-medium text-gray-900 text-xs break-words">{order.notes}</p>
                  </div>
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
