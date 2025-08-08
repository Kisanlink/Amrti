import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Users, TrendingUp, Heart, Leaf, Award, CheckCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const RecipeDetail = () => {
  const { id } = useParams();

  const recipes = {
    'moringa-smoothie': {
      title: 'Moringa Smoothie',
      category: 'Beverages',
      description: 'This vibrant green smoothie combines the superfood power of moringa with fresh fruits for a delicious and nutritious energy boost. Perfect for breakfast or post-workout recovery.',
      longDescription: 'Start your day with this nutrient-packed smoothie that combines the incredible benefits of moringa with fresh fruits. This recipe is perfect for those looking to boost their energy levels naturally while enjoying a delicious and refreshing drink.',
      image: '/Recipes/moringa smoothie.jpg',
      prepTime: '5 mins',
      servings: 1,
      difficulty: 'Easy',
      rating: 4.7,
      reviews: 89,
      tags: ['Energy', 'Recovery', 'Breakfast', 'Superfood'],
      ingredients: [
        '1 tsp Moringa Powder',
        '1 banana',
        '1 cup spinach',
        '1/2 cup frozen mango',
        '1 cup almond milk',
        '1 tbsp honey (optional)',
        'Ice cubes'
      ],
      instructions: [
        'Add all ingredients to a high-speed blender',
        'Blend until smooth and creamy',
        'Add more almond milk if too thick',
        'Serve immediately for best taste'
      ],
      nutrition: {
        'Calories': '180 kcal',
        'Protein': '8g',
        'Fiber': '6g',
        'Vitamin C': '45mg'
      },
      tips: [
        'Use frozen banana for a creamier texture',
        'Add chia seeds for extra protein',
        'Substitute with coconut milk for tropical flavor'
      ]
    },
    'moringa-tea': {
      title: 'Moringa Tea',
      category: 'Beverages',
      description: 'A soothing and nutritious tea made with fresh moringa leaves or powder. This traditional drink offers numerous health benefits and is perfect for any time of day.',
      longDescription: 'Moringa tea is a traditional beverage that has been consumed for centuries for its medicinal properties. This simple yet powerful drink can be enjoyed hot or cold and provides a natural energy boost without caffeine.',
      image: '/Recipes/tea moringa.jpg',
      prepTime: '3 mins',
      servings: 1,
      difficulty: 'Easy',
      rating: 4.8,
      reviews: 156,
      tags: ['Wellness', 'Immunity', 'Detox', 'Traditional'],
      ingredients: [
        '1 tsp Moringa Powder',
        '1 cup hot water',
        '1 tsp honey (optional)',
        '1/2 lemon slice (optional)',
        '1/4 tsp ginger powder (optional)'
      ],
      instructions: [
        'Boil water to 80-90°C (not boiling)',
        'Add moringa powder to a tea infuser or strainer',
        'Pour hot water over the powder',
        'Let steep for 3-5 minutes',
        'Add honey and lemon if desired',
        'Strain and serve hot'
      ],
      nutrition: {
        'Calories': '15 kcal',
        'Antioxidants': 'High',
        'Vitamin C': '25mg',
        'Iron': '2mg'
      },
      tips: [
        'Don\'t use boiling water as it can destroy nutrients',
        'Steep longer for stronger flavor',
        'Add mint leaves for refreshing taste'
      ]
    },
    'moringa-dessert': {
      title: 'MoringaDesert',
      category: 'Desserts',
      description: 'Nutritious and delicious energy balls made with moringa powder, dates, and nuts. Perfect as a healthy snack or post-workout treat.',
      longDescription: 'These energy balls are a perfect combination of taste and nutrition. Packed with natural ingredients and the superfood power of moringa, they make an ideal healthy snack that will keep you energized throughout the day.',
      image: '/Recipes/moringa dessert.jpg',
      prepTime: '15 mins',
      servings: 12,
      difficulty: 'Easy',
      rating: 4.6,
      reviews: 78,
      tags: ['Snack', 'Energy', 'Healthy', 'No-Bake'],
      ingredients: [
        '1 cup dates, pitted',
        '1/2 cup almonds',
        '1/4 cup walnuts',
        '2 tbsp Moringa Powder',
        '2 tbsp chia seeds',
        '1 tbsp honey',
        '1/2 tsp vanilla extract',
        'Pinch of salt'
      ],
      instructions: [
        'Soak dates in warm water for 10 minutes',
        'Process almonds and walnuts in food processor',
        'Add soaked dates and blend until sticky',
        'Add moringa powder, chia seeds, and honey',
        'Mix until well combined',
        'Roll into 12 small balls',
        'Refrigerate for 30 minutes before serving'
      ],
      nutrition: {
        'Calories': '120 kcal',
        'Protein': '4g',
        'Fiber': '3g',
        'Healthy Fats': '6g'
      },
      tips: [
        'Store in refrigerator for up to 1 week',
        'Roll in coconut flakes for extra flavor',
        'Add dark chocolate chips for indulgence'
      ]
    }
  };

  const recipe = recipes[id as keyof typeof recipes];

  if (!recipe) {
    return (
      <div className="pt-20 bg-beige-300 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold text-black-900 mb-4">Recipe Not Found</h1>
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
                  alt={recipe.title} 
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
                  {recipe.title}
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
                  {recipe.longDescription}
                </p>
              </div>

              {/* Recipe Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-beige-200/50 border border-beige-300/50">
                  <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-black-900">{recipe.prepTime}</p>
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
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recipe Details */}
      <section className="py-16 bg-gradient-to-br from-beige-400 to-beige-500">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Ingredients */}
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

            {/* Instructions */}
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
          </div>

          {/* Nutrition & Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="p-6 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
              <h3 className="text-xl font-heading font-bold text-black-900 mb-4">Nutrition Facts</h3>
              <div className="space-y-3">
                {Object.entries(recipe.nutrition).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-black-700">{key}</span>
                    <span className="font-semibold text-black-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
              <h3 className="text-xl font-heading font-bold text-black-900 mb-4">Pro Tips</h3>
              <ul className="space-y-3">
                {recipe.tips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2.5 flex-shrink-0"></div>
                    <span className="text-black-700 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RecipeDetail; 