import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import AdminRecipeService, {
  type PendingReviewsResponse,
  type ReviewDetailResponse,
  type ApproveRecipeResponse,
  type RejectRecipeResponse,
  type DeleteReviewResponse,
  type RecipeReview,
} from '../../services/adminRecipeService';
import { useNotification } from '../../context/NotificationContext';

// Hook to get pending recipe reviews
export const usePendingReviews = (
  page: number = 1,
  pageSize: number = 10,
  status?: 'pending' | 'approved' | 'rejected'
) => {
  const { showNotification } = useNotification();

  return useQuery<PendingReviewsResponse, Error>({
    queryKey: queryKeys.adminRecipes.pending(page, pageSize, status),
    queryFn: () => AdminRecipeService.getPendingReviews(page, pageSize, status),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    retry: false,
    onError: (error) => {
      console.error('Failed to fetch pending reviews:', error);
      showNotification({
        type: 'error',
        message: 'Failed to load pending recipe reviews. Please try again.'
      });
    },
  });
};

// Hook to get specific review
export const useReviewById = (reviewId: string) => {
  const { showNotification } = useNotification();

  return useQuery<ReviewDetailResponse, Error>({
    queryKey: queryKeys.adminRecipes.detail(reviewId),
    queryFn: () => AdminRecipeService.getReviewById(reviewId),
    enabled: !!reviewId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    retry: false,
    onError: (error) => {
      console.error('Failed to fetch review:', error);
      showNotification({
        type: 'error',
        message: 'Failed to load recipe review. Please try again.'
      });
    },
  });
};

// Hook to approve recipe
export const useApproveRecipe = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation<ApproveRecipeResponse, Error, string>({
    mutationFn: (reviewId: string) => AdminRecipeService.approveRecipe(reviewId),
    onSuccess: (data, reviewId) => {
      // Invalidate pending reviews query
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRecipes.all });
      // Invalidate specific review
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRecipes.detail(reviewId) });
      // Also invalidate recipe submissions
      queryClient.invalidateQueries({ queryKey: queryKeys.recipeSubmissions.all });

      showNotification({
        type: 'success',
        message: 'Recipe approved successfully!'
      });
    },
    onError: (error) => {
      console.error('Failed to approve recipe:', error);
      showNotification({
        type: 'error',
        message: error.message || 'Failed to approve recipe. Please try again.'
      });
    },
  });
};

// Hook to reject recipe
export const useRejectRecipe = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation<RejectRecipeResponse, Error, { reviewId: string; reason: string }>({
    mutationFn: ({ reviewId, reason }) => AdminRecipeService.rejectRecipe(reviewId, reason),
    onSuccess: (data, variables) => {
      // Invalidate pending reviews query
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRecipes.all });
      // Invalidate specific review
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRecipes.detail(variables.reviewId) });
      // Also invalidate recipe submissions
      queryClient.invalidateQueries({ queryKey: queryKeys.recipeSubmissions.all });

      showNotification({
        type: 'success',
        message: 'Recipe rejected successfully!'
      });
    },
    onError: (error) => {
      console.error('Failed to reject recipe:', error);
      showNotification({
        type: 'error',
        message: error.message || 'Failed to reject recipe. Please try again.'
      });
    },
  });
};

// Hook to delete review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation<DeleteReviewResponse, Error, string>({
    mutationFn: (reviewId: string) => AdminRecipeService.deleteReview(reviewId),
    onSuccess: (data, reviewId) => {
      // Invalidate pending reviews query
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRecipes.all });
      // Remove specific review from cache
      queryClient.removeQueries({ queryKey: queryKeys.adminRecipes.detail(reviewId) });

      showNotification({
        type: 'success',
        message: 'Review deleted successfully!'
      });
    },
    onError: (error) => {
      console.error('Failed to delete review:', error);
      showNotification({
        type: 'error',
        message: error.message || 'Failed to delete review. Please try again.'
      });
    },
  });
};

// Export types for convenience
export type {
  RecipeReview,
  PendingReviewsResponse,
  ReviewDetailResponse,
  ApproveRecipeResponse,
  RejectRecipeResponse,
  DeleteReviewResponse,
};

