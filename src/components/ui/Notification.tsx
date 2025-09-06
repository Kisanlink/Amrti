import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X, Info } from 'lucide-react';
import { useEffect } from 'react';

export interface NotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Notification = ({ type, message, isVisible, onClose, duration = 3000 }: NotificationProps) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />;
      case 'error':
        return <XCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />;
      case 'info':
        return <Info className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />;
      default:
        return <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed top-40 sm:top-44 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-1rem)] sm:w-auto sm:max-w-sm mx-2 sm:mx-0 ${getBgColor()} border rounded-lg shadow-lg backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between p-1.5 sm:p-3">
            <div className="flex items-center space-x-1.5 sm:space-x-3 flex-1 min-w-0">
              {getIcon()}
              <span className="font-medium text-[10px] sm:text-sm truncate">{message}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-1 sm:ml-2"
            >
              <X className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification; 
 