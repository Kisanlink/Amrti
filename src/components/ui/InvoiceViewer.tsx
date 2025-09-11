import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink, FileText } from 'lucide-react';

interface InvoiceViewerProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceUrl: string;
  orderId: string;
}

const InvoiceViewer: React.FC<InvoiceViewerProps> = ({
  isOpen,
  onClose,
  invoiceUrl,
  orderId
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleDownload = () => {
    // Create a temporary link to download the PDF
    const link = document.createElement('a');
    link.href = invoiceUrl;
    link.download = `invoice-${orderId}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(invoiceUrl, '_blank');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] mx-4 my-4 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Invoice</h2>
                <p className="text-sm text-gray-500">Order #{orderId}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              
              <button
                onClick={handleOpenInNewTab}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading invoice...</p>
                </div>
              </div>
            )}

            {hasError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load invoice</h3>
                  <p className="text-gray-600 mb-4">The invoice could not be displayed in the viewer.</p>
                  <button
                    onClick={handleOpenInNewTab}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </button>
                </div>
              </div>
            ) : (
              <iframe
                src={invoiceUrl}
                className="w-full h-full border-0"
                title={`Invoice for Order ${orderId}`}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{
                  minHeight: '500px'
                }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InvoiceViewer;
