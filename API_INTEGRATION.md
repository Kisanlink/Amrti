# API Integration Guide

This document provides a comprehensive guide for integrating with the Amrti API endpoints for recipes and products.

## Base Configuration

- **Base URL**: `http://localhost:8082` (development) or `https://api.amrti.com` (production)
- **API Version**: `v1`
- **Content-Type**: `application/json`
- **Authentication**: Bearer token (for protected endpoints)

## Environment Variables

Set the following environment variable in your `.env` file:

```env
VITE_API_URL=http://localhost:8082
```

## Recipe APIs

### 1. Get All Recipes

**Endpoint**: `GET /api/v1/recipes`

**Parameters**:
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 10)

**Usage**:
```typescript
import RecipeService from './services/recipeService';

// Get first page with 10 recipes
const recipes = await RecipeService.getAllRecipes(1, 10);

// Get second page with 20 recipes
const recipes = await RecipeService.getAllRecipes(2, 20);
```

**Response Structure**:
```typescript
interface RecipesResponse {
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  recipes: Recipe[];
}
```

### 2. Get Recipes by Category

**Endpoint**: `GET /api/v1/recipes/category/{category}`

**Available Categories**: `Breakfast`, `Dessert`, `Superfoods`

**Usage**:
```typescript
// Get breakfast recipes
const breakfastRecipes = await RecipeService.getRecipesByCategory('Breakfast');

// Get dessert recipes with pagination
const dessertRecipes = await RecipeService.getRecipesByCategory('Dessert', 1, 5);
```

### 3. Get Recipe by ID

**Endpoint**: `GET /api/v1/recipes/{id}`

**Usage**:
```typescript
// Get recipe with ID "3"
const recipe = await RecipeService.getRecipeById('3');
```

**Response Structure**:
```typescript
interface RecipeDetailResponse {
  recipe: Recipe;
}
```

### 4. Search Recipes

**Usage**:
```typescript
// Search for recipes containing "moringa"
const searchResults = await RecipeService.searchRecipes('moringa');
```

### 5. Get Featured Recipes

**Usage**:
```typescript
// Get first 4 recipes as featured
const featuredRecipes = await RecipeService.getFeaturedRecipes();
```

## Product APIs

### 1. Get All Products

**Endpoint**: `GET /api/v1/products`

**Parameters**:
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)

**Usage**:
```typescript
import ProductService from './services/productService';

// Get first page with 20 products
const products = await ProductService.getAllProducts(1, 20);

// Get second page with 10 products
const products = await ProductService.getAllProducts(2, 10);
```

**Response Structure**:
```typescript
interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  timestamp: string;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}
```

### 2. Get Product by ID

**Endpoint**: `GET /api/v1/products/{product_id}`

**Usage**:
```typescript
// Get product with ID "PROD00000003"
const product = await ProductService.getProductById('PROD00000003');
```

**Response Structure**:
```typescript
interface ProductDetailResponse {
  success: boolean;
  message: string;
  data: Product;
  timestamp: string;
}
```

### 3. Get Products by Category

**Endpoint**: `GET /api/v1/products/category/{category}`

**Available Categories**: `Superfoods`, `Herbs`

**Usage**:
```typescript
// Get superfoods products
const superfoods = await ProductService.getProductsByCategory('Superfoods');

// Get herbs products with pagination
const herbs = await ProductService.getProductsByCategory('Herbs', 1, 10);
```

### 4. Search Products

**Endpoint**: `GET /api/v1/products/search?q={search_term}`

**Usage**:
```typescript
// Search for products containing "Ash"
const searchResults = await ProductService.searchProducts('Ash');
```

### 5. Get Featured Products

**Usage**:
```typescript
// Get first 8 products as featured
const featuredProducts = await ProductService.getFeaturedProducts();
```

## Utility Methods

### Recipe Service Utilities

```typescript
// Get available categories
const categories = RecipeService.getAvailableCategories();

// Format difficulty
const difficulty = RecipeService.formatDifficulty('Easy'); // Returns "Easy"

// Format rating
const rating = RecipeService.formatRating(4.7); // Returns "4.7"

// Get image with fallback
const image = RecipeService.getRecipeImage(recipe.image, '/fallback.jpg');
```

