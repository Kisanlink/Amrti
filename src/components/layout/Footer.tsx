import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProductService from '../../services/productService';
import RecipeService from '../../services/recipeService';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [products, setProducts] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
    ],
    support: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Shipping Policy', path: '/shipping' },
      { name: 'Returns & Refunds', path: '/return' },
      { name: 'Cancellation & Refund', path: '/cancellation-refund' },
      { name: 'Terms & Conditions', path: '/TnC' },
      { name: 'FAQ', path: '/faq' },
    ],
  };

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/amrti.foods/' },
  ];

  // Fetch products and recipes for footer
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products using ProductService which handles response transformation
        const productsResponse = await ProductService.getAllProducts(1, 20);
        console.log('Footer - ProductService Response:', productsResponse);
        console.log('Footer - Products data:', productsResponse.data);
        console.log('Footer - Is data array?', Array.isArray(productsResponse.data));
        console.log('Footer - Data length:', productsResponse.data?.length);
        
        // ProductService.getAllProducts() returns ProductsResponse with data as an array
        if (productsResponse.data && Array.isArray(productsResponse.data) && productsResponse.data.length > 0) {
          console.log('Footer - Setting products:', productsResponse.data.length);
          setProducts(productsResponse.data);
        } else {
          console.warn('Footer - No products in response:', {
            hasData: !!productsResponse.data,
            isArray: Array.isArray(productsResponse.data),
            length: productsResponse.data?.length,
            response: productsResponse,
          });
          setProducts([]);
        }
        
        // Fetch recipes
        try {
          const recipesResponse = await RecipeService.getAllRecipes(1, 10);
          if (recipesResponse.recipes && Array.isArray(recipesResponse.recipes)) {
            setRecipes(recipesResponse.recipes);
          } else if (recipesResponse && Array.isArray(recipesResponse)) {
            setRecipes(recipesResponse);
          }
        } catch (recipeError) {
          console.error('Failed to fetch recipes for footer:', recipeError);
          setRecipes([]);
        }
      } catch (error: any) {
        console.error('Failed to fetch data for footer:', error);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        // Set empty arrays on error to prevent UI issues
        setProducts([]);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <footer className="bg-russet-900 text-white">
      <div className="container-custom px-4 sm:px-6">
        <div className="py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <img 
                  src="/footer_logo.png" 
                  alt="Amrti Nature's Elixir" 
                  className="h-12 sm:h-14 lg:h-16 w-auto object-contain"
                />
              </div>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Premium natural products for health and wellness. Empowering farmers through sustainable practices.
              </p>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-2 sm:space-x-3 text-gray-300">
                  <Mail size={14} className="sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">info@amrti.com</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 text-gray-300">
                  <Phone size={14} className="sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">+91-7386727007</span>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3 text-gray-300">
                  <MapPin size={14} className="mt-1 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">
                  Plot no 27, Nandi Hills, Road No. 51,
                  Jubilee Hills, Hyderabad, 500033
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Company Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="text-base sm:text-lg font-heading font-bold mb-3 sm:mb-4">Company</h4>
              <ul className="space-y-1 sm:space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Products Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="text-base sm:text-lg font-heading font-bold mb-3 sm:mb-4">Products</h4>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="h-4 bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <ul className="space-y-2">
                  {products.slice(0, 8).map((product) => (
                    <li key={product.id || product.name}>
                      <Link
                        to={`/product/${product.id}`}
                        className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                      >
                        {product.name}
                      </Link>
                    </li>
                  ))}
                  {products.length > 8 && (
                    <li>
                      <Link
                        to="/products"
                        className="text-green-400 hover:text-green-300 transition-colors duration-200 text-sm font-medium"
                      >
                        View All Products →
                      </Link>
                    </li>
                  )}
                </ul>
              ) : (
                <div>
                  <p className="text-gray-400 text-sm">No products available</p>
                  <p className="text-gray-500 text-xs mt-1">Debug: products.length = {products.length}, loading = {loading ? 'true' : 'false'}</p>
                </div>
              )}
            </motion.div>

            {/* Recipes Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <h4 className="text-base sm:text-lg font-heading font-bold mb-3 sm:mb-4">Recipes</h4>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="h-4 bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-2">
                  {recipes.slice(0, 6).map((recipe) => (
                    <li key={recipe.id}>
                      <Link
                        to={`/recipes/${recipe.id}`}
                        className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                      >
                        {recipe.name}
                      </Link>
                    </li>
                  ))}
                  {recipes.length > 6 && (
                    <li>
                      <Link
                        to="/recipes"
                        className="text-green-400 hover:text-green-300 transition-colors duration-200 text-sm font-medium"
                      >
                        View All Recipes →
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </motion.div>

            {/* Support Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className="text-base sm:text-lg font-heading font-bold mb-3 sm:mb-4">Support</h4>
              <ul className="space-y-1 sm:space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="border-t border-gray-700 mt-8 sm:mt-12 pt-6 sm:pt-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <div className="text-gray-300 text-xs sm:text-sm">
                © {currentYear} Agros link Pvt. All Rights Reserved.
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-1.5 sm:p-2 bg-russet-800 rounded-full text-gray-300 hover:text-white hover:bg-russet-700 transition-all duration-200"
                  >
                    <social.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 