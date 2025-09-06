import type { Product, Recipe, User, Order } from '../context/AppContext';

// Define Address interface locally to avoid import issues
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_VERSION = 'v1';

// Request headers
export const getHeaders = async (isFormData = false): Promise<HeadersInit> => {
  // Import AuthService dynamically to avoid circular dependencies
  const { default: AuthService } = await import('./authService');
  const token = await AuthService.getIdToken();
  
  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  
  // Only set Content-Type for JSON requests, not for FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}/api/${API_VERSION}${endpoint}`;
  
  // Debug logging for orders API calls
  if (endpoint.includes('/orders/')) {
    console.log('Orders API Request Debug:');
    console.log('Full URL:', url);
    console.log('Method:', options.method || 'GET');
    console.log('API Base URL:', API_BASE_URL);
    console.log('API Version:', API_VERSION);
    console.log('Endpoint:', endpoint);
  }
  
  try {
    // Check if the request body is FormData
    const isFormData = options.body instanceof FormData;
    const headers = await getHeaders(isFormData);
    
    // Debug headers for orders API calls
    if (endpoint.includes('/orders/')) {
      console.log('Orders API Headers Debug:');
      console.log('Headers:', headers);
      console.log('Authorization header present:', !!(headers as any).Authorization);
      console.log('Content-Type header present:', !!(headers as any)['Content-Type']);
    }
    
    if (endpoint.includes('create-order')) {
      console.log('Headers:', headers);
      console.log('Authorization header present:', !!(headers as any).Authorization);
      console.log('Content-Type header present:', !!(headers as any)['Content-Type']);
    }
    
    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Enhanced debugging for orders API calls
      if (endpoint.includes('/orders/')) {
        console.log('Orders API Error Response:');
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        console.log('Error data:', errorData);
      }
      
      // Enhanced debugging for create-order requests
      if (endpoint.includes('create-order')) {
        console.log('Create-order API response status:', response.status);
        console.log('Create-order API response headers:', Object.fromEntries(response.headers.entries()));
        console.log('Create-order API error response:', errorData);
      }
      
      // Handle different HTTP status codes
      if (response.status === 401) {
        // Only show login modal if user is not already on login/signup pages
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          // Check if we've already shown a login modal recently to prevent spam
          const lastLoginModal = localStorage.getItem('lastLoginModal');
          const now = Date.now();
          if (!lastLoginModal || (now - parseInt(lastLoginModal)) > 5000) { // 5 second cooldown
            localStorage.setItem('lastLoginModal', now.toString());
            window.dispatchEvent(new CustomEvent('loginRequired', { 
              detail: { 
                message: errorData.message || 'Please login to continue',
                redirectUrl: window.location.pathname 
              } 
            }));
          }
        }
      } else if (response.status === 403) {
        // Only show login modal if user is not already on login/signup pages
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          const lastLoginModal = localStorage.getItem('lastLoginModal');
          const now = Date.now();
          if (!lastLoginModal || (now - parseInt(lastLoginModal)) > 5000) {
            localStorage.setItem('lastLoginModal', now.toString());
            window.dispatchEvent(new CustomEvent('loginRequired', { 
              detail: { 
                message: 'You do not have permission to access this resource. Please login with an account that has the required permissions.',
                redirectUrl: window.location.pathname 
              } 
            }));
          }
        }
      } else if (response.status === 419) {
        // Only show login modal if user is not already on login/signup pages
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          const lastLoginModal = localStorage.getItem('lastLoginModal');
          const now = Date.now();
          if (!lastLoginModal || (now - parseInt(lastLoginModal)) > 5000) {
            localStorage.setItem('lastLoginModal', now.toString());
            window.dispatchEvent(new CustomEvent('loginRequired', { 
              detail: { 
                message: 'Your session has expired. Please login again to continue.',
                redirectUrl: window.location.pathname 
              } 
            }));
          }
        }
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    // Debug successful orders API responses
    if (endpoint.includes('/orders/')) {
      console.log('Orders API Success Response:');
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);
    }
    
    return responseData;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// ==================== RECIPES API ====================

export interface RecipesResponse {
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  recipes: Recipe[];
}

export interface RecipeDetailResponse {
  recipe: Recipe;
}

