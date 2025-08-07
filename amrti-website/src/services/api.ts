import type { Product, Recipe, User, Order, CartItem } from '../context/AppContext';

// Define Address interface locally to avoid import issues
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.amrti.com';
const API_VERSION = 'v1';

// Request headers
const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}/api/${API_VERSION}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: getHeaders(),
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// ==================== PRODUCTS API ====================

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  search?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const productsApi = {
  // Get all products with filters
  getProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    return apiRequest<ProductsResponse>(`/products?${params.toString()}`);
  },

  // Get featured products
  getFeaturedProducts: async (): Promise<Product[]> => {
    return apiRequest<Product[]>('/products/featured');
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product> => {
    return apiRequest<Product>(`/products/${id}`);
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    return apiRequest<Product[]>(`/products/category/${category}`);
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    return apiRequest<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
  },

  // Get product categories
  getProductCategories: async (): Promise<string[]> => {
    return apiRequest<string[]>('/products/categories');
  },

  // Create product (Admin only)
  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    return apiRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  // Update product (Admin only)
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    return apiRequest<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  // Delete product (Admin only)
  deleteProduct: async (id: string): Promise<void> => {
    return apiRequest<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== RECIPES API ====================

export interface RecipesResponse {
  recipes: Recipe[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RecipeFilters {
  category?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  featured?: boolean;
  search?: string;
  sortBy?: 'title' | 'prepTime' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const recipesApi = {
  // Get all recipes with filters
  getRecipes: async (filters: RecipeFilters = {}): Promise<RecipesResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    return apiRequest<RecipesResponse>(`/recipes?${params.toString()}`);
  },

  // Get featured recipes
  getFeaturedRecipes: async (): Promise<Recipe[]> => {
    return apiRequest<Recipe[]>('/recipes/featured');
  },

  // Get recipe by ID
  getRecipeById: async (id: string): Promise<Recipe> => {
    return apiRequest<Recipe>(`/recipes/${id}`);
  },

  // Get recipes by category
  getRecipesByCategory: async (category: string): Promise<Recipe[]> => {
    return apiRequest<Recipe[]>(`/recipes/category/${category}`);
  },

  // Search recipes
  searchRecipes: async (query: string): Promise<Recipe[]> => {
    return apiRequest<Recipe[]>(`/recipes/search?q=${encodeURIComponent(query)}`);
  },

  // Get recipe categories
  getRecipeCategories: async (): Promise<string[]> => {
    return apiRequest<string[]>('/recipes/categories');
  },

  // Create recipe (Admin only)
  createRecipe: async (recipe: Omit<Recipe, 'id'>): Promise<Recipe> => {
    return apiRequest<Recipe>('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    });
  },

  // Update recipe (Admin only)
  updateRecipe: async (id: string, recipe: Partial<Recipe>): Promise<Recipe> => {
    return apiRequest<Recipe>(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipe),
    });
  },

  // Delete recipe (Admin only)
  deleteRecipe: async (id: string): Promise<void> => {
    return apiRequest<void>(`/recipes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== AUTHENTICATION API ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store tokens
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    return response;
  },

  // Register user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store tokens
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    return response;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiRequest<void>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Clear tokens regardless of API response
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    // Update tokens
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    return response;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>('/auth/me');
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    return apiRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    return apiRequest<void>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    return apiRequest<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    return apiRequest<void>('/auth/reset-password', {
      method: 'PUT',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

// ==================== CART API ====================

export interface CartResponse {
  items: CartItem[];
  total: number;
  count: number;
}

export const cartApi = {
  // Get user's cart
  getCart: async (): Promise<CartResponse> => {
    return apiRequest<CartResponse>('/cart');
  },

  // Add item to cart
  addToCart: async (productId: string, variantIndex: number, quantity: number): Promise<CartResponse> => {
    return apiRequest<CartResponse>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, variantIndex, quantity }),
    });
  },

  // Update cart item quantity
  updateCartItem: async (productId: string, variantIndex: number, quantity: number): Promise<CartResponse> => {
    return apiRequest<CartResponse>('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, variantIndex, quantity }),
    });
  },

  // Remove item from cart
  removeFromCart: async (productId: string, variantIndex: number): Promise<CartResponse> => {
    return apiRequest<CartResponse>('/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({ productId, variantIndex }),
    });
  },

  // Clear cart
  clearCart: async (): Promise<void> => {
    return apiRequest<void>('/cart/clear', {
      method: 'DELETE',
    });
  },
};

// ==================== ORDERS API ====================

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    variantIndex: number;
    quantity: number;
  }>;
  shippingAddress: Address;
  paymentMethod: 'cod' | 'card' | 'upi';
  couponCode?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ordersApi = {
  // Get user's orders
  getOrders: async (page = 1, limit = 10): Promise<OrdersResponse> => {
    return apiRequest<OrdersResponse>(`/orders?page=${page}&limit=${limit}`);
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<Order> => {
    return apiRequest<Order>(`/orders/${id}`);
  },

  // Create new order
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    return apiRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<Order> => {
    return apiRequest<Order>(`/orders/${id}/cancel`, {
      method: 'PUT',
    });
  },

  // Get order status
  getOrderStatus: async (id: string): Promise<{ status: Order['status'] }> => {
    return apiRequest<{ status: Order['status'] }>(`/orders/${id}/status`);
  },
};

// ==================== PAYMENT API ====================

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  clientSecret: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi';
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
}

export const paymentApi = {
  // Create payment intent
  createPaymentIntent: async (amount: number, currency = 'INR'): Promise<PaymentIntent> => {
    return apiRequest<PaymentIntent>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    });
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId: string, paymentMethodId: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, paymentMethodId }),
    });
  },

  // Get payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    return apiRequest<PaymentMethod[]>('/payments/methods');
  },

  // Add payment method
  addPaymentMethod: async (paymentMethod: any): Promise<PaymentMethod> => {
    return apiRequest<PaymentMethod>('/payments/methods', {
      method: 'POST',
      body: JSON.stringify(paymentMethod),
    });
  },

  // Remove payment method
  removePaymentMethod: async (id: string): Promise<void> => {
    return apiRequest<void>(`/payments/methods/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== UTILITY API ====================

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterRequest {
  email: string;
}

export const utilityApi = {
  // Contact form submission
  submitContact: async (contactData: ContactRequest): Promise<void> => {
    return apiRequest<void>('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },

  // Newsletter subscription
  subscribeNewsletter: async (email: string): Promise<void> => {
    return apiRequest<void>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Unsubscribe from newsletter
  unsubscribeNewsletter: async (email: string): Promise<void> => {
    return apiRequest<void>('/newsletter/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Get app settings
  getSettings: async (): Promise<Record<string, any>> => {
    return apiRequest<Record<string, any>>('/settings');
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    return apiRequest<{ status: string; timestamp: string }>('/health');
  },
};

// ==================== MOCK DATA FOR DEVELOPMENT ====================

// This section contains mock data that can be used during development
// Replace these with actual API calls when backend is ready

export const mockProducts: Product[] = [
  {
    id: '65b4e0f56d5fdf8013a98d53',
    name: 'Turmeric Powder',
    category: 'Natural Powders',
    price: 299,
    originalPrice: 399,
    description: 'Pure organic turmeric powder with high curcumin content',
    longDescription: 'Our premium turmeric powder is sourced from the finest organic farms and contains high levels of curcumin, the active compound responsible for turmeric\'s powerful anti-inflammatory and antioxidant properties.',
    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=500&fit=crop',
    ],
    variants: [
      { size: '100g', price: 299, originalPrice: 399, stock: 50 },
      { size: '250g', price: 699, originalPrice: 899, stock: 30 },
      { size: '500g', price: 1299, originalPrice: 1699, stock: 20 }
    ],
    benefits: [
      'High curcumin content for maximum potency',
      'Natural anti-inflammatory properties',
      'Rich in antioxidants',
      'Supports joint health',
      'Boosts immune system',
      'Aids digestion'
    ],
    usage: [
      'Add 1 tsp to warm milk for golden milk',
      'Use in cooking curries and soups',
      'Mix with honey for face mask',
      'Blend in smoothies'
    ],
    ingredients: '100% Organic Turmeric (Curcuma longa)',
    nutrition: {
      'Curcumin': '3-5%',
      'Fiber': '22g per 100g',
      'Iron': '41mg per 100g',
      'Potassium': '2525mg per 100g'
    },
    certifications: ['Organic', 'Non-GMO', 'Gluten-Free', 'Vegan'],
    rating: 4.8,
    reviews: 156,
    inStock: true,
    featured: true
  },
  // Add more mock products here...
];

export const mockRecipes: Recipe[] = [
  {
    id: 'recipe-1',
    title: 'Golden Milk with Turmeric',
    category: 'Beverages',
    description: 'A warming and healing drink perfect for cold evenings',
    prepTime: '5 minutes',
    difficulty: 'Easy',
    servings: 2,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&h=500&fit=crop',
    ingredients: [
      '2 cups milk (dairy or plant-based)',
      '1 tsp Amrti Turmeric Powder',
      '1/2 tsp ground cinnamon',
      '1/4 tsp ground ginger',
      '1 tbsp honey or maple syrup',
      'Pinch of black pepper'
    ],
    instructions: [
      'Heat milk in a saucepan over medium heat',
      'Add turmeric, cinnamon, ginger, and black pepper',
      'Whisk until well combined and heated through',
      'Stir in honey or maple syrup to taste',
      'Pour into mugs and enjoy warm'
    ],
    benefits: [
      'Anti-inflammatory properties',
      'Boosts immunity',
      'Aids digestion',
      'Promotes better sleep'
    ],
    nutrition: {
      'Calories': '120 per serving',
      'Protein': '8g',
      'Fat': '5g',
      'Carbohydrates': '12g'
    },
    featured: true,
    rating: 4.9,
    reviews: 89
  },
  // Add more mock recipes here...
];

// Export all APIs
export default {
  products: productsApi,
  recipes: recipesApi,
  auth: authApi,
  cart: cartApi,
  orders: ordersApi,
  payment: paymentApi,
  utility: utilityApi,
}; 