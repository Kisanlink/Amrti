import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  description: string;
  longDescription: string;
  image: string;
  images: string[];
  variants: ProductVariant[];
  benefits: string[];
  usage: string[];
  ingredients: string;
  nutrition: Record<string, string>;
  certifications: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
}

export interface ProductVariant {
  size: string;
  price: number;
  originalPrice: number;
  stock: number;
}

export interface Recipe {
  id: string;
  title: string;
  category: string;
  description: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  image: string;
  ingredients: string[];
  instructions: string[];
  benefits: string[];
  nutrition: Record<string, string>;
  featured: boolean;
  rating: number;
  reviews: number;
}

export interface CartItem {
  productId: string;
  variantIndex: number;
  quantity: number;
  product: Product;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  shippingAddress: Address;
}

// State Interface
export interface AppState {
  // Products
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  featuredProducts: Product[];
  
  // Recipes
  recipes: Recipe[];
  recipesLoading: boolean;
  recipesError: string | null;
  featuredRecipes: Recipe[];
  
  // Cart
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  
  // User
  user: User | null;
  userLoading: boolean;
  userError: string | null;
  
  // Orders
  orders: Order[];
  ordersLoading: boolean;
  ordersError: string | null;
  
  // UI State
  sidebarOpen: boolean;
  searchQuery: string;
  selectedCategory: string;
}

// Action Types
export type AppAction =
  | { type: 'SET_PRODUCTS_LOADING'; payload: boolean }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_PRODUCTS_ERROR'; payload: string | null }
  | { type: 'SET_FEATURED_PRODUCTS'; payload: Product[] }
  | { type: 'SET_RECIPES_LOADING'; payload: boolean }
  | { type: 'SET_RECIPES'; payload: Recipe[] }
  | { type: 'SET_RECIPES_ERROR'; payload: string | null }
  | { type: 'SET_FEATURED_RECIPES'; payload: Recipe[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_USER_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_USER_ERROR'; payload: string | null }
  | { type: 'SET_ORDERS_LOADING'; payload: boolean }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'SET_ORDERS_ERROR'; payload: string | null }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string };

// Initial State
const initialState: AppState = {
  // Products
  products: [],
  productsLoading: false,
  productsError: null,
  featuredProducts: [],
  
  // Recipes
  recipes: [],
  recipesLoading: false,
  recipesError: null,
  featuredRecipes: [],
  
  // Cart
  cart: [],
  cartTotal: 0,
  cartCount: 0,
  
  // User
  user: null,
  userLoading: false,
  userError: null,
  
  // Orders
  orders: [],
  ordersLoading: false,
  ordersError: null,
  
  // UI State
  sidebarOpen: false,
  searchQuery: '',
  selectedCategory: '',
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PRODUCTS_LOADING':
      return { ...state, productsLoading: action.payload };
    
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    
    case 'SET_PRODUCTS_ERROR':
      return { ...state, productsError: action.payload };
    
    case 'SET_FEATURED_PRODUCTS':
      return { ...state, featuredProducts: action.payload };
    
    case 'SET_RECIPES_LOADING':
      return { ...state, recipesLoading: action.payload };
    
    case 'SET_RECIPES':
      return { ...state, recipes: action.payload };
    
    case 'SET_RECIPES_ERROR':
      return { ...state, recipesError: action.payload };
    
    case 'SET_FEATURED_RECIPES':
      return { ...state, featuredRecipes: action.payload };
    
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(
        item => item.productId === action.payload.productId && 
                item.variantIndex === action.payload.variantIndex
      );
      
      let newCart;
      if (existingItem) {
        newCart = state.cart.map(item =>
          item.productId === action.payload.productId && 
          item.variantIndex === action.payload.variantIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newCart = [...state.cart, action.payload];
      }
      
      const cartTotal = newCart.reduce((total, item) => 
        total + (item.product.variants[item.variantIndex].price * item.quantity), 0
      );
      const cartCount = newCart.reduce((count, item) => count + item.quantity, 0);
      
      return { ...state, cart: newCart, cartTotal, cartCount };
    }
    
    case 'REMOVE_FROM_CART': {
      const newCart = state.cart.filter(item => 
        !(item.productId === action.payload && item.variantIndex === 0)
      );
      const cartTotal = newCart.reduce((total, item) => 
        total + (item.product.variants[item.variantIndex].price * item.quantity), 0
      );
      const cartCount = newCart.reduce((count, item) => count + item.quantity, 0);
      
      return { ...state, cart: newCart, cartTotal, cartCount };
    }
    
    case 'UPDATE_CART_QUANTITY': {
      const newCart = state.cart.map(item =>
        item.productId === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      
      const cartTotal = newCart.reduce((total, item) => 
        total + (item.product.variants[item.variantIndex].price * item.quantity), 0
      );
      const cartCount = newCart.reduce((count, item) => count + item.quantity, 0);
      
      return { ...state, cart: newCart, cartTotal, cartCount };
    }
    
    case 'CLEAR_CART':
      return { ...state, cart: [], cartTotal: 0, cartCount: 0 };
    
    case 'SET_USER_LOADING':
      return { ...state, userLoading: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_USER_ERROR':
      return { ...state, userError: action.payload };
    
    case 'SET_ORDERS_LOADING':
      return { ...state, ordersLoading: action.payload };
    
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    
    case 'SET_ORDERS_ERROR':
      return { ...state, ordersError: action.payload };
    
    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebarOpen: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext; 