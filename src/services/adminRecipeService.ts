import { apiRequest } from './api';
import AuthService from './authService';

// Types
export interface RecipeReview {
  review_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  name: string;
  category: string;
  description: string;
  demo_description?: string;
  prep_time: string;
  servings: number;
  difficulty: string;
  image: string;
  ingredients: string[];
  instructions: string[];
  nutrition_facts?: {
    calories?: string;
    fat?: string;
    carbs?: string;
    protein?: string;
  };
  pro_tips?: string[];
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  rejection_reason?: string | null;
}

export interface PendingReviewsResponse {
  reviews: RecipeReview[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface ReviewDetailResponse {
  review: RecipeReview;
}

export interface ApproveRecipeResponse {
  message: string;
  recipe: {
    recipe_id: string;
    name: string;
    category: string;
    rating: number;
    reviews: number;
    description: string;
    demo_description?: string;
    prep_time: string;
    servings: number;
    difficulty: string;
    image: string;
    ingredients: string[];
    instructions: string[];
    nutrition_facts?: {
      calories?: string;
      fat?: string;
      carbs?: string;
      protein?: string;
    };
    pro_tips?: string[];
    created_at: string;
    updated_at: string;
  };
  review: RecipeReview;
}

export interface RejectRecipeRequest {
  reason: string;
}

export interface RejectRecipeResponse {
  message: string;
  review: RecipeReview;
}

export interface DeleteReviewResponse {
  message: string;
}

class AdminRecipeService {
  /**
   * Get pending recipe reviews
   * GET /api/v1/admin/recipes/pending
   */
  static async getPendingReviews(
    page: number = 1,
    pageSize: number = 10,
    status?: 'pending' | 'approved' | 'rejected'
  ): Promise<PendingReviewsResponse> {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    return apiRequest<PendingReviewsResponse>(`/admin/recipes/pending?${params.toString()}`);
  }

  /**
   * Get specific pending review
   * GET /api/v1/admin/recipes/pending/{review_id}
   */
  static async getReviewById(reviewId: string): Promise<ReviewDetailResponse> {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    return apiRequest<ReviewDetailResponse>(`/admin/recipes/pending/${reviewId}`);
  }

  /**
   * Approve recipe
   * POST /api/v1/admin/recipes/pending/{review_id}/approve
   */
  static async approveRecipe(reviewId: string): Promise<ApproveRecipeResponse> {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    return apiRequest<ApproveRecipeResponse>(
      `/admin/recipes/pending/${reviewId}/approve`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Reject recipe
   * POST /api/v1/admin/recipes/pending/{review_id}/reject
   */
  static async rejectRecipe(
    reviewId: string,
    reason: string
  ): Promise<RejectRecipeResponse> {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    return apiRequest<RejectRecipeResponse>(
      `/admin/recipes/pending/${reviewId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
  }

  /**
   * Delete pending review
   * DELETE /api/v1/admin/recipes/pending/{review_id}
   */
  static async deleteReview(reviewId: string): Promise<DeleteReviewResponse> {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    return apiRequest<DeleteReviewResponse>(
      `/admin/recipes/pending/${reviewId}`,
      {
        method: 'DELETE',
      }
    );
  }
}

export default AdminRecipeService;





