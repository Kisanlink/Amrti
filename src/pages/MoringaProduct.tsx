import { motion } from 'framer-motion';
import { ArrowLeft, Play, Leaf, Users, Award, FileText, Youtube, Clock, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ScrollToTop from '../components/ui/ScrollToTop';
import { useNotification } from '../context/NotificationContext';
import { addToCart } from '../services/cartService';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../services/wishlistService';

const MoringaProduct = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('benefits');

  const product = {
    id: 'moringa-powder',
    name: 'Moringa Powder',
    description: 'Nutrient-rich moringa powder packed with vitamins, minerals, and antioxidants for overall wellness',
    price: 299,
    originalPrice: 399,
    image: '/products/pouch front mockup.jpg',
    category: 'Natural Powders',
    rating: 4.8,
    reviews: 156,
    inStock: true
  };

  const currentVariant = { size: '100g', price: product.price, originalPrice: product.originalPrice };
  const discount = Math.round(((currentVariant.originalPrice - currentVariant.price) / currentVariant.originalPrice) * 100);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    try {
      addToCart(product.id, quantity, product);
      showNotification({
        type: 'success',
        message: `${product.name} added to cart successfully!`
      });
    } catch (err) {
      showNotification({
        type: 'error',
        message: 'Failed to add item to cart'
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    setIsUpdatingWishlist(true);
    try {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
        showNotification({
          type: 'success',
          message: `${product.name} removed from wishlist`
        });
      } else {
        addToWishlist(product.id, product);
        showNotification({
          type: 'success',
          message: `${product.name} added to wishlist successfully!`
        });
      }
    } catch (err) {
      showNotification({
        type: 'error',
        message: 'Failed to update wishlist'
      });
    } finally {
      setIsUpdatingWishlist(false);
    }
  };

  const tabs = [
    { id: 'benefits', label: 'Benefits', icon: Leaf },
    { id: 'recipes', label: 'Recipes', icon: FileText },
    { id: 'traceability', label: 'Traceability', icon: Users },
    { id: 'quality', label: 'Quality', icon: Award }
  ];



  return (
    <>
      <ScrollToTop />
      <div className="pt-16 sm:pt-20 bg-beige-300 min-h-screen">
      {/* Hero Section */}


      {/* Tab Navigation */}
      <section className="py-8 bg-beige-400">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full font-heading font-semibold transition-all duration-300 text-xs sm:text-sm md:text-base ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-white-50 shadow-lg'
                      : 'bg-beige-300/80 text-black-700 hover:bg-green-600 hover:text-white-50'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-beige-400 to-beige-500">
        <div className="container-custom">
          {activeTab === 'benefits' && <BenefitsContent />}
          {activeTab === 'recipes' && <RecipesContent />}
          {activeTab === 'traceability' && <TraceabilityContent />}
          {activeTab === 'quality' && <QualityContent />}
        </div>
      </section>

      {/* Our Products Section */}
      <section className="py-12 sm:py-16 bg-beige-200">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-black-900 mb-4">
              Our <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Products</span>
            </h2>
            <p className="text-lg text-black-700 max-w-2xl mx-auto">
              Discover our complete range of premium natural products
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Moringa Powder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">
  
                <img 
                  src="/products/pouch front mockup.jpg" 
                  alt="Moringa Powder" 
                  className="w-full h-auto object-contain max-h-[200px] sm:max-h-[250px] md:max-h-[300px] min-h-[150px] sm:min-h-[180px] md:min-h-[200px]" 
                />
                <h3 className="text-xl font-heading font-bold text-black-900 mb-2">Moringa Powder</h3>
                <p className="text-black-700 mb-4">Nutrient-rich powder packed with vitamins and antioxidants</p>
                <Link 
                  to="/product/moringa/101"
                  className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold transition-colors"
                >
                  <span>View Details</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </motion.div>

            {/* Amla Powder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">

                <img 
                  src="/products/amla bg.png" 
                  alt="Amla Powder" 
                  className="w-full h-auto object-contain max-h-[200px] sm:max-h-[250px] md:max-h-[300px] min-h-[150px] sm:min-h-[180px] md:min-h-[200px]" 
                />
                <h3 className="text-xl font-heading font-bold text-black-900 mb-2">Amla Powder</h3>
                <p className="text-black-700 mb-4">Rich in Vitamin C and natural antioxidants</p>
                <Link 
                  to="/products"
                  className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold transition-colors"
                >
                  <span>View Details</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </motion.div>

            {/* Kombucha */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">
       
                <img 
                  src="/products/aswagandha bg.png" 
                  alt="Kombucha" 
                  className="w-full h-auto object-contain max-h-[200px] sm:max-h-[250px] md:max-h-[300px] min-h-[150px] sm:min-h-[180px] md:min-h-[200px]" 
                />
                <h3 className="text-xl font-heading font-bold text-black-900 mb-2">Ashwagandha Powder</h3>
                <p className="text-black-700 mb-4">Rich in antioxidants and natural compounds</p>
                <Link 
                  to="/products"
                  className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold transition-colors"
                >
                  <span>View Details</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-8 sm:mt-12"
          >
            <Link 
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>View All Products</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  );
};

// Benefits Content Component
const BenefitsContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-black-900 mb-4">
          Moringa <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Benefits</span>
        </h2>
        <p className="text-lg text-black-700">
          Discover the incredible health benefits of our premium Moringa powder
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-heading font-bold text-black-900">Rich in Nutrients</h3>
          </div>
          <p className="text-black-700 leading-relaxed">
            Moringa is packed with essential vitamins and minerals including Vitamin C, Vitamin A, 
            calcium, potassium, and iron. It contains all 9 essential amino acids making it a complete protein source.
          </p>
        </div>

        <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-heading font-bold text-black-900">Antioxidant Powerhouse</h3>
          </div>
          <p className="text-black-700 leading-relaxed">
            High in antioxidants like quercetin and chlorogenic acid, Moringa helps fight free radicals 
            and oxidative stress, supporting overall cellular health and anti-aging benefits.
          </p>
        </div>

        <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-heading font-bold text-black-900">Immune Support</h3>
          </div>
          <p className="text-black-700 leading-relaxed">
            Boosts immune system function with its high Vitamin C content and natural compounds 
            that help strengthen the body's natural defense mechanisms.
          </p>
        </div>

        <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-heading font-bold text-black-900">Energy & Vitality</h3>
          </div>
          <p className="text-black-700 leading-relaxed">
            Natural energy booster that helps combat fatigue and provides sustained energy 
            throughout the day without the crash associated with caffeine.
          </p>
        </div>
      </div>

      {/* YouTube Video Section */}
      <div className="mt-12 text-center">
        <h3 className="text-2xl font-heading font-bold text-black-900 mb-6">
          Learn More About Moringa Benefits
        </h3>
        <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto">
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Youtube className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <p className="text-black-700">Video content coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Recipes Content Component
const RecipesContent = () => {
  const recipes = [
    {
      category: 'Easy to use',
      title: 'Moringa Lemon Water',
      ingredients: [
        '1 glass of hot water',
        'juice of half a lemon',
        '1 tsp Amrti\'s Moringa powder'
      ],
      instructions: [
        'Add the lemon juice and Moringa powder to a mug.',
        'Pour over hot water and stir until combined.',
        'Enjoy!'
      ]
    },
    {
      category: 'Beverages',
      title: 'Moringa Iced Tea',
      ingredients: [
        'Amrit\'s Moringa powder',
        'Warm water',
        'Lemon slices',
        'Ginger',
        'Honey'
      ],
      instructions: [
        'Mix Amrti\'s moringa powder with warm water and let it steep for flavour.',
        'Add lemon slices and ginger halfway through steeping.',
        'Sweeten with honey.',
        'Pour over ice cubes and garnish with a lemon slice and mint leaves.',
        'Enjoy it!'
      ]
    },
    {
      category: 'Beverages',
      title: 'Moringa Tea',
      ingredients: [
        'Amrit\'s Moringa Powder',
        'Lemon',
        'Honey'
      ],
      instructions: [
        'Heat water until warm (not boiling).',
        'Add Amrti\'s moringa powder and steep for desired strength.',
        'Strain tea, add lemon slices, and sweeten with honey to taste.'
      ]
    },
    {
      category: 'Blends and smoothies',
      title: 'Moringa leaf Almond Smoothie',
      ingredients: [
        '50 grams dry moringa leaves or Amrti\'s moringa powder',
        '250 ml soya milk',
        '10 soaked almonds',
        '10 ml honey'
      ],
      instructions: [
        'Soak the moringa leaves in water for 15 minutes.',
        'Blend all ingredients well in an electric blender.',
        'Serve cold.'
      ]
    },
    {
      category: 'Blends and smoothies',
      title: 'Moringa Leaf Banana Smoothie',
      ingredients: [
        '50g dry Amrti\'s moringa powder',
        '1 banana, peeled and chopped',
        '1 cup milk (dairy or plant-based)',
        '2 teaspoons honey'
      ],
      instructions: [
        'Blend moringa powder, chopped banana, milk, and honey together until smooth.',
        'Serve cold.'
      ]
    },
    {
      category: 'Food recipes',
      title: 'Moringa Avocado Toast',
      ingredients: [
        '2 slices of bread (your choice), toasted',
        '1/2 avocado',
        '1/2-1 teaspoon Amrti\'s moringa powder',
        'Squeeze of lemon juice',
        'Pinch of salt',
        'Pinch of black pepper',
        'Pinch of chilli flakes (optional)',
        '1 teaspoon nutritional yeast (optional)'
      ],
      instructions: [
        'In a bowl, mash the avocado with Amrti\'s moringa powder, lemon juice, salt, and pepper.',
        'Spread the avocado mixture evenly on the toasted bread slices.',
        'Sprinkle with chilli flakes and nutritional yeast, if desired.',
        'Enjoy your nutritious and flavorful Moringa Avocado Toast!'
      ]
    },
    {
      category: 'Food recipes',
      title: 'Moringa Uttapam',
      ingredients: [
        'Batter: 1/2 cup semolina (sooji), 1/4 cup oats powder, 1/4 cup rice flour, 1/2 cup curd, Salt, 1/2 tbsp lemon juice, 2 tsp Amrti\'s moringa powder, 1 tbsp coconut crush',
        'Topping: 2 tbsp each finely chopped onion, tomato, capsicum, 1 chopped green chilli, 2 tbsp chopped green coriander, 1 tbsp grated cheese, 1 tsp oil for frying'
      ],
      instructions: [
        'Mix batter ingredients to make a dosa-like consistency. Rest for 15-20 mins.',
        'Heat a nonstick pan, pour batter, sprinkle oil, add veggies, and cover to steam.',
        'Flip, cook for 2 mins, then add cheese. Cover until melted.',
        'Serve hot with chutney.'
      ]
    },
    {
      category: 'Food recipes',
      title: 'Moringa Leaf Chutney Rice',
      ingredients: [
        '100g Amrti\'s moringa powder',
        '50ml coconut oil',
        '10g roasted chana dal',
        '10g ginger',
        '20g shallots',
        '10g curry leaves',
        '5g dry red chilli',
        '20g grated coconut',
        '100g basmati rice',
        '2g mustard seeds',
        'Salt and black pepper to taste'
      ],
      instructions: [
        'Boil rice and let it cool.',
        'Grind Amrti\'s moringa powder, shallots, ginger, grated coconut, half the curry leaves, and salt into a paste.',
        'Heat coconut oil in a pan. Add mustard seeds, red chilli, and remaining curry leaves, and let them crackle.',
        'Add the ground chutney paste and sauté well.',
        'Mix in the boiled rice and season with salt and black pepper.'
      ]
    }
  ];

  const categories = [...new Set(recipes.map(recipe => recipe.category))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-black-900 mb-4">
          Moringa <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Recipes</span>
        </h2>
        <p className="text-lg text-black-700">
          Discover delicious and nutritious ways to incorporate Moringa into your daily routine
        </p>
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-12">
          <h3 className="text-2xl font-heading font-bold text-black-900 mb-6 text-center">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes
              .filter(recipe => recipe.category === category)
              .map((recipe, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-6 shadow-xl"
                >
                  <h4 className="text-lg font-heading font-bold text-black-900 mb-4">
                    {recipe.title}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-black-900 mb-2">Ingredients:</h5>
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ingredient, idx) => (
                          <li key={idx} className="text-sm text-black-700 flex items-start">
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-black-900 mb-2">Instructions:</h5>
                      <ol className="space-y-1">
                        {recipe.instructions.map((instruction, idx) => (
                          <li key={idx} className="text-sm text-black-700 flex items-start">
                            <span className="w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                              {idx + 1}
                            </span>
                            {instruction}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

// Traceability Content Component
const TraceabilityContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-black-900 mb-4">
          Farm <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Traceability</span>
        </h2>
        <p className="text-lg text-black-700">
          Know exactly where your Moringa comes from - from farm to your table
        </p>
      </div>

      <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="text-2xl font-heading font-bold text-black-900 mb-6">
              Farmer Details
            </h3>
            
            {/* Farmer Image */}
            <div className="mb-6">
              <img 
                src="/farmer.jpg" 
                alt="Farmer Ramana Rao Verdeneni" 
                className="w-full h-auto max-h-80 object-contain rounded-lg shadow-lg"
              />
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-beige-400">
                <span className="font-semibold text-black-900 text-sm sm:text-base">Farmer Name:</span>
                <span className="text-black-700 text-sm sm:text-base">Ramana Rao Verdeneni</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-beige-400">
                <span className="font-semibold text-black-900 text-sm sm:text-base">Village:</span>
                <span className="text-black-700 text-sm sm:text-base">Domakonda, Telangana</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-beige-400">
                <span className="font-semibold text-black-900 text-sm sm:text-base">Area:</span>
                <span className="text-black-700 text-sm sm:text-base">5 Acre</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-heading font-bold text-black-900 mb-6">
              Growing Timeline
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-beige-400">
                <span className="font-semibold text-black-900 text-sm sm:text-base">Sowing Date:</span>
                <span className="text-black-700 text-sm sm:text-base">4th December 2025</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-beige-400">
                <span className="font-semibold text-black-900 text-sm sm:text-base">Processing Date:</span>
                <span className="text-black-700 text-sm sm:text-base">21st June 2025</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-black-900 mb-4 sm:mb-6">
            Fertigation Schedule
          </h3>
          <div className="bg-white rounded-lg p-4 sm:p-6">
            <p className="text-black-700 text-center text-sm sm:text-base">
              Detailed fertigation schedule information will be displayed here
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Quality Content Component
const QualityContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-black-900 mb-4">
          Quality <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Report</span>
        </h2>
        <p className="text-lg text-black-700">
          View our comprehensive quality testing and certification reports
        </p>
      </div>

                 <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
         <div className="text-center mb-4 sm:mb-6">
           <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-3 sm:mb-4" />
           <h3 className="text-lg sm:text-xl font-heading font-bold text-black-900 mb-3 sm:mb-4">
             Test Report
           </h3>
           <p className="text-black-700 mb-4 sm:mb-6 text-sm sm:text-base">
             View our comprehensive quality testing report
           </p>
         </div>
        
        {/* PDF Viewer */}
        <div className="w-full h-80 sm:h-96 md:h-[500px] lg:h-[600px] bg-white rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="/Test_report.pdf"
            className="w-full h-full"
            title="Test Report PDF"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MoringaProduct; 