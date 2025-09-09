import { motion } from 'framer-motion';
import { ArrowLeft, Play, Leaf, Users, Award, FileText, Youtube, Clock, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ScrollToTop from '../components/ui/ScrollToTop';
import { useNotification } from '../context/NotificationContext';
import CartService from '../services/cartService';
import WishlistService from '../services/wishlistService';

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
      CartService.addItem(product.id, quantity);
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
      if (WishlistService.isInWishlist(product.id)) {
        WishlistService.removeFromWishlist(product.id);
        showNotification({
          type: 'success',
          message: `${product.name} removed from wishlist`
        });
      } else {
        WishlistService.addToWishlist(product.id);
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

      {/* Moringa Benefits Video Section */}
      <div className="mt-12 text-center">
        <h3 className="text-2xl font-heading font-bold text-black-900 mb-6">
          Learn More About Moringa Benefits
        </h3>
        <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-6 shadow-xl max-w-sm mx-auto">
          <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
            <video 
              className="w-full h-full object-cover"
              controls
              preload="metadata"
              poster="/products/pouch front mockup.jpg"
            >
              <source src="/moringa powder benefit.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-black-700 mt-4 text-sm">
            Watch this informative video to learn more about the incredible benefits of Moringa powder
          </p>
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
      image: '/Recipes/tea moringa.jpg',
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
      image: '/Recipes/tea moringa.jpg',
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
      image: '/Recipes/tea moringa.jpg',
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
      image: '/Recipes/moringa smoothie.jpg',
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
      image: '/Recipes/moringa smoothie.jpg',
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
      image: '/Recipes/dosa moringa.jpg',
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
      image: '/Recipes/dosa moringa.jpg',
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
      image: '/Recipes/moringa dessert.jpg',
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
                  {/* Recipe Image */}
                  <div className="mb-4">
                    <img 
                      src={recipe.image} 
                      alt={recipe.title}
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                  </div>
                  
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
  const [selectedReport, setSelectedReport] = useState(0);
  
  const labReports = [
    {
      id: 'batch-101',
      batchNumber: '101',
      reportNumber: '001:NL:24:06:03871 R',
      issueDate: '26-Jun-2024',
      reference: 'EQNX:001:NL:24:06:03871/A R',
      sample: 'Moringa Powder',
      manufacturingDate: '01-Jun-2024',
      lab: 'EQUINOX LABS',
      status: 'Passed',
      parameters: [
        { name: 'Energy', value: '374.74', unit: 'Kcal/100g', method: 'SOP-CHM-29-00' },
        { name: 'Carbohydrate', value: '49.25', unit: 'g/100g', method: 'SOP-CHM-28-00' },
        { name: 'Protein', value: '23.60', unit: 'g/100g', method: 'SOP-CHM-90-01' },
        { name: 'Added Sugar', value: '<1.0', unit: 'g/100g', method: 'SOP-CHM-139-00' },
        { name: 'Total Sugar', value: '<2.0', unit: 'g/100g', method: 'SOP-CHM-123-00' },
        { name: 'Total Fat', value: '9.26', unit: 'g/100g', method: 'SOP-CHM-100-01' },
        { name: 'Sodium', value: '174.91', unit: 'mg/100g', method: 'SOP-CHM-27-01 (Part A)' }
      ]
    },
    {
      id: 'batch-102',
      batchNumber: '102',
      reportNumber: '001:NL:24:07:03872 R',
      issueDate: '15-Jul-2024',
      reference: 'EQNX:001:NL:24:07:03872/A R',
      sample: 'Moringa Powder',
      manufacturingDate: '01-Jul-2024',
      lab: 'EQUINOX LABS',
      status: 'Passed',
      parameters: [
        { name: 'Energy', value: '372.15', unit: 'Kcal/100g', method: 'SOP-CHM-29-00' },
        { name: 'Carbohydrate', value: '48.90', unit: 'g/100g', method: 'SOP-CHM-28-00' },
        { name: 'Protein', value: '24.10', unit: 'g/100g', method: 'SOP-CHM-90-01' },
        { name: 'Added Sugar', value: '<1.0', unit: 'g/100g', method: 'SOP-CHM-139-00' },
        { name: 'Total Sugar', value: '<2.0', unit: 'g/100g', method: 'SOP-CHM-123-00' },
        { name: 'Total Fat', value: '9.45', unit: 'g/100g', method: 'SOP-CHM-100-01' },
        { name: 'Sodium', value: '168.32', unit: 'mg/100g', method: 'SOP-CHM-27-01 (Part A)' }
      ]
    },
    {
      id: 'batch-103',
      batchNumber: '103',
      reportNumber: '001:NL:24:08:03873 R',
      issueDate: '28-Aug-2024',
      reference: 'EQNX:001:NL:24:08:03873/A R',
      sample: 'Moringa Powder',
      manufacturingDate: '01-Aug-2024',
      lab: 'EQUINOX LABS',
      status: 'Passed',
      parameters: [
        { name: 'Energy', value: '375.20', unit: 'Kcal/100g', method: 'SOP-CHM-29-00' },
        { name: 'Carbohydrate', value: '49.80', unit: 'g/100g', method: 'SOP-CHM-28-00' },
        { name: 'Protein', value: '23.85', unit: 'g/100g', method: 'SOP-CHM-90-01' },
        { name: 'Added Sugar', value: '<1.0', unit: 'g/100g', method: 'SOP-CHM-139-00' },
        { name: 'Total Sugar', value: '<2.0', unit: 'g/100g', method: 'SOP-CHM-123-00' },
        { name: 'Total Fat', value: '9.12', unit: 'g/100g', method: 'SOP-CHM-100-01' },
        { name: 'Sodium', value: '172.45', unit: 'mg/100g', method: 'SOP-CHM-27-01 (Part A)' }
      ]
    }
  ];

  const selectedReportData = labReports[selectedReport];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-black-900 mb-4">
          Quality <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Reports</span>
        </h2>
        <p className="text-lg text-black-700">
          View our comprehensive quality testing and certification reports for all batches
        </p>
      </div>

      {/* Download All Reports Button */}
      <div className="text-center mb-6 sm:mb-8">
        <a
          href="/Test_report.pdf"
          download="Amrti_All_Quality_Reports.pdf"
          className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-elegant hover:shadow-premium transition-all duration-300 text-sm sm:text-base"
        >
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Download All Reports (PDF)</span>
        </a>
      </div>

      {/* Mobile: Report Selection Tabs */}
      <div className="lg:hidden mb-6">
        <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-4 shadow-xl">
          <h3 className="text-lg font-heading font-bold text-black-900 mb-4 text-center">
            Select Report
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {labReports.map((report, index) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(index)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
                  selectedReport === index
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white/80 hover:bg-green-100 text-black-700'
                }`}
              >
                <FileText className={`w-4 h-4 ${selectedReport === index ? 'text-white' : 'text-green-600'}`} />
                <span>Batch #{report.batchNumber}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  report.status === 'Passed' 
                    ? selectedReport === index 
                      ? 'bg-green-500 text-white' 
                      : 'bg-green-100 text-green-800'
                    : selectedReport === index 
                      ? 'bg-red-500 text-white' 
                      : 'bg-red-100 text-red-800'
                }`}>
                  {report.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Desktop Sidebar - Report List */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-4 shadow-xl">
            <h3 className="text-lg font-heading font-bold text-black-900 mb-4 text-center">
              All Reports
            </h3>
            <div className="space-y-3">
              {labReports.map((report, index) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                    selectedReport === index
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-white/80 hover:bg-green-100 text-black-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className={`w-4 h-4 ${selectedReport === index ? 'text-white' : 'text-green-600'}`} />
                    <div>
                      <p className={`font-semibold text-sm ${selectedReport === index ? 'text-white' : 'text-black-900'}`}>
                        Batch #{report.batchNumber}
                      </p>
                      <p className={`text-xs ${selectedReport === index ? 'text-green-100' : 'text-black-600'}`}>
                        {report.issueDate}
                      </p>
                    </div>
                  </div>
                  <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                    report.status === 'Passed' 
                      ? selectedReport === index 
                        ? 'bg-green-500 text-white' 
                        : 'bg-green-100 text-green-800'
                      : selectedReport === index 
                        ? 'bg-red-500 text-white' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {report.status}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Report Viewer */}
        <div className="lg:col-span-3">
          <motion.div
            key={selectedReport}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-4 sm:p-6 shadow-xl"
          >
            {/* Report Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-black-900 text-center">
                  Test Report - Batch #{selectedReportData.batchNumber}
                </h3>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                  selectedReportData.status === 'Passed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedReportData.status}
                </span>
              </div>
              <p className="text-black-700 text-sm sm:text-base">
                Comprehensive quality testing report from {selectedReportData.lab}
              </p>
            </div>
            
            {/* Report Details */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg mb-4 sm:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Report Number</p>
                  <p className="text-xs sm:text-sm font-semibold text-black-900 break-words">{selectedReportData.reportNumber}</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Issue Date</p>
                  <p className="text-xs sm:text-sm font-semibold text-black-900">{selectedReportData.issueDate}</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Sample</p>
                  <p className="text-xs sm:text-sm font-semibold text-black-900">{selectedReportData.sample}</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Manufacturing</p>
                  <p className="text-xs sm:text-sm font-semibold text-black-900">{selectedReportData.manufacturingDate}</p>
                </div>
              </div>

              {/* Analysis Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-black-900">Parameter</th>
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-black-900">Result</th>
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-black-900">Unit</th>
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-black-900">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReportData.parameters.map((param, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-black-700">{param.name}</td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-black-700 font-semibold">{param.value}</td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-black-700">{param.unit}</td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-black-700 break-words">{param.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Download Link */}
            <div className="text-center">
              <a
                href="/Test_report.pdf"
                download={`Amrti_Quality_Test_Report_Batch_${selectedReportData.batchNumber}.pdf`}
                className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-tea-600 hover:bg-tea-700 text-white font-medium rounded-lg shadow-elegant hover:shadow-premium transition-all duration-300 text-sm sm:text-base"
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Download Batch #{selectedReportData.batchNumber} Report</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6"
      >
        <h4 className="text-xl font-heading font-bold text-green-800 mb-3 text-center">Quality Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{labReports.length}</p>
            <p className="text-sm text-green-700">Total Batches Tested</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">100%</p>
            <p className="text-sm text-green-700">Pass Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">Consistent</p>
            <p className="text-sm text-green-700">Quality Standards</p>
          </div>
        </div>
        <p className="text-green-700 text-sm text-center mt-4">
          All tested batches meet food safety standards with excellent nutritional profiles. 
          High protein content (23-24g/100g) and low sugar levels (&lt;2.0g/100g) maintained consistently across batches.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default MoringaProduct; 