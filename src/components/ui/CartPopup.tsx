import { X, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCart, useUpdateCartItem, useRemoveFromCart, useIncrementCartItem, useDecrementCartItem, useAddToCart } from '../../hooks/queries/useCart';
import { useAllProducts } from '../../hooks/queries/useProducts';
import type { Cart } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useMemo, useRef, useEffect } from 'react';
import { queryKeys } from '../../lib/queryClient';

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartPopup = ({ isOpen, onClose }: CartPopupProps) => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // TanStack Query hooks
  const { data: cart, isLoading, error, isFetching } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const incrementCartItem = useIncrementCartItem();
  const decrementCartItem = useDecrementCartItem();
  const addToCartMutation = useAddToCart();
  
  // Keep track of last known cart state to prevent empty flash during refetches
  const lastCartRef = useRef<typeof cart>(null);
  
  // Update ref whenever we have valid cart data
  useEffect(() => {
    if (cart && (cart.total_items > 0 || (cart as any)?.items_count > 0 || (cart.items && cart.items.length > 0))) {
      lastCartRef.current = cart;
    }
  }, [cart]);
  
  // Get cached cart data as fallback (more reliable than ref during refetches)
  const getCachedCart = () => {
    return queryClient.getQueryData<typeof cart>(queryKeys.cart.all);
  };
  
  // Fetch products for suggestions
  const { data: productsResponse } = useAllProducts();
  
  // Get suggested products (exclude products already in cart)
  const suggestedProducts = useMemo(() => {
    const currentCart = cart || lastCartRef.current;
    if (!productsResponse?.data || !currentCart?.items) return [];
    
    const cartProductIds = currentCart.items.map((item: any) => item.product_id);
    const allProducts = productsResponse.data || [];
    
    // Filter out products already in cart and take first 6
    return allProducts
      .filter((product: any) => !cartProductIds.includes(product.id))
      .slice(0, 6);
  }, [productsResponse?.data, cart?.items]);
  
  // Handle add to cart from suggested products
  const handleSuggestedProductAddToCart = async (productId: string) => {
    try {
      await addToCartMutation.mutateAsync({ productId, quantity: 1 });
      showNotification({
        type: 'success',
        message: 'Product added to cart!'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to add product to cart'
      });
    }
  };

  // Handle quantity update
  const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    try {
      await updateCartItem.mutateAsync({ productId, quantity: newQuantity });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart.mutateAsync(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  // Handle increment
  const handleIncrement = async (productId: string) => {
    try {
      await incrementCartItem.mutateAsync(productId);
    } catch (error) {
      console.error('Failed to increment item:', error);
    }
  };

  // Handle decrement
  const handleDecrement = async (productId: string) => {
    try {
      await decrementCartItem.mutateAsync(productId);
    } catch (error) {
      console.error('Failed to decrement item:', error);
    }
  };


  // Handle checkout navigation
  const handleCheckout = () => {
    const checkoutCart = cart || lastCartRef.current;
    const totalItems = checkoutCart?.total_items || (checkoutCart as any)?.items_count || 0;
    const cartItems = checkoutCart?.items || [];
    
    if (!checkoutCart || totalItems === 0 || cartItems.length === 0) {
      showNotification({
        type: 'error',
        message: 'Your cart is empty'
      });
      return;
    }
    
    // Close the cart popup
    onClose();
    
    // Navigate to checkout page
    navigate('/checkout');
  };

  if (!isOpen) return null;

  // Loading state
  if (isLoading) {
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2">Loading cart...</span>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Error state
  if (error) {
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load cart</p>
            <button
            onClick={onClose}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Empty cart state - handle both Cart and GuestCart types
  // Don't show empty state if any cart mutation is pending or cart is fetching (prevents flicker when adding items)
  const isAnyMutationPending = 
    addToCartMutation.isPending || 
    updateCartItem.isPending || 
    removeFromCart.isPending || 
    incrementCartItem.isPending || 
    decrementCartItem.isPending;
  
  // Use current cart, cached cart, or last known cart during refetches (prevents empty flash)
  const cachedCart = getCachedCart();
  const displayCart = cart || cachedCart || lastCartRef.current;
  const totalItems = displayCart?.total_items || (displayCart as any)?.items_count || 0;
  const cartItems = displayCart?.items || [];
  
  // Check if we should prevent showing empty cart (during mutations or refetches)
  const shouldPreventEmptyState = isAnyMutationPending || isFetching;
  
  // Show loading state if mutation is pending/fetching and cart appears empty (prevents empty cart flash)
  // But only if we don't have a previous cart state to show
  if ((!displayCart || totalItems === 0 || cartItems.length === 0) && shouldPreventEmptyState && !cachedCart && !lastCartRef.current) {
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2">Updating cart...</span>
          </div>
        </div>
      </div>,
      document.body
    );
  }
  
  // Only show empty cart if cart is actually empty AND no mutations/fetches are pending AND we never had items
  if ((!displayCart || totalItems === 0 || cartItems.length === 0) && !shouldPreventEmptyState && !cachedCart && !lastCartRef.current) {
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-gray-400" />
               </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some items to get started!</p>
               <button
                 onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
               >
              Continue Shopping
               </button>
             </div>
                   </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="relative w-full max-w-md bg-white shadow-lg flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
                   <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
                   </button>
                 </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {cartItems.map((item: any) => {
              // Get product image - handle both new (images array) and old (image_url) structures
              const getProductImage = () => {
                if (!item.product) return null;
                
                // Check for images array (new structure)
                if (item.product.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
                  // Get primary image or first image
                  const primaryImage = item.product.images.find((img: any) => img.is_primary) || item.product.images[0];
                  return primaryImage?.image_url || null;
                }
                
                // Fallback to image_url (old structure)
                return item.product.image_url || item.product.primary_image?.image_url || null;
              };
              
              const productImage = getProductImage();
              const productName = item.product?.name || 'Product';
              
              return (
              <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                       {/* Product Image */}
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector('.placeholder')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'placeholder w-full h-full bg-gray-300 rounded flex items-center justify-center';
                          placeholder.innerHTML = '<span class="text-xs text-gray-500">📦</span>';
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">📦</span>
                    </div>
                  )}
                       </div>
                       
                       {/* Product Details */}
                       <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate text-sm">
                    {productName}
                             </h3>
                  <p className="text-xs text-gray-600">
                    ₹{item.unit_price} each
                  </p>
                         </div>
                         
                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                               <button
                    onClick={() => handleDecrement(item.product_id)}
                    disabled={decrementCartItem.isPending}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                               </button>
                  <span className="w-8 text-center font-medium text-sm">
                    {item.quantity}
                               </span>
                               <button
                    onClick={() => handleIncrement(item.product_id)}
                    disabled={incrementCartItem.isPending}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                               </button>
                             </div>

                {/* Price */}
                           <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">
                    ₹{item.total_price}
                  </p>
            </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.product_id)}
                  disabled={removeFromCart.isPending}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                   </div>
              );
            })}
                   </div>
                   
            {/* Suggested Products Section */}
            {suggestedProducts.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">You might also like</h3>
                <div className="overflow-x-auto -mx-4 px-4">
                  <div className="flex space-x-3 min-w-max pb-2">
                    {suggestedProducts.map((product: any) => {
                      // Get product image
                      const productImage = product.image_url || 
                        product.primary_image?.image_url || 
                        (product.images && product.images.length > 0 
                          ? (product.images.find((img: any) => img.is_primary) || product.images[0])?.image_url 
                          : null) || 
                        null;
                      
                      return (
                        <div
                          key={product.id}
                          className="flex-shrink-0 w-32 bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <Link 
                            to={`/product/${product.id}`}
                            onClick={onClose}
                            className="block"
                          >
                            <div className="w-full h-24 bg-gray-100 overflow-hidden">
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <span className="text-xs text-gray-400">📦</span>
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <h4 className="text-xs font-medium text-gray-900 truncate mb-1">
                                {product.name}
                              </h4>
                              <p className="text-xs font-semibold text-green-600 mb-2">
                                ₹{product.price || product.selling_price || 0}
                              </p>
                            </div>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSuggestedProductAddToCart(product.id);
                            }}
                            disabled={addToCartMutation.isPending}
                            className="w-full px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
                 </div>

        {/* Summary */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Subtotal ({totalItems} items)</span>
              <span className="font-medium text-sm">₹{displayCart?.total_price || (displayCart as any)?.final_price || 0}</span>
                   </div>
            {(() => {
              const discountAmount = displayCart?.discount_amount ?? (displayCart as any)?.discount_amount ?? 0;
              return discountAmount > 0 ? (
                <div className="flex justify-between text-green-600 text-sm">
                  <span>Discount</span>
                  <span>-₹{discountAmount}</span>
                 </div>
              ) : null;
            })()}
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>₹{'discounted_total' in (displayCart || {}) ? (displayCart as any).discounted_total : ((displayCart as any)?.final_price || displayCart?.total_price || 0)}</span>
                   </div>
                 </div>

          <div className="space-y-2">
            <button 
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Continue Shopping
            </button>
                 </div>
               </div>
             </div>
    </div>,
     document.body
   );
 };

export default CartPopup; 