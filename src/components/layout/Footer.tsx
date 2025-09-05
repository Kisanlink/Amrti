import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { productsApi } from '../../services/api';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [products, setProducts] = useState<any[]>([]);
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

  // Fetch products for footer
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsApi.getProducts(1, 20); // Get first 20 products
        if (response.data && Array.isArray(response.data)) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch products for footer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <footer className="bg-russet-900 text-white">
      <div className="container-custom">
        <div className="section-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1"
            >
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/footer_logo.png" 
                  alt="Amrti Nature's Elixir" 
                  className="h-16 w-auto object-contain"
                />
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Premium natural products for health and wellness. Empowering farmers through sustainable practices.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail size={16} />
                  <span>info@amrti.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone size={16} />
                  <span>+91-7386727007</span>
                </div>
                <div className="flex items-start space-x-3 text-gray-300">
                  <MapPin size={16} className="mt-1" />
                  <span className="text-sm">
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
                             <h4 className="text-lg font-heading font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
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
              <h4 className="text-lg font-heading font-bold mb-4">Products</h4>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="h-4 bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-2">
                  {products.slice(0, 8).map((product) => (
                    <li key={product.id}>
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
              )}
            </motion.div>

            {/* Recipes Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <h4 className="text-lg font-heading font-bold mb-4">Recipes</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/recipes"
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    All Recipes
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Support Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
                              <h4 className="text-lg font-heading font-bold mb-4">Support</h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
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
            className="border-t border-gray-700 mt-12 pt-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-300 text-sm">
                © {currentYear} Agros link Pvt. All Rights Reserved.
              </div>
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-russet-800 rounded-full text-gray-300 hover:text-white hover:bg-russet-700 transition-all duration-200"
                  >
                    <social.icon size={18} />
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