export const recipesApi = {
  // Get all recipes with pagination
  getRecipes: async (page = 1, page_size = 10): Promise<RecipesResponse> => {
    return apiRequest<RecipesResponse>(`/recipes?page=${page}&page_size=${page_size}`);
  },

  // Get recipes by category
  getRecipesByCategory: async (category: string, page = 1, page_size = 10): Promise<RecipesResponse> => {
    return apiRequest<RecipesResponse>(`/recipes/category/${category}?page=${page}&page_size=${page_size}`);
  },

  // Get recipe by ID
  getRecipeById: async (id: string): Promise<RecipeDetailResponse> => {
    return apiRequest<RecipeDetailResponse>(`/recipes/${id}`);
  },
};

// ==================== PRODUCTS API ====================

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  timestamp: string;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface ProductDetailResponse {
  success: boolean;
  message: string;
  data: Product;
  timestamp: string;
}

export const productsApi = {
  // Get all products with pagination
  getProducts: async (page = 1, per_page = 20): Promise<ProductsResponse> => {
    return apiRequest<ProductsResponse>(`/products?page=${page}&per_page=${per_page}`);
  },

  // Get product by ID
  getProductById: async (product_id: string): Promise<ProductDetailResponse> => {
    return apiRequest<ProductDetailResponse>(`/products/${product_id}`);
  },

  // Get products by category
  getProductsByCategory: async (category: string, page = 1, per_page = 20): Promise<ProductsResponse> => {
    return apiRequest<ProductsResponse>(`/products/category/${category}?page=${page}&per_page=${per_page}`);
  },

  // Search products
  searchProducts: async (search_term: string, page = 1, per_page = 20): Promise<ProductsResponse> => {
    return apiRequest<ProductsResponse>(`/products/search?q=${encodeURIComponent(search_term)}&page=${page}&per_page=${per_page}`);
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
}

export interface GoogleOAuthRequest {
  id_token: string;
}

export interface VerifyTokenRequest {
  id_token: string;
}

export interface AuthTokens {
  expires_in: string;
  id_token: string;
  refresh_token: string;
}

export interface AuthUser {
  created_at: string | number;
  email: string;
  id: string;
  is_active: boolean;
  is_verified: boolean;
  name: string;
  uid: string;
  email_verified?: boolean;
  last_login?: number;
  phone_number?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    tokens: AuthTokens;
    user: AuthUser;
  };
  timestamp: string;
}

export interface GoogleOAuthResponse {
  google_oauth_setup: {
    client_setup: string;
    frontend_sdk: string;
  };
  instructions: {
    step1: string;
    step2: string;
    step3: string;
  };
  message: string;
}

export const authApi = {
  // Verify token (for backend API calls when needed)
  verifyToken: async (idToken: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>('/auth/verify-token', {
      method: 'GET',
      body: JSON.stringify({ id_token: idToken }),
    });
  },

  // Backend logout (if needed for server-side session management)
  logout: async (): Promise<void> => {
    try {
      await apiRequest<void>('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Backend logout failed:', error);
      // Continue with local cleanup even if backend fails
    }
  },
};

// ==================== CART API ====================

export interface CartItem {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product; // Product details if available
}

export interface Cart {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  user_id: string;
  total_items: number;
  total_price: number;
  discount_amount: number;
  items: CartItem[];
}

export interface CartResponse {
  data: Cart;
  message: string;
  success: boolean;
}

export interface CartListResponse {
  data: {
    cart: Cart;
    discount_amount: number;
    discounted_total: number;
  };
  message: string;
  success: boolean;
}

export interface CartSummaryResponse {
  data: {
    user_id: string;
    total_items: number;
    total_price: number;
    discount_amount: number;
    discounted_total: number;
    items_count: number;
    last_updated: string;
    has_expired: boolean;
    expires_at: string;
    is_from_cache: boolean;
  };
  message: string;
  success: boolean;
}

export interface CartCountResponse {
  data: {
    item_count: number;
  };
  message: string;
  success: boolean;
}

export interface CartValidationResponse {
  data: {
    cart: Cart;
    cart_updated: boolean;
    validation_issues: string[];
  };
  message: string;
  success: boolean;
}

