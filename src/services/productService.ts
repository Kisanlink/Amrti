export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
}

// Static product data
export const products: Product[] = [
  {
    id: 'moringa-powder',
    name: 'Moringa Powder',
    description: 'Nutrient-rich moringa powder packed with vitamins, minerals, and antioxidants for overall wellness',
    price: 299,
    originalPrice: 399,
    image: '/products/pouch front mockup.jpg',
    category: 'Natural Powders',
    rating: 4.8,
    reviews: 156,
    inStock: true,
    featured: true
  },
  {
    id: 'amla-powder',
    name: 'Amla Powder',
    description: 'Vitamin C-rich amla powder for immunity and skin health',
    price: 349,
    originalPrice: 449,
    image: '/products/amla bg.png',
    category: 'Natural Powders',
    rating: 4.7,
    reviews: 134,
    inStock: true,
    featured: true
  },
  {
    id: 'ashwagandha-powder',
    name: 'Ashwagandha Powder',
    description: 'Adaptogenic herb for stress relief and energy boost',
    price: 399,
    originalPrice: 499,
    image: '/products/aswagandha bg.png',
    category: 'Natural Powders',
    rating: 4.9,
    reviews: 189,
    inStock: true,
    featured: true
  },
  {
    id: 'papaya-powder',
    name: 'Papaya Powder',
    description: 'Digestive enzyme-rich papaya powder for gut health',
    price: 279,
    originalPrice: 359,
    image: '/products/papaya bg.png',
    category: 'Natural Powders',
    rating: 4.6,
    reviews: 98,
    inStock: true,
    featured: false
  }
];

// Get all products
export const getAllProducts = (): Product[] => {
  return products;
};

// Get featured products
export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

// Get product by ID
export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

// Get products by category
export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

// Get product categories
export const getProductCategories = () => {
  const categories = ['All Products', 'Natural Powders', 'Kombucha', 'Wellness Drinks'];
  return categories.map(category => ({
    name: category,
    count: category === 'All Products' 
      ? products.length 
      : products.filter(p => p.category === category).length
  }));
};

// Search products
export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery)
  );
}; 