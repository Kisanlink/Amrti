import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import ProductService, { type CreateProductRequest, type UpdateProductRequest } from '../../services/productService';
import { useNotification } from '../../context/NotificationContext';

export const useAdminProductList = (page = 1, perPage = 20) => {
  return useQuery({
    queryKey: queryKeys.adminProducts.list(page, perPage),
    queryFn: () => ProductService.getAllProducts(page, perPage),
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useAdminProductImages = (productId: string) => {
  return useQuery({
    queryKey: queryKeys.adminProducts.images(productId),
    queryFn: () => ProductService.getProductImages(productId),
    enabled: !!productId,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => ProductService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      showNotification({ type: 'success', message: 'Product created successfully!' });
    },
    onError: (error: any) => {
      showNotification({ type: 'error', message: error.message || 'Failed to create product' });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      ProductService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      showNotification({ type: 'success', message: 'Product updated successfully!' });
    },
    onError: (error: any) => {
      showNotification({ type: 'error', message: error.message || 'Failed to update product' });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (id: string) => ProductService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      showNotification({ type: 'success', message: 'Product deleted successfully!' });
    },
    onError: (error: any) => {
      showNotification({ type: 'error', message: error.message || 'Failed to delete product' });
    },
  });
};

export const useUploadProductImage = (productId: string) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: ({ file, altText }: { file: File; altText?: string }) =>
      ProductService.uploadProductImage(productId, file, altText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts.images(productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
      showNotification({ type: 'success', message: 'Image uploaded successfully!' });
    },
    onError: (error: any) => {
      showNotification({ type: 'error', message: error.message || 'Failed to upload image' });
    },
  });
};

export const useDeleteProductImage = (productId: string) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (imageId: string) => ProductService.deleteProductImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts.images(productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
      showNotification({ type: 'success', message: 'Image deleted successfully!' });
    },
    onError: (error: any) => {
      showNotification({ type: 'error', message: error.message || 'Failed to delete image' });
    },
  });
};

export const useSetImageAsPrimary = (productId: string) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (imageId: string) => ProductService.setImageAsPrimary(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts.images(productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
      showNotification({ type: 'success', message: 'Primary image updated!' });
    },
    onError: (error: any) => {
      showNotification({ type: 'error', message: error.message || 'Failed to set primary image' });
    },
  });
};
