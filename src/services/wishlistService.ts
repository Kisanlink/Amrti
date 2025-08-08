export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  addedAt: string;
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

// Get wishlist from localStorage
export const getWishlist = (): WishlistItem[] => {
  const savedWishlist = localStorage.getItem('wishlist');
  if (savedWishlist) {
    try {
      return JSON.parse(savedWishlist);
    } catch (err) {
      console.error('Error loading wishlist from localStorage:', err);
    }
  }
  
  return [];
};

// Save wishlist to localStorage
const saveWishlist = (wishlist: WishlistItem[]) => {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent('wishlistUpdated'));
};

// Add item to wishlist
export const addToWishlist = (productId: string, productData?: any): WishlistItem[] => {
  const wishlist = getWishlist();
  
  // Use provided product data or get from static data
  const product = productData || products[productId as keyof typeof products];
  
  if (!product) {
    throw new Error('Product not found');
  }

  const existingItem = wishlist.find(item => item.id === productId);
  if (!existingItem) {
    const newItem: WishlistItem = {
      ...product,
      addedAt: new Date().toISOString()
    };
    
    const newWishlist = [...wishlist, newItem];
    saveWishlist(newWishlist);
    return newWishlist;
  }
  
  return wishlist;
};

// Remove item from wishlist
export const removeFromWishlist = (productId: string): WishlistItem[] => {
  const wishlist = getWishlist();
  
  const newWishlist = wishlist.filter(item => item.id !== productId);
  saveWishlist(newWishlist);
  return newWishlist;
};

// Clear wishlist
export const clearWishlist = (): WishlistItem[] => {
  const emptyWishlist: WishlistItem[] = [];
  saveWishlist(emptyWishlist);
  return emptyWishlist;
};

// Move item from wishlist to cart
export const moveToCart = (productId: string): { wishlist: WishlistItem[], cart: any } => {
  const wishlist = getWishlist();
  const item = wishlist.find(item => item.id === productId);
  
  if (!item) {
    throw new Error('Item not found in wishlist');
  }
  
  const newWishlist = wishlist.filter(item => item.id !== productId);
  saveWishlist(newWishlist);
  
  // Import cart service to add item to cart
  const { addToCart } = require('./cartService');
  const cart = addToCart(productId, 1, item);
  
  return {
    wishlist: newWishlist,
    cart
  };
};

// Check if item is in wishlist
export const isInWishlist = (productId: string): boolean => {
  const wishlist = getWishlist();
  return wishlist.some(item => item.id === productId);
};

// Get wishlist count
export const getWishlistCount = (): number => {
  const wishlist = getWishlist();
  return wishlist.length;
};

// Get specific wishlist item
export const getWishlistItem = (productId: string): WishlistItem | undefined => {
  const wishlist = getWishlist();
  return wishlist.find(item => item.id === productId);
}; 