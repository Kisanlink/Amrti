import React from 'react';
import { useCartCount } from '../../hooks/queries/useCart';
import { useAppSelector } from '../../store';
import { ShoppingCart } from 'lucide-react';

interface CartCountProps {
  className?: string;
  showIcon?: boolean;
}

const CartCount: React.FC<CartCountProps> = ({ className = '', showIcon = true }) => {
  // Use Redux DIRECTLY - no hooks needed, Redux updates trigger re-render automatically
  const count = useAppSelector((state) => state.counter.cartCount);
  
  // Sync from cache on mount only (background sync)
  useCartCount();

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
