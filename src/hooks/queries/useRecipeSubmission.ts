import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import RecipeSubmissionService, {
  type RecipeImageUploadResponse,
  type RecipeSubmissionRequest,
  type RecipeSubmissionResponse,
  type RecipeSubmission,
  type MySubmissionsResponse,
  type DeleteImageResponse,
} from '../../services/recipeSubmissionService';
import { useNotification } from '../../context/NotificationContext';

// Hook to get user's recipe submissions
export const useMySubmissions = () => {
  const { showNotification } = useNotification();
  
  return useQuery<MySubmissionsResponse, Error>({
    queryKey: queryKeys.recipeSubmissions.mySubmissions,
    queryFn: RecipeSubmissionService.getMySubmissions,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: false,
    onError: (error) => {
      console.error('Failed to fetch recipe submissions:', error);
      showNotification({
        type: 'error',
        message: 'Failed to load your recipe submissions. Please try again.'
      });
    },
  });
};

// Hook to upload recipe image
export const useUploadRecipeImage = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  
  return useMutation<RecipeImageUploadResponse, Error, File>({
    mutationFn: RecipeSubmissionService.uploadImage,
    onSuccess: (data) => {
      showNotification({
        type: 'success',
        message: 'Image uploaded successfully!'
      });
    },
    onError: (error) => {
      console.error('Failed to upload image:', error);
      showNotification({
        type: 'error',
        message: error.message || 'Failed to upload image. Please try again.'
      });
    },
  });
};

// Hook to submit recipe
export const useSubmitRecipe = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  
  return useMutation<RecipeSubmissionResponse, Error, RecipeSubmissionRequest>({
    mutationFn: RecipeSubmissionService.submitRecipe,
    onSuccess: (data) => {
      // Invalidate my submissions query to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.recipeSubmissions.mySubmissions });
      
      showNotification({
        type: 'success',
        message: 'Recipe submitted for review successfully!'
      });
    },
    onError: (error) => {
      console.error('Failed to submit recipe:', error);
      showNotification({
        type: 'error',
        message: error.message || 'Failed to submit recipe. Please try again.'
      });
    },
  });
};

// Hook to delete recipe image
export const useDeleteRecipeImage = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  
  return useMutation<DeleteImageResponse, Error, string>({
    mutationFn: RecipeSubmissionService.deleteImage,
    onSuccess: (data) => {
      showNotification({
        type: 'success',
        message: 'Image deleted successfully!'
      });
    },
    onError: (error) => {
      console.error('Failed to delete image:', error);
      showNotification({
        type: 'error',
        message: error.message || 'Failed to delete image. Please try again.'
      });
    },
  });
};

// Export types for convenience
export type {
  RecipeImageUploadResponse,
  RecipeSubmissionRequest,
  RecipeSubmissionResponse,
  RecipeSubmission,
  MySubmissionsResponse,
  DeleteImageResponse,
};

