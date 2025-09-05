import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Users, TrendingUp, Heart, Leaf, Award, CheckCircle, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recipe from API using sequential ID
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Use sequential ID for API call
        const response: any = await apiRequest(`/recipes/${id}`);
        console.log('Recipe API response:', response);
        
        if (response && response.recipe) {
          setRecipe(response.recipe);
        } else if (response && response.data) {
          setRecipe(response.data);
        } else {
          setError('Recipe not found');
        }
      } catch (err: any) {
        console.error('Failed to fetch recipe:', err);
        setError(err?.message || 'Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="pt-20 bg-beige-300 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !recipe) {
    return (
      <div className="pt-20 bg-beige-300 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold text-black-900 mb-4">Recipe Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The recipe you are looking for could not be found.'}</p>
          <Link to="/recipes" className="text-green-600 hover:text-green-700 font-semibold">
            ← Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-beige-300 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-beige-400 to-beige-500"></div>
        <div className="relative z-10 container-custom py-16">
          <Link to="/recipes" className="inline-flex items-center space-x-2 mb-8 text-black-700 hover:text-green-600 transition-colors duration-300">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-heading font-semibold">Back to Recipes</span>
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Recipe Image */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white p-4">
                <img 
                  src={recipe.image} 
                  alt={recipe.title || recipe.name} 
                  className="w-full h-auto object-contain" 
                  style={{ maxHeight: '500px' }}
                />
                <div className="absolute top-4 right-4 bg-green-600 text-white-50 px-3 py-1 rounded-full text-sm font-semibold">
                  {recipe.category}
                </div>
              </div>
            </div>

            {/* Recipe Info */}
            <div className="space-y-6">
              <div>
                <span className="inline-block px-4 py-2 bg-green-600 text-white-50 rounded-full text-sm font-heading font-semibold mb-4">
                  {recipe.category}
                </span>
                <h1 className="text-4xl font-heading font-bold text-black-900 mb-4">
                  {recipe.title || recipe.name}
                </h1>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(recipe.rating) ? 'text-green-500 fill-current' : 'text-black-300'}`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-black-900">{recipe.rating}</span>
                  <span className="text-black-600">({recipe.reviews} reviews)</span>
                </div>
                <p className="text-xl text-black-700 leading-relaxed">
                  {recipe.longDescription || recipe.description}
                </p>
              </div>

              {/* Recipe Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-beige-200/50 border border-beige-300/50">
                  <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-black-900">{recipe.prepTime || recipe.prep_time}</p>
                  <p className="text-sm text-black-600">Prep Time</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-beige-200/50 border border-beige-300/50">
                  <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-black-900">{recipe.servings}</p>
                  <p className="text-sm text-black-600">Servings</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-beige-200/50 border border-beige-300/50">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-black-900">{recipe.difficulty}</p>
                  <p className="text-sm text-black-600">Difficulty</p>
                </div>
              </div>

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recipe Details */}
      <section className="py-16 bg-gradient-to-br from-beige-400 to-beige-500">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="space-y-6">
                <div className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 rounded-lg bg-green-600">
                      <Leaf className="w-6 h-6 text-white-50" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-black-900">Ingredients</h2>
                  </div>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-black-700 leading-relaxed">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Instructions */}
            {recipe.instructions && recipe.instructions.length > 0 && (
              <div className="space-y-6">
                <div className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 rounded-lg bg-green-600">
                      <Award className="w-6 h-6 text-white-50" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-black-900">Instructions</h2>
                  </div>
                  <div className="space-y-4">
                    {recipe.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white-50 flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-black-700 leading-relaxed">{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nutrition & Tips */}
          {(recipe.nutrition || recipe.nutrition_facts || recipe.tips || recipe.pro_tips) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {/* Nutrition Facts */}
              {(recipe.nutrition || recipe.nutrition_facts) && (
                <div className="p-6 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
                  <h3 className="text-xl font-heading font-bold text-black-900 mb-4">Nutrition Facts</h3>
                  <div className="space-y-3">
                    {Object.entries(recipe.nutrition || recipe.nutrition_facts || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-black-700">{key}</span>
                        <span className="font-semibold text-black-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Tips */}
              {(recipe.tips || recipe.pro_tips) && (
                <div className="p-6 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
                  <h3 className="text-xl font-heading font-bold text-black-900 mb-4">Pro Tips</h3>
                  <ul className="space-y-3">
                    {(recipe.tips || recipe.pro_tips || []).map((tip, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-green-600 mt-2.5 flex-shrink-0"></div>
                        <span className="text-black-700 leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default RecipeDetail;
