import { useState, useEffect, useCallback, useRef } from 'react';
import ProductService from '../services/productService';
import type { Product } from '../context/AppContext';

interface UseProductDetailsCacheOptions {
  items: Array<{ product_id: string; product?: Partial<Product> }>;
  cacheKey: string;
  enabled?: boolean;
}

interface UseProductDetailsCacheResult {
  productDetails: Record<string, Product>;
  loading: boolean;
  refresh: () => void;
}

/**
 * Shared hook for fetching and caching product details
 * Handles localStorage caching, parallel fetching, and TTL management
 */
export const useProductDetailsCache = ({
  items,
  cacheKey,
  enabled = true
}: UseProductDetailsCacheOptions): UseProductDetailsCacheResult => {
  const [productDetails, setProductDetails] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(false);
  const productDetailsRef = useRef<Record<string, Product>>({});

  // Keep ref in sync with state
  useEffect(() => {
    productDetailsRef.current = productDetails;
  }, [productDetails]);

  // Load cached product data from localStorage on mount
  useEffect(() => {
    if (!enabled) return;
    
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        // Check if cache is still valid (24 hours)
        const cacheAge = Date.now() - (parsed.timestamp || 0);
        if (cacheAge < 24 * 60 * 60 * 1000) {
          const cachedDetails = parsed.data || {};
          setProductDetails(cachedDetails);
          productDetailsRef.current = cachedDetails;
        } else {
          // Clear expired cache
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (err) {
      console.error('Failed to load cached product data:', err);
    }
  }, [cacheKey, enabled]);

  // Helper to check if product has valid image data
  const hasProductImage = (product?: Partial<Product>): boolean => {
    if (!product) return false;
    return !!(
      product.image_url ||
      (product.images &&
        Array.isArray(product.images) &&
        product.images.some(
          (img: any) => img.image_url && img.is_active !== false
        ))
    );
  };

  // Fetch missing product details
  const fetchMissingProducts = useCallback(async () => {
    if (!enabled || !items || items.length === 0) return;

    // Use ref to access current productDetails without including it in dependencies
    const currentProductDetails = productDetailsRef.current;

    // Find items that need product details
    const missingProductIds = items
      .filter((item) => {
        const hasImage = hasProductImage(item.product);
        return !hasImage && !currentProductDetails[item.product_id];
      })
      .map((item) => item.product_id);

    if (missingProductIds.length === 0) return;

    setLoading(true);
    console.log(`Fetching missing product details for ${cacheKey}:`, missingProductIds);

    try {
      // Fetch product details in parallel
      const productPromises = missingProductIds.map(async (productId: string) => {
        try {
          // Check individual product cache first
          const cachedData = localStorage.getItem(`product_${productId}`);
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            const cacheAge = Date.now() - (parsed.timestamp || 0);
            if (cacheAge < 24 * 60 * 60 * 1000 && parsed.data) {
              return { productId, product: parsed.data };
            }
          }

          // Fetch from API
          const product = await ProductService.getProductById(productId);

          // Cache the product data individually
          try {
            localStorage.setItem(
              `product_${productId}`,
              JSON.stringify({
                data: product,
                timestamp: Date.now()
              })
            );
          } catch (cacheErr) {
            console.warn(`Failed to cache product ${productId}:`, cacheErr);
          }

          return { productId, product };
        } catch (err) {
          console.error(`Failed to fetch product ${productId}:`, err);
          return { productId, product: null };
        }
      });

      const results = await Promise.all(productPromises);

      // Update state with fetched products
      setProductDetails((prev) => {
        const newProductDetails: Record<string, Product> = { ...prev };
        results.forEach(({ productId, product }) => {
          if (product) {
            newProductDetails[productId] = product;
          }
        });

        // Update aggregate localStorage cache
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              data: newProductDetails,
              timestamp: Date.now()
            })
          );
        } catch (cacheErr) {
          console.warn(`Failed to update ${cacheKey}:`, cacheErr);
        }

        // Update ref
        productDetailsRef.current = newProductDetails;

        return newProductDetails;
      });

      console.log(`Product details fetched for ${cacheKey}:`, results.length, 'products');
    } catch (err) {
      console.error('Failed to fetch product details:', err);
    } finally {
      setLoading(false);
    }
  }, [items, cacheKey, enabled]);

  // Fetch missing products when items change
  useEffect(() => {
    fetchMissingProducts();
  }, [fetchMissingProducts]);

  // Also preserve product data from items when they update
  useEffect(() => {
    if (!enabled || !items || items.length === 0) return;

    setProductDetails((prevDetails) => {
      const newDetails = { ...prevDetails };
      let hasChanges = false;

      // Preserve product data from items
      items.forEach((item) => {
        if (item.product && item.product_id) {
          // Check if we have cached product data
          try {
            const cachedData = localStorage.getItem(`product_${item.product_id}`);
            if (cachedData) {
              const parsed = JSON.parse(cachedData);
              const cacheAge = Date.now() - (parsed.timestamp || 0);
              if (cacheAge < 24 * 60 * 60 * 1000 && parsed.data) {
                if (!newDetails[item.product_id]) {
                  newDetails[item.product_id] = parsed.data;
                  hasChanges = true;
                }
                return;
              }
            }
          } catch (err) {
            // Ignore cache errors
          }

          // Use product from item if available and has image data
          if (hasProductImage(item.product) && !newDetails[item.product_id]) {
            newDetails[item.product_id] = item.product as Product;

            // Cache it
            try {
              localStorage.setItem(
                `product_${item.product_id}`,
                JSON.stringify({
                  data: item.product,
                  timestamp: Date.now()
                })
              );
            } catch (cacheErr) {
              // Ignore cache errors
            }
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        productDetailsRef.current = newDetails;
      }

      return hasChanges ? newDetails : prevDetails;
    });
  }, [items, enabled]);

  // Refresh function to manually trigger fetch
  const refresh = useCallback(() => {
    fetchMissingProducts();
  }, [fetchMissingProducts]);

  return { productDetails, loading, refresh };
};