### Product Service Utilities

```typescript
// Get available categories
const categories = ProductService.getAvailableCategories();

// Format price
const price = ProductService.formatPrice(299); // Returns "₹299"

// Calculate discount
const discount = ProductService.calculateDiscount(399, 299); // Returns 25

// Format rating
const rating = ProductService.formatRating(4.7); // Returns "4.7"

// Check stock status
const inStock = ProductService.isInStock(50, 'In Stock'); // Returns true

// Get stock status text
const status = ProductService.getStockStatusText(5, 'In Stock'); // Returns "Low Stock"

// Sort products
const sortedProducts = ProductService.sortProducts(products, 'price', 'desc');

// Filter products
const filteredProducts = ProductService.filterProducts(products, {
  category: 'Superfoods',
  minPrice: 100,
  maxPrice: 500,
  inStock: true,
  minRating: 4.0
});
```

## Error Handling

All service methods include comprehensive error handling:

```typescript
try {
  const recipes = await RecipeService.getAllRecipes();
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    // Show user-friendly error message
  }
}
```

## Data Types

### Recipe Interface

```typescript
interface Recipe {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  recipe_id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  demo_description: string;
  prep_time: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  image: string;
  ingredients: string[];
  instructions: string[];
  nutrition_facts: Record<string, string>;
  pro_tips: string[];
}
```

### Product Interface

```typescript
interface Product {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  name: string;
  description: string;
  category: string;
  price: number;
  actual_price: number;
  discount_percent: number;
  image_url: string;
  stock: number;
  stock_status: string;
  review_count: number;
  rating: number;
  is_active: boolean;
}
```

## Example Usage in Components

### Recipes Component

```typescript
import React, { useState, useEffect } from 'react';
import RecipeService from '../services/recipeService';
import type { Recipe } from '../context/AppContext';

const RecipesComponent: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await RecipeService.getAllRecipes();
        setRecipes(response.recipes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) return <div>Loading recipes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {recipes.map(recipe => (
        <div key={recipe.id}>
          <h3>{recipe.name}</h3>
          <p>{recipe.demo_description}</p>
          <span>Rating: {RecipeService.formatRating(recipe.rating)}</span>
          <span>Difficulty: {RecipeService.formatDifficulty(recipe.difficulty)}</span>
        </div>
      ))}
    </div>
  );
};

export default RecipesComponent;
```

### Products Component

```typescript
import React, { useState, useEffect } from 'react';
import ProductService from '../services/productService';
import type { Product } from '../context/AppContext';

const ProductsComponent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getAllProducts();
        setProducts(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <span>Price: {ProductService.formatPrice(product.price)}</span>
          <span>Rating: {ProductService.formatRating(product.rating)}</span>
          <span>Stock: {ProductService.getStockStatusText(product.stock, product.stock_status)}</span>
        </div>
      ))}
    </div>
  );
};

export default ProductsComponent;
```

## Best Practices

1. **Always handle errors gracefully** - Use try-catch blocks and show user-friendly error messages
2. **Implement loading states** - Show loading indicators while API calls are in progress
3. **Use pagination** - Implement pagination for large datasets to improve performance
4. **Cache responses** - Consider implementing caching for frequently accessed data
5. **Validate inputs** - Always validate user inputs before making API calls
6. **Use TypeScript** - Leverage TypeScript for better type safety and developer experience
7. **Implement retry logic** - Consider implementing retry logic for failed API calls
8. **Monitor API usage** - Track API call performance and error rates

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend allows requests from your frontend domain
2. **Authentication Errors**: Check if your auth token is valid and not expired
3. **Rate Limiting**: Implement proper rate limiting handling
4. **Network Errors**: Implement proper network error handling and retry logic

### Debug Tips

1. Check browser network tab for failed requests
2. Verify API endpoint URLs and parameters
3. Check console for error messages
4. Validate request/response data structures
5. Test API endpoints directly (e.g., using Postman)

## Support

For API-related issues or questions, please refer to:
- Backend API documentation
- API endpoint specifications
- Error response formats
- Rate limiting policies 