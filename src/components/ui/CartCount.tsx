import React from 'react';
import { useCartCount } from '../../hooks/queries/useCart';
import { ShoppingCart } from 'lucide-react';

interface CartCountProps {
  className?: string;
  showIcon?: boolean;
}

const CartCount: React.FC<CartCountProps> = ({ className = '', showIcon = true }) => {
  const { data: cartCount, isLoading, error } = useCartCount();

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {showIcon && <ShoppingCart className="w-5 h-5" />}
        <span className="text-sm font-medium">...</span>
      </div>
    );
  }

  // Handle error or no data gracefully
  const count = cartCount?.item_count || 0;

  return (
    <div className={`relative flex items-center ${className}`}>
      {showIcon && <ShoppingCart className="w-5 h-5" />}
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
};

export default CartCount;
