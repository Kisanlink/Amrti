import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Background refetch interval: 10 minutes
      refetchInterval: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus
        refetchOnWindowFocus: false,
        // Refetch on reconnect
        refetchOnReconnect: true,
        // Keep previous data while fetching new data
        keepPreviousData: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Retry delay
      retryDelay: 1000,
    },
  },
});

// Query keys factory
export const queryKeys = {
  // Auth queries
  auth: {
    user: ['auth', 'user'] as const,
    token: ['auth', 'token'] as const,
  },
  
  // Cart queries
  cart: {
    all: ['cart'] as const,
    items: ['cart', 'items'] as const,
    summary: ['cart', 'summary'] as const,
    count: ['cart', 'count'] as const,
  },
  
  // Products queries
  products: {
    all: ['products'] as const,
    list: (page: number, category?: string, search?: string) => 
      ['products', 'list', { page, category, search }] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    featured: ['products', 'featured'] as const,
    byCategory: (category: string, page: number) => 
      ['products', 'category', category, page] as const,
    search: (query: string, page: number) => 
      ['products', 'search', query, page] as const,
  },
  
  // Recipes queries
  recipes: {
    all: ['recipes'] as const,
    list: (page: number, category?: string) => 
      ['recipes', 'list', { page, category }] as const,
    detail: (id: string) => ['recipes', 'detail', id] as const,
    featured: ['recipes', 'featured'] as const,
    byCategory: (category: string, page: number) => 
      ['recipes', 'category', category, page] as const,
  },
  
  // Recipe submissions queries
  recipeSubmissions: {
    all: ['recipeSubmissions'] as const,
    mySubmissions: ['recipeSubmissions', 'mySubmissions'] as const,
    detail: (reviewId: string) => ['recipeSubmissions', 'detail', reviewId] as const,
  },
  
  // Admin recipe reviews queries
  adminRecipes: {
    all: ['adminRecipes'] as const,
    pending: (page: number, pageSize: number, status?: string) => 
      ['adminRecipes', 'pending', { page, pageSize, status }] as const,
    detail: (reviewId: string) => ['adminRecipes', 'detail', reviewId] as const,
  },
  
  // Wishlist queries
  wishlist: {
    all: ['wishlist'] as const,
    items: ['wishlist', 'items'] as const,
    count: ['wishlist', 'count'] as const,
    check: (productId: string) => ['wishlist', 'check', productId] as const,
  },
  
  // Orders queries
  orders: {
    all: ['orders'] as const,
    list: (page: number, limit: number) => 
      ['orders', 'list', { page, limit }] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  
  // Profile queries
  profile: {
    all: ['profile'] as const,
    user: ['profile', 'user'] as const,
  },
};

// Error handling utility
export const handleQueryError = (error: any) => {
  console.error('Query error:', error);
  
  // Handle different types of errors
  if (error?.response?.status === 401) {
    // Unauthorized - redirect to login
    window.dispatchEvent(new CustomEvent('loginRequired'));
  } else if (error?.response?.status === 403) {
    // Forbidden
    return 'You do not have permission to access this resource';
  } else if (error?.response?.status >= 500) {
    // Server error
    return 'Server error. Please try again later';
  } else if (error?.code === 'NETWORK_ERROR') {
    // Network error
    return 'Network error. Please check your connection';
  }
  
  return error?.message || 'An unexpected error occurred';
};

// Success handling utility
export const handleQuerySuccess = (data: any, message?: string) => {
  if (message) {
    // Dispatch success notification
    window.dispatchEvent(new CustomEvent('notification', {
      detail: {
        type: 'success',
        title: 'Success',
        message,
      }
    }));
  }
  return data;
};
