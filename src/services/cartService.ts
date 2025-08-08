export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  category: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
}

// Static product data
const products = {
  'moringa-powder': {
    id: 'moringa-powder',
    name: 'Moringa Powder',
    price: 299,
    originalPrice: 399,
    image: '/products/pouch front mockup.jpg',
    category: 'Natural Powders'
  },
  'amla-powder': {
    id: 'amla-powder',
    name: 'Amla Powder',
    price: 349,
    originalPrice: 449,
    image: '/products/amla bg.png',
    category: 'Natural Powders'
  },
  'ashwagandha-powder': {
    id: 'ashwagandha-powder',
    name: 'Ashwagandha Powder',
    price: 399,
    originalPrice: 499,
    image: '/products/aswagandha bg.png',
    category: 'Natural Powders'
  },
  'papaya-powder': {
    id: 'papaya-powder',
    name: 'Papaya Powder',
    price: 279,
    originalPrice: 359,
    image: '/products/papaya bg.png',
    category: 'Natural Powders'
  }
};

// Calculate cart totals
const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
  const discount = subtotal > 1000 ? subtotal * 0.1 : 0; // 10% discount over ₹1000
  const total = subtotal + shipping - discount;

  return { subtotal, shipping, discount, total };
};

// Get cart from localStorage
export const getCart = (): Cart => {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      return JSON.parse(savedCart);
    } catch (err) {
      console.error('Error loading cart from localStorage:', err);
    }
  }
  
  return {
    items: [],
    total: 0,
    subtotal: 0,
    discount: 0,
    shipping: 0
  };
};

// Save cart to localStorage
const saveCart = (cart: Cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};

// Add item to cart
export const addToCart = (productId: string, quantity: number = 1, productData?: any): Cart => {
  const cart = getCart();
  
  // Use provided product data or get from static data
  const product = productData || products[productId as keyof typeof products];
  
  if (!product) {
    throw new Error('Product not found');
  }

  const newItem: CartItem = {
    ...product,
    quantity
  };

  const existingItemIndex = cart.items.findIndex(item => item.id === productId);
  let newItems;

  if (existingItemIndex >= 0) {
    newItems = [...cart.items];
    newItems[existingItemIndex].quantity += quantity;
  } else {
    newItems = [...cart.items, newItem];
  }

  const totals = calculateTotals(newItems);
  const newCart = { ...cart, items: newItems, ...totals };
  
  saveCart(newCart);
  return newCart;
};

// Update cart item quantity
export const updateQuantity = (productId: string, quantity: number): Cart => {
  const cart = getCart();
  
  const newItems = cart.items.map(item =>
    item.id === productId ? { ...item, quantity } : item
  ).filter(item => item.quantity > 0);

  const totals = calculateTotals(newItems);
  const newCart = { ...cart, items: newItems, ...totals };
  
  saveCart(newCart);
  return newCart;
};

// Remove item from cart
export const removeFromCart = (productId: string): Cart => {
  const cart = getCart();
  
  const newItems = cart.items.filter(item => item.id !== productId);
  const totals = calculateTotals(newItems);
  const newCart = { ...cart, items: newItems, ...totals };
  
  saveCart(newCart);
  return newCart;
};

// Clear cart
export const clearCart = (): Cart => {
  const emptyCart = {
    items: [],
    total: 0,
    subtotal: 0,
    discount: 0,
    shipping: 0
  };
  
  saveCart(emptyCart);
  return emptyCart;
};

// Get cart item count
export const getCartItemCount = (): number => {
  const cart = getCart();
  return cart.items.reduce((total, item) => total + item.quantity, 0);
};

// Get specific cart item
export const getCartItem = (productId: string): CartItem | undefined => {
  const cart = getCart();
  return cart.items.find(item => item.id === productId);
};

// Check if item is in cart
export const isInCart = (productId: string): boolean => {
  const cart = getCart();
  return cart.items.some(item => item.id === productId);
}; 