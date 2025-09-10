import { productsApi, type ProductsResponse, type ProductDetailResponse } from './api';
import type { Product } from '../context/AppContext';

export class ProductService {
  /**
   * Get all products with pagination
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 20)
   * @returns Promise with products and pagination info
   */
  static async getAllProducts(page = 1, perPage = 20): Promise<ProductsResponse> {
    try {
      const response: any = await productsApi.getProducts(page, perPage);
      
      // Log the response to debug the structure
      console.log('Products API Response:', response);
      
      // Ensure the response has the expected structure
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('API response does not have expected data structure:', response);
        // If the response doesn't have the expected structure, try to adapt it
        if (Array.isArray(response)) {
          // If the response is directly an array of products
          return {
            success: true,
            message: 'Products loaded successfully',
            data: response,
            timestamp: new Date().toISOString(),
            pagination: {
              page: 1,
              per_page: response.length,
              total: response.length,
              total_pages: 1,
              has_next: false,
              has_prev: false
            }
          };
        } else if (response.products && Array.isArray(response.products)) {
          // If the response has a 'products' property
          return {
            success: true,
            message: 'Products loaded successfully',
            data: response.products,
            timestamp: new Date().toISOString(),
            pagination: {
              page: 1,
              per_page: response.products.length,
              total: response.products.length,
              total_pages: 1,
              has_next: false,
              has_prev: false
            }
          };
        }
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw new Error('Failed to fetch products. Please try again later.');
    }
  }

  /**
   * Get product by ID
   * @param productId - Product ID
   * @returns Promise with product details
   */
  static async getProductById(productId: string): Promise<Product> {
    try {
      if (!productId || productId.trim() === '') {
        throw new Error('Product ID is required');
      }

      const response: any = await productsApi.getProductById(productId);
      
      // Log the response to debug the structure
      console.log('Product Detail API Response:', response);
      
      // Handle different response structures
      if (response.data && response.data.product) {
        // Handle nested structure: { data: { product: {...} } }
        return response.data.product;
      } else if (response.data) {
        // Handle direct data structure: { data: {...} }
        return response.data;
      } else if (response.product) {
        // Handle product property: { product: {...} }
        return response.product;
      } else if (response) {
        // If the response is directly the product object
        return response;
      } else {
        throw new Error('Invalid response structure from API');
      }
    } catch (error) {
      console.error(`Failed to fetch product ${productId}:`, error);
      throw new Error('Failed to fetch product details. Please try again later.');
    }
  }

