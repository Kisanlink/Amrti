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
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

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
      {/* Tab Navigation */}
      <section className="py-4 bg-beige-400">
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
          {activeTab === 'benefits' && <BenefitsContent isVideoLoaded={isVideoLoaded} setIsVideoLoaded={setIsVideoLoaded} />}
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
const BenefitsContent = ({ isVideoLoaded, setIsVideoLoaded }: { isVideoLoaded: boolean; setIsVideoLoaded: (loaded: boolean) => void }) => {
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

      {/* Moringa Benefits Video Section */}
      <div className="mb-12 text-center">
        <h3 className="text-2xl font-heading font-bold text-black-900 mb-6">
          Learn More About Moringa Benefits
        </h3>
        <div className="max-w-sm mx-auto">
        <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-6 shadow-xl">
            <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden relative">
              {!isVideoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-white text-sm">Loading video...</p>
            </div>
          </div>
              )}
              <video 
                className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
                controls
                preload="metadata"
                poster="/products/pouch front mockup.jpg"
                onLoadedData={() => setIsVideoLoaded(true)}
                onCanPlay={() => setIsVideoLoaded(true)}
              >
                <source src="https://amrti.s3.ap-south-1.amazonaws.com/videos/product-demo/moringa+powder+updated.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
        <p className="text-black-700 mt-4 text-sm">
          Watch this informative video to learn more about the incredible benefits of Moringa powder
          </p>
        </div>

      {/* Nutritional Comparison */}
      <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-heading font-bold text-black-900 mb-4">
            Nutritional Power Comparison
          </h3>
          <p className="text-lg text-black-700">
            See how Moringa powder compares to other superfoods
          </p>
            </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">A</span>
          </div>
                <span className="font-semibold text-black-900">Vitamin A</span>
              </div>
              <div className="text-right">
                <span className="text-green-600 font-bold text-lg">2x more</span>
                <p className="text-xs text-gray-600">than Carrots</p>
              </div>
        </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">C</span>
            </div>
                <span className="font-semibold text-black-900">Vitamin C</span>
          </div>
              <div className="text-right">
                <span className="text-green-600 font-bold text-lg">4x more</span>
                <p className="text-xs text-gray-600">than Oranges</p>
              </div>
        </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">Ca</span>
            </div>
                <span className="font-semibold text-black-900">Calcium</span>
          </div>
              <div className="text-right">
                <span className="text-green-600 font-bold text-lg">17x more</span>
                <p className="text-xs text-gray-600">than Milk</p>
        </div>
      </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">Fe</span>
            </div>
                <span className="font-semibold text-black-900">Iron</span>
          </div>
              <div className="text-right">
                <span className="text-green-600 font-bold text-lg">10x more</span>
                <p className="text-xs text-gray-600">than Spinach</p>
        </div>
      </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-sm">K</span>
                </div>
                <span className="font-semibold text-black-900">Potassium</span>
              </div>
              <div className="text-right">
                <span className="text-green-600 font-bold text-lg">3x more</span>
                <p className="text-xs text-gray-600">than Banana</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">P</span>
                </div>
                <span className="font-semibold text-black-900">Protein</span>
              </div>
              <div className="text-right">
                <span className="text-green-600 font-bold text-lg">3x more</span>
                <p className="text-xs text-gray-600">than Yogurt</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">F</span>
                </div>
                <span className="font-semibold text-black-900">Fiber</span>
              </div>
              <div className="text-right">
                <span className="text-green-600 font-bold text-lg">2x more</span>
                <p className="text-xs text-gray-600">than Oats</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-black-700 text-sm">
            <span className="font-semibold">Moringa powder</span> contains significantly higher amounts of essential nutrients 
            compared to commonly known superfoods, making it one of the most nutrient-dense foods on the planet.
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
  // Latest test report data (most recent batch)
  const latestReport = {
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-black-900 mb-4">
          Quality <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Test Report</span>
        </h2>
        <p className="text-lg text-black-700">
          Latest comprehensive quality testing report from our certified laboratory
        </p>
      </div>

      {/* Download Report Button */}
      <div className="text-center mb-8">
        <a
          href="/Test_report.pdf"
          download="Amrti_Quality_Test_Report.pdf"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-elegant hover:shadow-premium transition-all duration-300"
        >
          <FileText className="w-5 h-5" />
          <span>Download Full Report (PDF)</span>
        </a>
      </div>

      {/* Complete Test Report Image */}
      <div className="bg-beige-300/80 backdrop-blur-sm border border-beige-400/50 rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <FileText className="w-6 h-6 text-green-600" />
            <h3 className="text-2xl font-heading font-bold text-black-900">
              Complete Quality Test Report
          </h3>
          </div>
          <p className="text-black-700">
            Full laboratory test report from {latestReport.lab} with official stamp and certification
          </p>
      </div>

               {/* Report Display */}
               <h3 className="text-2xl font-heading font-bold text-black-900 mb-6 text-center">
                 Quality Test Report
            </h3>
               
               {/* Report Image Display */}
               <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
                 <img
                   src="/lab_report.png"
                   alt="Moringa Powder Quality Test Report"
                   className="w-full h-auto"
                   style={{ minHeight: '500px', objectFit: 'contain' }}
                 />
               </div>

               {/* Action Buttons */}
               <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                 <a
                   href="/Test_report.pdf"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-300"
                 >
                   <FileText className="w-5 h-5" />
                   <span>View Full Report</span>
                 </a>
                 
              <a
                href="/Test_report.pdf"
                   download="Amrti_Quality_Test_Report.pdf"
                   className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-300"
              >
                   <FileText className="w-5 h-5" />
                   <span>Download Report</span>
              </a>
      </div>

        {/* Report Summary */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h4 className="text-xl font-heading font-bold text-green-800 mb-4 text-center">Report Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
          <div>
            <p className="text-2xl font-bold text-green-600">100%</p>
            <p className="text-sm text-green-700">Pass Rate</p>
          </div>
          <div>
              <p className="text-2xl font-bold text-green-600">ISO Certified</p>
              <p className="text-sm text-green-700">Laboratory</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">Premium</p>
            <p className="text-sm text-green-700">Quality Standards</p>
          </div>
        </div>
          <p className="text-center text-green-700 text-sm">
            This complete test report from Equinox Labs includes all nutritional analysis, safety tests, and quality certifications. 
            Our moringa powder consistently meets the highest quality standards with comprehensive testing for nutritional content, 
            purity, and safety.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MoringaProduct; 