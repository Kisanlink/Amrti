import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../context/AppContext';

// Types
export interface ProductsState {
  // Products data
  products: Product[];
  featuredProducts: Product[];
  currentProduct: Product | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  
  // Filters and search
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
  priceRange: { min: number; max: number };
  
  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  isLoadingProduct: boolean;
  
  // Error state
  error: string | null;
  
  // Cache
  lastFetched: string | null;
  cacheExpiry: number;
}

// Initial state
const initialState: ProductsState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
  currentPage: 1,
  totalPages: 0,
  totalProducts: 0,
  hasNextPage: false,
  hasPrevPage: false,
  searchQuery: '',
  selectedCategory: '',
  sortBy: 'name',
  priceRange: { min: 0, max: 10000 },
  isLoading: false,
  isLoadingMore: false,
  isLoadingProduct: false,
  error: null,
  lastFetched: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (
    { page = 1, category = '', search = '', sortBy = 'name' }: {
      page?: number;
      category?: string;
      search?: string;
      sortBy?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { productsApi } = await import('../../services/api');
      
      let response;
      if (search) {
        response = await productsApi.searchProducts(search, page, 20);
      } else if (category) {
        response = await productsApi.getProductsByCategory(category, page, 20);
      } else {
        response = await productsApi.getProducts(page, 20);
      }
      
      return {
        products: response.data,
        pagination: response.pagination,
        searchQuery: search,
        selectedCategory: category,
        sortBy,
        page,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId: string, { rejectWithValue }) => {
    try {
      const { productsApi } = await import('../../services/api');
      const response = await productsApi.getProductById(productId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch product');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { productsApi } = await import('../../services/api');
      const response = await productsApi.getProducts(1, 8);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch featured products');
    }
  }
);

export const loadMoreProducts = createAsyncThunk(
  'products/loadMore',
  async (
    { page, category = '', search = '', sortBy = 'name' }: {
      page: number;
      category?: string;
      search?: string;
      sortBy?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { productsApi } = await import('../../services/api');
      
      let response;
      if (search) {
        response = await productsApi.searchProducts(search, page, 20);
      } else if (category) {
        response = await productsApi.getProductsByCategory(category, page, 20);
      } else {
        response = await productsApi.getProducts(page, 20);
      }
      
      return {
        products: response.data,
        pagination: response.pagination,
        page,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load more products');
    }
  }
);

// Products slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setPriceRange: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.priceRange = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearProducts: (state) => {
      state.products = [];
      state.currentPage = 1;
      state.totalPages = 0;
      state.totalProducts = 0;
      state.hasNextPage = false;
      state.hasPrevPage = false;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.selectedCategory = '';
      state.sortBy = 'name';
      state.priceRange = { min: 0, max: 10000 };
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.pagination.total_pages;
        state.totalProducts = action.payload.pagination.total;
        state.hasNextPage = action.payload.pagination.has_next;
        state.hasPrevPage = action.payload.pagination.has_prev;
        state.searchQuery = action.payload.searchQuery;
        state.selectedCategory = action.payload.selectedCategory;
        state.sortBy = action.payload.sortBy;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoadingProduct = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoadingProduct = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoadingProduct = false;
        state.error = action.payload as string;
      })
      
      // Fetch featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredProducts = action.payload;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Load more products
      .addCase(loadMoreProducts.pending, (state) => {
        state.isLoadingMore = true;
        state.error = null;
      })
      .addCase(loadMoreProducts.fulfilled, (state, action) => {
        state.isLoadingMore = false;
        state.products = [...state.products, ...action.payload.products];
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.pagination.total_pages;
        state.totalProducts = action.payload.pagination.total;
        state.hasNextPage = action.payload.pagination.has_next;
        state.hasPrevPage = action.payload.pagination.has_prev;
        state.error = null;
      })
      .addCase(loadMoreProducts.rejected, (state, action) => {
        state.isLoadingMore = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setSearchQuery,
  setSelectedCategory,
  setSortBy,
  setPriceRange,
  setCurrentPage,
  clearCurrentProduct,
  clearProducts,
  resetFilters,
} = productsSlice.actions;

export default productsSlice.reducer;