  /**
   * Get products by category
   * @param category - Product category (Superfoods, Herbs)
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 20)
   * @returns Promise with products and pagination info
   */
  static async getProductsByCategory(
    category: string, 
    page = 1, 
    perPage = 20
  ): Promise<ProductsResponse> {
    try {
      // Validate category
      const validCategories = ['Superfoods', 'Herbs'];
      if (!validCategories.includes(category)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
      }
      
      const response: any = await productsApi.getProductsByCategory(category, page, perPage);
      
      // Log the response to debug the structure
      console.log(`Products by Category API Response for ${category}:`, response);
      
      // Ensure the response has the expected structure
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('API response does not have expected data structure:', response);
        // If the response doesn't have the expected structure, try to adapt it
        if (Array.isArray(response)) {
          // If the response is directly an array of products
          return {
            success: true,
            message: 'Products loaded successfully',
            data: response,
            timestamp: new Date().toISOString(),
            pagination: {
              page: 1,
              per_page: response.length,
              total: response.length,
              total_pages: 1,
              has_next: false,
              has_prev: false
            }
          };
        } else if (response.products && Array.isArray(response.products)) {
          // If the response has a 'products' property
          return {
            success: true,
            message: 'Products loaded successfully',
            data: response.products,
            timestamp: new Date().toISOString(),
            pagination: {
              page: 1,
              per_page: response.products.length,
              total: response.products.length,
              total_pages: 1,
              has_next: false,
              has_prev: false
            }
          };
        }
      }
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch products for category ${category}:`, error);
      throw new Error(`Failed to fetch products for ${category}. Please try again later.`);
    }
  }

  /**
   * Search products by name or description
   * @param searchTerm - Search term
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 20)
   * @returns Promise with matching products
   */
  static async searchProducts(
    searchTerm: string, 
    page = 1, 
    perPage = 20
  ): Promise<ProductsResponse> {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        throw new Error('Search term is required');
      }

      const response: any = await productsApi.searchProducts(searchTerm, page, perPage);
      
      // Log the response to debug the structure
      console.log(`Search Products API Response for "${searchTerm}":`, response);
      
      // Ensure the response has the expected structure
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('API response does not have expected data structure:', response);
        // If the response doesn't have the expected structure, try to adapt it
        if (Array.isArray(response)) {
          // If the response is directly an array of products
          return {
            success: true,
            message: 'Products loaded successfully',
            data: response,
            timestamp: new Date().toISOString(),
            pagination: {
              page: 1,
              per_page: response.length,
              total: response.length,
              total_pages: 1,
              has_next: false,
              has_prev: false
            }
          };
        } else if (response.products && Array.isArray(response.products)) {
          // If the response has a 'products' property
          return {
            success: true,
            message: 'Products loaded successfully',
            data: response.products,
            timestamp: new Date().toISOString(),
            pagination: {
              page: 1,
              per_page: response.products.length,
              total: response.products.length,
              total_pages: 1,
              has_next: false,
              has_prev: false
            }
          };
        }
      }
      
      return response;
    } catch (error) {
      console.error(`Failed to search products for "${searchTerm}":`, error);
      throw new Error('Failed to search products. Please try again later.');
    }
  }

  /**
   * Get featured products (first 8 products)
   * @returns Promise with featured products
   */
  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      const response: any = await productsApi.getProducts(1, 8);
      
      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.products && Array.isArray(response.products)) {
        return response.products;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        console.warn('Unexpected response structure for featured products:', response);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      throw new Error('Failed to fetch featured products. Please try again later.');
    }
  }

  /**
   * Get available product categories
   * @returns Array of available categories
   */
  static getAvailableCategories(): string[] {
    return ['Superfoods', 'Herbs'];
  }

  /**
   * Format product price for display
   * @param price - Product price in rupees
   * @returns Formatted price string
   */
  static formatPrice(price: number): string {
    return `₹${price.toFixed(0)}`;
  }

  /**
   * Calculate discount percentage
   * @param actualPrice - Original price
   * @param currentPrice - Current price
   * @returns Discount percentage
   */
  static calculateDiscount(actualPrice: number, currentPrice: number): number {
    if (actualPrice <= currentPrice) return 0;
    return Math.round(((actualPrice - currentPrice) / actualPrice) * 100);
  }

  /**
   * Format product rating for display
   * @param rating - Product rating
   * @returns Formatted rating string
   */
  static formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  /**
   * Get product image with fallback
   * @param imageUrl - Product image URL
   * @param fallbackUrl - Fallback image URL
   * @returns Image URL or fallback
   */
  static getProductImage(imageUrl: string, fallbackUrl?: string): string {
    if (imageUrl && imageUrl.trim() !== '') {
      return imageUrl;
    }
    return fallbackUrl || '/public/products/product_banner.jpg';
  }

  /**
   * Check if product is in stock
   * @param stock - Product stock count
   * @param stockStatus - Product stock status
   * @returns Boolean indicating if product is in stock
   */
  static isInStock(stock: number, stockStatus: string): boolean {
    return stock > 0 && stockStatus.toLowerCase() === 'in stock';
  }

  /**
   * Get stock status text
   * @param stock - Product stock count
   * @param stockStatus - Product stock status
   * @returns Stock status text
   */
  static getStockStatusText(stock: number, stockStatus: string): string {
    if (stock <= 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return stockStatus;
  }

  /**
   * Sort products by various criteria
   * @param products - Array of products to sort
   * @param sortBy - Sort criteria
   * @param sortOrder - Sort order
   * @returns Sorted products array
   */
  static sortProducts(
    products: Product[], 
    sortBy: 'name' | 'price' | 'rating' | 'reviews' = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Product[] {
    const sortedProducts = [...products];
    
    sortedProducts.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'reviews':
          aValue = a.review_count;
          bValue = b.review_count;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sortedProducts;
  }

  /**
   * Filter products by various criteria
   * @param products - Array of products to filter
   * @param filters - Filter criteria
   * @returns Filtered products array
   */
  static filterProducts(
    products: Product[], 
    filters: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      inStock?: boolean;
      minRating?: number;
    }
  ): Product[] {
    return products.filter(product => {
      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      
      // Price range filter
      if (filters.minPrice && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && product.price > filters.maxPrice) {
        return false;
      }
      
      // Stock filter
      if (filters.inStock !== undefined && this.isInStock(product.stock, product.stock_status) !== filters.inStock) {
        return false;
      }
      
      // Rating filter
      if (filters.minRating && product.rating < filters.minRating) {
        return false;
      }
      
      return true;
    });
  }
}

export default ProductService; 