import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Users, TrendingUp, Heart, Leaf, Award, Truck, Shield, RotateCcw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RecipeService from '../services/recipeService';
import type { Recipe } from '../context/AppContext';

// Fallback static moringa recipes data for when API fails
const fallbackMoringaRecipes: Recipe[] = [
  {
    id: 'moringa-smoothie',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
    updated_by: 'system',
    recipe_id: 'moringa-smoothie',
    name: 'Moringa Green Smoothie',
    category: 'Superfoods',
    rating: 4.9,
    reviews: 892,
    description: 'A refreshing and nutritious smoothie packed with moringa powder, spinach, and tropical fruits. Perfect for a healthy breakfast or post-workout boost.',
    demo_description: 'A refreshing and nutritious smoothie packed with moringa powder, spinach, and tropical fruits.',
    prep_time: '5 min',
    servings: 2,
    difficulty: 'Easy',
    image: '/Recipes/moringa smoothie.jpg',
    ingredients: [],
    instructions: [],
    nutrition_facts: {},
    pro_tips: []
  },
  {
    id: 'moringa-tea',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
    updated_by: 'system',
    recipe_id: 'moringa-tea',
    name: 'Moringa Herbal Tea',
    category: 'Superfoods',
    rating: 4.7,
    reviews: 567,
    description: 'A soothing and antioxidant-rich tea made with fresh moringa leaves and warming spices. Perfect for relaxation and wellness.',
    demo_description: 'A soothing and antioxidant-rich tea made with fresh moringa leaves and warming spices.',
    prep_time: '10 min',
    servings: 4,
    difficulty: 'Easy',
    image: '/Recipes/tea moringa.jpg',
    ingredients: [],
    instructions: [],
    nutrition_facts: {},
    pro_tips: []
  },
  {
    id: 'moringa-dessert',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
    updated_by: 'system',
    recipe_id: 'moringa-dessert',
    name: 'Moringa Energy Balls',
    category: 'Dessert',
    rating: 4.8,
    reviews: 734,
    description: 'Delicious and nutritious energy balls made with moringa powder, dates, and nuts. A perfect healthy snack for any time of day.',
    demo_description: 'Delicious and nutritious energy balls made with moringa powder, dates, and nuts.',
    prep_time: '20 min',
    servings: 12,
    difficulty: 'Easy',
    image: '/Recipes/moringa dessert.jpg',
    ingredients: [],
    instructions: [],
    nutrition_facts: {},
    pro_tips: []
  },
  {
    id: 'moringa-dosa',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
    updated_by: 'system',
    recipe_id: 'moringa-dosa',
    name: 'Moringa Dosa',
    category: 'Breakfast',
    rating: 4.6,
    reviews: 456,
    description: 'A traditional South Indian dosa enhanced with moringa powder for extra nutrition. Crispy, delicious, and packed with health benefits.',
    demo_description: 'A traditional South Indian dosa enhanced with moringa powder for extra nutrition.',
    prep_time: '8 hours (including soaking)',
    servings: 6,
    difficulty: 'Medium',
    image: '/Recipes/dosa moringa.jpg',
    ingredients: [],
    instructions: [],
    nutrition_facts: {},
    pro_tips: []
  }
];

