import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RecipeReview } from '../../services/adminRecipeService';

// Types
export interface AdminRecipesState {
  // Filters and pagination
  currentPage: number;
  pageSize: number;
  statusFilter: 'pending' | 'approved' | 'rejected' | 'all';
  searchQuery: string;
  
  // Selected review
  selectedReviewId: string | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Cached reviews (for optimistic updates)
  cachedReviews: RecipeReview[];
  
  // Modal states
  rejectModalOpen: boolean;
  deleteModalOpen: boolean;
  
  // Stats
  stats: {
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
  };
}

// Initial state
const initialState: AdminRecipesState = {
  currentPage: 1,
  pageSize: 10,
  statusFilter: 'all',
  searchQuery: '',
  selectedReviewId: null,
  isLoading: false,
  error: null,
  cachedReviews: [],
  rejectModalOpen: false,
  deleteModalOpen: false,
  stats: {
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
  },
};

// Admin Recipes slice
const adminRecipesSlice = createSlice({
  name: 'adminRecipes',
  initialState,
  reducers: {
    // Pagination actions
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
    },
    goToNextPage: (state) => {
      state.currentPage += 1;
    },
    goToPrevPage: (state) => {
      state.currentPage = Math.max(1, state.currentPage - 1);
    },
    goToFirstPage: (state) => {
      state.currentPage = 1;
    },
    
    // Filter actions
    setStatusFilter: (state, action: PayloadAction<'pending' | 'approved' | 'rejected' | 'all'>) => {
      state.statusFilter = action.payload;
      state.currentPage = 1; // Reset to first page when changing filter
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page when searching
    },
    clearFilters: (state) => {
      state.statusFilter = 'all';
      state.searchQuery = '';
      state.currentPage = 1;
    },
    
    // Selected review actions
    setSelectedReviewId: (state, action: PayloadAction<string | null>) => {
      state.selectedReviewId = action.payload;
    },
    clearSelectedReview: (state) => {
      state.selectedReviewId = null;
    },
    
    // Loading actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // Error actions
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Cache actions
    setCachedReviews: (state, action: PayloadAction<RecipeReview[]>) => {
      state.cachedReviews = action.payload;
    },
    updateCachedReview: (state, action: PayloadAction<RecipeReview>) => {
      const index = state.cachedReviews.findIndex(
        r => r.review_id === action.payload.review_id
      );
      if (index >= 0) {
        state.cachedReviews[index] = action.payload;
      } else {
        state.cachedReviews.push(action.payload);
      }
    },
    removeCachedReview: (state, action: PayloadAction<string>) => {
      state.cachedReviews = state.cachedReviews.filter(
        r => r.review_id !== action.payload
      );
    },
    clearCachedReviews: (state) => {
      state.cachedReviews = [];
    },
    
    // Modal actions
    setRejectModalOpen: (state, action: PayloadAction<boolean>) => {
      state.rejectModalOpen = action.payload;
    },
    setDeleteModalOpen: (state, action: PayloadAction<boolean>) => {
      state.deleteModalOpen = action.payload;
    },
    
    // Stats actions
    setStats: (state, action: PayloadAction<{
      totalPending: number;
      totalApproved: number;
      totalRejected: number;
    }>) => {
      state.stats = action.payload;
    },
    updateStats: (state, action: PayloadAction<{
      totalPending?: number;
      totalApproved?: number;
      totalRejected?: number;
    }>) => {
      state.stats = {
        ...state.stats,
        ...action.payload,
      };
    },
    
    // Reset state
    resetAdminRecipes: (state) => {
      state.currentPage = 1;
      state.pageSize = 10;
      state.statusFilter = 'all';
      state.searchQuery = '';
      state.selectedReviewId = null;
      state.isLoading = false;
      state.error = null;
      state.cachedReviews = [];
      state.rejectModalOpen = false;
      state.deleteModalOpen = false;
      state.stats = {
        totalPending: 0,
        totalApproved: 0,
        totalRejected: 0,
      };
    },
  },
});

export const {
  // Pagination
  setCurrentPage,
  setPageSize,
  goToNextPage,
  goToPrevPage,
  goToFirstPage,
  
  // Filters
  setStatusFilter,
  setSearchQuery,
  clearFilters,
  
  // Selected review
  setSelectedReviewId,
  clearSelectedReview,
  
  // Loading
  setLoading,
  
  // Error
  setError,
  clearError,
  
  // Cache
  setCachedReviews,
  updateCachedReview,
  removeCachedReview,
  clearCachedReviews,
  
  // Modals
  setRejectModalOpen,
  setDeleteModalOpen,
  
  // Stats
  setStats,
  updateStats,
  
  // Reset
  resetAdminRecipes,
} = adminRecipesSlice.actions;

export default adminRecipesSlice.reducer;





