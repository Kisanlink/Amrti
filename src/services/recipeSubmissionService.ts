import { getHeaders, apiRequest } from './api';
import AuthService from './authService';
import { buildApiUrl } from '../config/apiConfig';

// Types
export interface RecipeImageUploadResponse {
  message: string;
  image_id: string;
  image_url: string;
  s3_key: string;
  filename: string;
  size: number;
  type: string;
}

export interface RecipeSubmissionRequest {
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
}

export interface RecipeSubmissionResponse {
  message: string;
  review: {
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
    created_at: string;
    updated_at: string;
    reviewed_at?: string | null;
    reviewed_by?: string | null;
    rejection_reason?: string | null;
  };
}

export interface RecipeSubmission {
  review_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  name: string;
  category: string;
  demo_description?: string;
  prep_time: string;
  servings: number;
  difficulty: string;
  image: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  rejection_reason?: string | null;
}

export interface MySubmissionsResponse {
  submissions: RecipeSubmission[];
  count: number;
}

export interface DeleteImageResponse {
  message: string;
  s3_key: string;
}

class RecipeSubmissionService {
  /**
   * Upload recipe image
   * POST /api/v1/recipes/images/upload
   */
  static async uploadImage(file: File): Promise<RecipeImageUploadResponse> {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit.');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('image', file);

    // Get headers with FormData flag
    const headers = await getHeaders(true);

    // Make request using configurable API URL
    const response = await fetch(buildApiUrl('/recipes/images/upload'), {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to upload image: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Submit recipe for review
   * POST /api/v1/recipes/submit
   */
  static async submitRecipe(data: RecipeSubmissionRequest): Promise<RecipeSubmissionResponse> {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    return apiRequest<RecipeSubmissionResponse>('/recipes/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get user's submitted recipes
   * GET /api/v1/recipes/my-submissions
   */
  static async getMySubmissions(): Promise<MySubmissionsResponse> {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    return apiRequest<MySubmissionsResponse>('/recipes/my-submissions');
  }

  /**
   * Delete recipe image
   * DELETE /api/v1/recipes/images/{s3_key}
   */
  static async deleteImage(s3Key: string): Promise<DeleteImageResponse> {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    // Encode the s3_key for URL
    const encodedKey = encodeURIComponent(s3Key);
    
    return apiRequest<DeleteImageResponse>(`/recipes/images/${encodedKey}`, {
      method: 'DELETE',
    });
  }
}

export default RecipeSubmissionService;

