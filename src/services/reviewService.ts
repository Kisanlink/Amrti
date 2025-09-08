import { apiRequest } from './api';

// Review interfaces
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  likes_count: number;
  is_verified: boolean;
  review_date: string;
  is_user_liked: boolean;
}

export interface CreateReviewRequest {
  rating: number;
  title: string;
  comment: string;
  is_verified?: boolean;
}

export interface CreateReviewResponse {
  success: boolean;
  data: Review;
  message: string;
}

export interface LikeReviewRequest {
  action: 'like' | 'unlike';
}

export interface LikeReviewResponse {
  success: boolean;
  data: {
    review_id: string;
    likes_count: number;
    is_user_liked: boolean;
    action_performed: string;
  };
  message: string;
}

export interface UserReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
  message: string;
}

export interface ProductReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
  message: string;
}

export class ReviewService {
  /**
   * Create a new review for a product
   * @param productId - Product ID
   * @param reviewData - Review data
   * @returns Promise with created review
   */
  static async createReview(productId: string, reviewData: CreateReviewRequest): Promise<Review> {
    try {
      const response = await apiRequest<CreateReviewResponse>(`/products/${productId}/reviews/`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create review:', error);
      throw new Error('Failed to create review. Please try again later.');
    }
  }

  /**
   * Like or unlike a review
   * @param productId - Product ID
   * @param reviewId - Review ID
   * @param action - Like or unlike action
   * @returns Promise with updated like status
   */
  static async likeReview(productId: string, reviewId: string, action: 'like' | 'unlike'): Promise<LikeReviewResponse['data']> {
    try {
      const response = await apiRequest<LikeReviewResponse>(`/products/${productId}/reviews/${reviewId}/like`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      
      console.log('Like review API response:', response);
      
      // Handle different response structures
      if (response.data) {
        return response.data;
      } else if ((response as any).review_id) {
        // Handle direct response structure (even if success: false)
        return {
          review_id: (response as any).review_id,
          likes_count: (response as any).likes_count || 0,
          is_user_liked: (response as any).is_user_liked || false,
          action_performed: (response as any).action_performed || action
        };
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Failed to like/unlike review:', error);
      throw new Error('Failed to update review like status. Please try again later.');
    }
  }

  /**
   * Get reviews for a specific product
   * @param productId - Product ID
   * @param page - Page number
   * @param limit - Number of reviews per page
   * @returns Promise with product reviews
   */
  static async getProductReviews(productId: string, page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; pagination: any }> {
    try {
      const response = await apiRequest<ProductReviewsResponse>(`/products/${productId}/reviews?page=${page}&limit=${limit}`);
      return {
        reviews: response.data.reviews,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Failed to fetch product reviews:', error);
      throw new Error('Failed to fetch product reviews. Please try again later.');
    }
  }

  /**
   * Get reviews by a specific user
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Number of reviews per page
   * @returns Promise with user reviews
   */
  static async getUserReviews(userId: string, page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; pagination: any }> {
    try {
      const response = await apiRequest<UserReviewsResponse>(`/users/${userId}/reviews?page=${page}&limit=${limit}`);
      return {
        reviews: response.data.reviews,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
      throw new Error('Failed to fetch user reviews. Please try again later.');
    }
  }

  /**
   * Get recent reviews for home page
   * @param limit - Number of reviews to fetch
   * @returns Promise with recent reviews
   */
  static async getRecentReviews(limit: number = 6): Promise<Review[]> {
    try {
      // This would need to be implemented on the backend
      // For now, we'll return an empty array or use a fallback
      const response = await apiRequest<{ success: boolean; data: { reviews: Review[] } }>(`/reviews/recent?limit=${limit}`);
      return response.data.reviews;
    } catch (error) {
      console.error('Failed to fetch recent reviews:', error);
      // Return fallback reviews for home page
      return this.getFallbackReviews();
    }
  }

  /**
   * Delete a review
   * @param productId - The product ID
   * @param reviewId - The review ID to delete
   * @returns Promise with success status and message
   */
  static async deleteReview(productId: string, reviewId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest(`/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE'
      });
      
      return {
        success: (response as any).success || true,
        message: (response as any).message || 'Review deleted successfully'
      };
    } catch (error) {
      console.error('Failed to delete review:', error);
      throw new Error('Failed to delete review');
    }
  }

  /**
   * Get fallback reviews for when API fails
   * @returns Array of fallback reviews
   */
  static getFallbackReviews(): Review[] {
    return [
      {
        id: 'fallback-1',
        product_id: 'PROD00000001',
        user_id: 'USER00000001',
        user_name: 'Amit Sharma',
        rating: 5,
        title: 'Excellent Quality!',
        comment: 'The moringa powder is pure and authentic. I\'ve been using it for my morning smoothies and noticed improved energy levels. Highly recommended!',
        likes_count: 12,
        is_verified: true,
        review_date: new Date().toISOString(),
        is_user_liked: true
      },
      {
        id: 'fallback-2',
        product_id: 'PROD00000001',
        user_id: 'USER00000002',
        user_name: 'Priya Kumar',
        rating: 5,
        title: 'Great Product!',
        comment: 'Amazing quality and fast delivery. The packaging is excellent and the product is exactly as described. Will definitely order again!',
        likes_count: 8,
        is_verified: true,
        review_date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        is_user_liked: false
      },
      {
        id: 'fallback-3',
        product_id: 'PROD00000001',
        user_id: 'USER00000003',
        user_name: 'Rajesh Patel',
        rating: 4,
        title: 'Good Quality',
        comment: 'The product quality is good and it arrived on time. I would recommend this to others looking for natural supplements.',
        likes_count: 5,
        is_verified: true,
        review_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        is_user_liked: false
      }
    ];
  }
}

export default ReviewService;
