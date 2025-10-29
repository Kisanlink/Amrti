import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProductService from '../../services/productService';
import { queryKeys, handleQueryError, handleQuerySuccess } from '../../lib/queryClient';
import type { Product, ProductListResponse, ProductDetailResponse } from '../../services/api';

// Get all products with pagination and filters
export const useProducts = (page: number = 1, category?: string, search?: string) => {
  return useQuery({
    queryKey: queryKeys.products.list(page, category, search),
    queryFn: async () => {
      try {
        const response = await ProductService.getProducts(page, 12, category, search);
        return response;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    refetchOnMount: false, // Prevent refetch on component mount
  });
};

// Get product by ID
export const useProductById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: async () => {
      try {
        const response = await ProductService.getProductById(id);
        return response;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent refetch on component mount
    enabled: !!id, // Only run if id is provided
  });
};

// Get products by category
export const useProductsByCategory = (category: string, page: number = 1) => {
  return useQuery({
    queryKey: queryKeys.products.byCategory(category, page),
    queryFn: async () => {
      try {
        const response = await ProductService.getProductsByCategory(category, page);
        return response;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    refetchOnMount: false, // Prevent refetch on component mount
    enabled: !!category, // Only run if category is provided
  });
};

// Search products
export const useSearchProducts = (query: string, page: number = 1) => {
  return useQuery({
    queryKey: queryKeys.products.search(query, page),
    queryFn: async () => {
      try {
        const response = await ProductService.searchProducts(query, page);
        return response;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    refetchOnMount: false, // Prevent refetch on component mount
    enabled: !!query && query.length > 2, // Only run if query is provided and has at least 3 characters
  });
};

// Get featured products
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: queryKeys.products.featured,
    queryFn: async () => {
      try {
        const response = await ProductService.getFeaturedProducts();
        return response;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent refetch on component mount
  });
};

// Get all products (for admin or special cases)
export const useAllProducts = () => {
  return useQuery({
    queryKey: queryKeys.products.all,
    queryFn: async () => {
      try {
        const response = await ProductService.getAllProducts();
        return response;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent refetch on component mount
  });
};

// Prefetch product data
export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: async () => {
        try {
          const response = await ProductService.getProductById(id);
          return response;
        } catch (error) {
          throw handleQueryError(error);
        }
      },
      staleTime: 10 * 60 * 1000,
    });
  };
};

// Invalidate product queries
export const useInvalidateProducts = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  };
};