const Recipes = () => {
  const { id } = useParams();
  const [selectedCategory, setSelectedCategory] = useState('All Recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        if (selectedCategory === 'All Recipes') {
          response = await RecipeService.getAllRecipes(1, 50);
        } else {
          response = await RecipeService.getRecipesByCategory(selectedCategory, 1, 50);
        }
        setRecipes(response.recipes);
      } catch (err: any) {
        console.error('Failed to load recipes from API:', err);
        setError(err.message || 'Failed to load recipes from server');
        // Fallback to static recipes on error
        setRecipes(fallbackMoringaRecipes);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };


  const categories = [
    { name: 'All Recipes', count: recipes?.length || 0 },
    { name: 'Breakfast', count: recipes?.filter(r => r.category === 'Breakfast').length || 0 },
    { name: 'Dessert', count: recipes?.filter(r => r.category === 'Dessert').length || 0 },
    { name: 'Superfoods', count: recipes?.filter(r => r.category === 'Superfoods').length || 0 }
  ];

  const filteredRecipes = selectedCategory === 'All Recipes' 
    ? recipes || []
    : (recipes || []).filter(recipe => recipe.category === selectedCategory);

  // Show loading state
  if (loading) {
    return (
      <div className="pt-16 sm:pt-20 bg-beige-300 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-black-700">Loading recipes...</p>
        </div>
      </div>
    );
  }

  // Show error state only if we have no recipes at all
  if (error && recipes.length === 0) {
    return (
      <div className="pt-16 sm:pt-20 bg-beige-300 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-black-900 mb-2">Error Loading Recipes</h2>
          <p className="text-black-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 sm:pt-20 bg-beige-300">
      {/* API Error Notification */}
      {error && recipes.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Showing sample recipes. Unable to load latest recipes from server.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-beige-400 via-beige-300 to-beige-500">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4 sm:mb-6"
            >
              <div className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-beige-500/80 rounded-full border border-green-200">
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="font-heading font-semibold text-green-700 tracking-wide text-sm sm:text-base">Healthy Recipes</span>
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold mb-4 sm:mb-6 text-black-900">
              Delicious{' '}
              <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Moringa Recipes
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-black-700 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Discover amazing recipes that showcase the incredible benefits of moringa. 
              From smoothies to desserts, these recipes are both nutritious and delicious.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Recipe Categories */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black-900 mb-3 sm:mb-4">
              Recipe Categories
            </h2>
            <p className="text-base sm:text-lg text-black-700 px-4 sm:px-0">
              Explore our collection of moringa recipes by category
            </p>
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 px-4 sm:px-0">
            {categories.map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full font-heading font-semibold transition-all duration-300 text-sm sm:text-base ${
                  selectedCategory === category.name
                    ? 'bg-green-600 text-white-50 shadow-lg'
                    : 'bg-beige-300/80 text-black-700 hover:bg-green-600 hover:text-white-50'
                }`}
              >
                {category.name} ({category.count})
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="section-padding bg-gradient-to-br from-beige-400 to-beige-500">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold text-black-900 mb-6">
              Featured <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Recipes</span>
            </h2>
            <p className="text-xl text-black-700 max-w-3xl mx-auto">
              Our most popular moringa recipes loved by thousands
            </p>
          </motion.div>

          {/* Featured Recipe Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {filteredRecipes && filteredRecipes.length > 0 ? (
              filteredRecipes.slice(0, 3).map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white backdrop-blur-sm border border-beige-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <div className="relative overflow-hidden flex-shrink-0">
                    <img
                      src={recipe.image}
                        alt={recipe.name}
                      className="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-500"
                      style={{ maxHeight: '300px' }}
                    />
                    <div className="absolute top-4 right-4 bg-green-600 text-white-50 px-3 py-1 rounded-full text-sm font-semibold">
                      {recipe.category}
                    </div>
                  </div>
                  
                  <div className="relative p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-heading font-bold text-black-900 mb-3 group-hover:text-green-700 transition-colors duration-300">
                        {recipe.name}
                    </h3>
                    <p className="text-black-700 mb-4 leading-relaxed flex-grow">
                      {recipe.description}
                    </p>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(recipe.rating) ? 'text-green-500 fill-current' : 'text-black-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-black-600">({recipe.reviews} reviews)</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <Clock className="w-5 h-5 text-green-600 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-black-900">{recipe.prep_time}</p>
                        <p className="text-xs text-black-600">Prep Time</p>
                      </div>
                      <div className="text-center">
                        <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-black-900">{recipe.servings}</p>
                        <p className="text-xs text-black-600">Servings</p>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-black-900">{recipe.difficulty}</p>
                        <p className="text-xs text-black-600">Difficulty</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        to={`/recipes/${recipe.id}`}
                        className="flex-1 bg-green-600 text-white-50 font-heading font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                      >
                        <Leaf className="w-4 h-4" />
                        <span>View Recipe</span>
                      </Link>
                      <button className="p-3 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white-50 rounded-lg transition-colors duration-300">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-black-700">No recipes found.</p>
              </div>
            )}
          </div>

          {/* All Recipes Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-heading font-bold text-black-900 mb-8 text-center">
              All Moringa Recipes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer"
                >
                  <div className="overflow-hidden rounded-xl bg-white backdrop-blur-sm border border-beige-400/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="relative overflow-hidden flex-shrink-0">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                        style={{ maxHeight: '200px' }}
                      />
                      <div className="absolute top-3 right-3 bg-beige-300/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-black-700">
                        {recipe.category}
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-heading font-semibold text-black-900 mb-2 group-hover:text-green-700 transition-colors duration-300">
                        {recipe.name}
                      </h3>
                      <p className="text-black-700 text-sm mb-3 leading-relaxed flex-grow">
                        {recipe.description}
                      </p>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(recipe.rating) ? 'text-green-500 fill-current' : 'text-black-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-black-600">({recipe.reviews})</span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-black-600">{recipe.prep_time}</span>
                        </div>
                        <span className="text-xs text-black-600">{recipe.difficulty}</span>
                      </div>

                      <Link
                        to={`/recipes/${recipe.id}`}
                        className="inline-flex items-center font-heading font-semibold text-green-600 hover:text-green-700 transition-colors duration-300 group-hover:translate-x-1 text-sm mt-auto"
                      >
                        View Recipe
                        <motion.span
                          className="ml-1"
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="p-12 rounded-3xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-2xl">
              <div className="max-w-2xl mx-auto">
                <div className="p-4 rounded-full bg-green-600 w-fit mx-auto mb-6">
                  <Award className="w-8 h-8 text-white-50" />
                </div>
                <h3 className="text-3xl font-heading font-bold text-black-900 mb-4">
                  Why Try Our Recipes?
                </h3>
                <p className="text-lg text-black-700 mb-8">
                  Our recipes are carefully crafted to maximize the benefits of moringa while creating delicious, 
                  easy-to-make dishes that everyone will love.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <Leaf className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-black-900">Nutritious</p>
                      <p className="text-sm text-black-600">Packed with nutrients</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-black-900">Quick & Easy</p>
                      <p className="text-sm text-black-600">Simple preparation</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Heart className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-black-900">Delicious</p>
                      <p className="text-sm text-black-600">Great taste</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-black-900">Healthy</p>
                      <p className="text-sm text-black-600">Good for you</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Recipes; 