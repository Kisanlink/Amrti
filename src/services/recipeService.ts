import { recipesApi, type RecipesResponse, type RecipeDetailResponse } from './api';
import type { Recipe } from '../context/AppContext';

export class RecipeService {
  /**
   * Get all recipes with pagination
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 10)
   * @returns Promise with recipes and pagination info
   */
  static async getAllRecipes(page = 1, pageSize = 10): Promise<RecipesResponse> {
    try {
      const response = await recipesApi.getRecipes(page, pageSize);
      
      // Transform the API response to match the Recipe interface
      const transformedRecipes = response.recipes.map((apiRecipe: any) => ({
        id: apiRecipe.id || `recipe_${Math.random().toString(36).substr(2, 9)}`,
        created_at: apiRecipe.created_at || new Date().toISOString(),
        updated_at: apiRecipe.updated_at || new Date().toISOString(),
        created_by: apiRecipe.created_by || 'system',
        updated_by: apiRecipe.updated_by || 'system',
        recipe_id: apiRecipe.recipe_id || apiRecipe.id || `recipe_${Math.random().toString(36).substr(2, 9)}`,
        name: apiRecipe.name,
        category: apiRecipe.category || 'Superfoods', // Default category
        rating: apiRecipe.rating || 0,
        reviews: apiRecipe.reviews || 0,
        description: apiRecipe.description || apiRecipe.demo_description || '',
        demo_description: apiRecipe.demo_description || '',
        prep_time: apiRecipe.prep_time || '5 mins',
        servings: apiRecipe.servings || 2,
        difficulty: apiRecipe.difficulty || 'Easy',
        image: apiRecipe.image || '',
        ingredients: apiRecipe.ingredients || [],
        instructions: apiRecipe.instructions || [],
        nutrition_facts: apiRecipe.nutrition_facts || {},
        pro_tips: apiRecipe.pro_tips || []
      }));
      
      return {
        ...response,
        recipes: transformedRecipes
      };
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      throw new Error('Failed to fetch recipes. Please try again later.');
    }
  }

  /**
   * Get recipes by category
   * @param category - Recipe category (Breakfast, Dessert, Superfoods)
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 10)
   * @returns Promise with recipes and pagination info
   */
  static async getRecipesByCategory(
    category: string, 
    page = 1, 
    pageSize = 10
  ): Promise<RecipesResponse> {
    try {
      // Validate category
      const validCategories = ['Breakfast', 'Dessert', 'Superfoods'];
      if (!validCategories.includes(category)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
      }
      
      const response = await recipesApi.getRecipesByCategory(category, page, pageSize);
      
      // Transform the API response to match the Recipe interface
      const transformedRecipes = response.recipes.map((apiRecipe: any) => ({
        id: apiRecipe.id || `recipe_${Math.random().toString(36).substr(2, 9)}`,
        created_at: apiRecipe.created_at || new Date().toISOString(),
        updated_at: apiRecipe.updated_at || new Date().toISOString(),
        created_by: apiRecipe.created_by || 'system',
        updated_by: apiRecipe.updated_by || 'system',
        recipe_id: apiRecipe.recipe_id || apiRecipe.id || `recipe_${Math.random().toString(36).substr(2, 9)}`,
        name: apiRecipe.name,
        category: apiRecipe.category || 'Superfoods', // Default category
        rating: apiRecipe.rating || 0,
        reviews: apiRecipe.reviews || 0,
        description: apiRecipe.description || apiRecipe.demo_description || '',
        demo_description: apiRecipe.demo_description || '',
        prep_time: apiRecipe.prep_time || '5 mins',
        servings: apiRecipe.servings || 2,
        difficulty: apiRecipe.difficulty || 'Easy',
        image: apiRecipe.image || '',
        ingredients: apiRecipe.ingredients || [],
        instructions: apiRecipe.instructions || [],
        nutrition_facts: apiRecipe.nutrition_facts || {},
        pro_tips: apiRecipe.pro_tips || []
      }));
      
      return {
        ...response,
        recipes: transformedRecipes
      };
    } catch (error) {
      console.error(`Failed to fetch recipes for category ${category}:`, error);
      throw new Error(`Failed to fetch recipes for ${category}. Please try again later.`);
    }
  }

  /**
   * Get recipe by ID
   * @param id - Recipe ID
   * @returns Promise with recipe details
   */
  static async getRecipeById(id: string): Promise<Recipe> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('Recipe ID is required');
      }

      const response = await recipesApi.getRecipeById(id);
      return response.recipe;
    } catch (error) {
      console.error(`Failed to fetch recipe ${id}:`, error);
      throw new Error('Failed to fetch recipe details. Please try again later.');
    }
  }

  /**
   * Get featured recipes (first 4 recipes)
   * @returns Promise with featured recipes
   */
  static async getFeaturedRecipes(): Promise<Recipe[]> {
    try {
      const response = await recipesApi.getRecipes(1, 4);
      return response.recipes;
    } catch (error) {
      console.error('Failed to fetch featured recipes:', error);
      throw new Error('Failed to fetch featured recipes. Please try again later.');
    }
  }

  /**
   * Search recipes by name or description
   * @param query - Search query
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 10)
   * @returns Promise with matching recipes
   */
  static async searchRecipes(query: string, page = 1, pageSize = 10): Promise<Recipe[]> {
    try {
      if (!query || query.trim() === '') {
        throw new Error('Search query is required');
      }

      // Get all recipes and filter locally since search endpoint is not provided
      const response = await recipesApi.getRecipes(page, pageSize);
      const searchTerm = query.toLowerCase();
      
      return response.recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.demo_description.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error(`Failed to search recipes for "${query}":`, error);
      throw new Error('Failed to search recipes. Please try again later.');
    }
  }

  /**
   * Get available recipe categories
   * @returns Array of available categories
   */
  static getAvailableCategories(): string[] {
    return ['Breakfast', 'Dessert', 'Superfoods'];
  }

  /**
   * Format recipe difficulty for display
   * @param difficulty - Recipe difficulty level
   * @returns Formatted difficulty string
   */
  static formatDifficulty(difficulty: string): string {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
  }

  /**
   * Format recipe rating for display
   * @param rating - Recipe rating
   * @returns Formatted rating string
   */
  static formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  /**
   * Get recipe image with fallback
   * @param imageUrl - Recipe image URL
   * @param fallbackUrl - Fallback image URL
   * @returns Image URL or fallback
   */
  static getRecipeImage(imageUrl: string, fallbackUrl?: string): string {
    if (imageUrl && imageUrl.trim() !== '') {
      return imageUrl;
    }
    return fallbackUrl || '/public/Recipes/moringa smoothie.jpg';
  }
}

export default RecipeService;