export const cartApi = {
  // Add item to cart
  addItem: async (productId: string, quantity: number): Promise<CartResponse> => {
    return apiRequest<CartResponse>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  // Get cart
  getCart: async (): Promise<CartListResponse> => {
    return apiRequest<CartListResponse>('/cart');
  },

  // Update cart item quantity
  updateItemQuantity: async (productId: string, quantity: number): Promise<CartResponse> => {
    return apiRequest<CartResponse>(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  // Remove item from cart
  removeItem: async (productId: string): Promise<CartResponse> => {
    return apiRequest<CartResponse>(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
  },

  // Increment item quantity
  incrementItem: async (productId: string): Promise<CartResponse> => {
    return apiRequest<CartResponse>(`/cart/items/${productId}/increment`, {
      method: 'POST',
    });
  },

  // Decrement item quantity
  decrementItem: async (productId: string): Promise<CartResponse> => {
    return apiRequest<CartResponse>(`/cart/items/${productId}/decrement`, {
      method: 'POST',
    });
  },

  // Get cart summary
  getSummary: async (): Promise<CartSummaryResponse> => {
    return apiRequest<CartSummaryResponse>('/cart/summary');
  },

  // Get cart item count
  getCount: async (): Promise<CartCountResponse> => {
    return apiRequest<CartCountResponse>('/cart/count');
  },

  // Validate cart
  validate: async (): Promise<CartValidationResponse> => {
    return apiRequest<CartValidationResponse>('/cart/validate');
  },
};

// ==================== FAVORITES API ====================

export interface Favorite {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  user_id: string;
  product_id: string;
  product?: Product;
}

export interface FavoritesResponse {
  count: number;
  favorites: Favorite[];
  message: string;
}

export interface FavoriteCheckResponse {
  is_favorite: boolean;
  message: string;
}

export interface AddFavoriteResponse {
  favorite: Favorite;
  message: string;
}

export const favoritesApi = {
  // Check if product is in favorites
  checkFavorite: async (productId: string): Promise<FavoriteCheckResponse> => {
    return apiRequest<FavoriteCheckResponse>(`/favorites/check/${productId}`);
  },

  // Add to favorites
  addToFavorites: async (productId: string): Promise<AddFavoriteResponse> => {
    return apiRequest<AddFavoriteResponse>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  },

  // Get user favorites
  getFavorites: async (): Promise<FavoritesResponse> => {
    return apiRequest<FavoritesResponse>('/favorites');
  },

  // Remove from favorites
  removeFromFavorites: async (productId: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>('/favorites', {
      method: 'DELETE',
      body: JSON.stringify({ product_id: productId }),
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

// ==================== PROFILE API ====================

export interface UserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  profile_picture_url: string;
  profile_picture_s3_key: string;
  bio: string;
  newsletter_subscribed: boolean;
  preferred_language: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface ProfileResponse {
  data: UserProfile;
  message: string;
}

export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  bio?: string;
  newsletter_subscribed?: boolean;
  preferred_language?: string;
}

export interface ProfileImageResponse {
  data: UserProfile;
  image_url: string;
  message: string;
  s3_key: string;
}

export const profileApi = {
  // Auto-fill profile (first time setup)
  autoFillProfile: async (): Promise<ProfileResponse> => {
    return apiRequest<ProfileResponse>('/profiles/auto', {
      method: 'POST',
    });
  },

  // Get user profile
  getProfile: async (): Promise<ProfileResponse> => {
    return apiRequest<ProfileResponse>('/profiles');
  },

  // Update user profile
  updateProfile: async (profileData: ProfileUpdateRequest): Promise<ProfileResponse> => {
    return apiRequest<ProfileResponse>('/profiles', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Upload profile picture
  uploadProfileImage: async (imageFile: File): Promise<ProfileImageResponse> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return apiRequest<ProfileImageResponse>('/profiles/upload-image', {
      method: 'POST',
      body: formData,
    });
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

// Export all APIs
export default {
  products: productsApi,
  recipes: recipesApi,
  auth: authApi,
  cart: cartApi,
  favorites: favoritesApi,
  profile: profileApi,
  orders: ordersApi,
  payment: paymentApi,
  utility: utilityApi,
}; 