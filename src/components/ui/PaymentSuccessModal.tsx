import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Package, Truck, Download, ExternalLink } from 'lucide-react';
import { OrderService, type Order } from '../../services/orderService';
import InvoiceViewer from './InvoiceViewer';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  orderId,
  onClose
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Invoice viewer state
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);

  console.log('PaymentSuccessModal props:', { isOpen, orderId, onClose });

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await OrderService.getOrderById(orderId);
      setOrder(response.order);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    
    // Show invoice viewer
    setShowInvoiceViewer(true);
  };

  const handleViewOrder = () => {
    // Close modal and move to complete step to show order details
    onClose();
  };

  const handleContinueShopping = () => {
    onClose(); // Close modal first
    window.location.href = '/';
  };



  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Success Animation */}
          <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-8 rounded-t-2xl text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 translate-y-10"></div>
            </div>
            
            {/* Success Icon Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 200 }}
              className="relative z-10"
            >
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold mb-2"
            >
              Payment Successful!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-green-100 text-lg"
            >
              Your order has been placed successfully
            </motion.p>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading order details...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchOrderDetails}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : order ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-6"
              >
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 text-green-600 mr-2" />
                    Order Summary
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Order ID</p>
                      <p className="font-medium text-gray-900">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Amount</p>
                      <p className="font-semibold text-green-600 text-lg">
                        ₹{(order.total_amount / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${OrderService.getStatusColor(order.status)}`}>
                        {OrderService.formatStatus(order.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment Method</p>
                      <p className="font-medium text-gray-900 capitalize">{order.payment_method}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Truck className="w-5 h-5 text-green-600 mr-2" />
                    Shipping Details
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">{order.shipping_address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">Carrier</p>
                        <p className="font-medium text-gray-900">{order.shipping_carrier}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Mode</p>
                        <p className="font-medium text-gray-900">{order.shipping_mode}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Shipping Charge</p>
                      <p className="font-medium text-gray-900">₹{(order.shipping_charge / 100).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadInvoice}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Invoice
                  </button>
                  
                  <button
                    onClick={handleViewOrder}
                    className="w-full border-2 border-green-600 text-green-600 py-3 px-6 rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    View Order Details
                  </button>
                  
                  <button
                    onClick={handleContinueShopping}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
      
      {/* Invoice Viewer */}
      {order && (
        <InvoiceViewer
          isOpen={showInvoiceViewer}
          onClose={() => setShowInvoiceViewer(false)}
          invoiceUrl={`https://amrti.s3.ap-south-1.amazonaws.com/invoices/${order.id}.pdf`}
          orderId={order.id}
        />
      )}
    </AnimatePresence>
  );
};

export default PaymentSuccessModal;
