import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Our Mission', path: '/about' },
      { name: 'Contact', path: '/contact' },
    ],
    products: [
      { name: 'Powders', path: '/products' },
      { name: 'Kombucha', path: '/products' },
      { name: 'Recipes', path: '/recipes' },
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

  return (
    <footer className="bg-russet-900 text-white">
      <div className="container-custom">
        <div className="section-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1"
            >
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/logo.png" 
                  alt="Amrti Logo" 
                  className="h-12 w-12 object-contain"
                />
                                 <h3 className="text-2xl font-heading font-bold tracking-tight">AMRTI</h3>
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
                  <span>+91-XXXXXXXXXX</span>
                </div>
                <div className="flex items-start space-x-3 text-gray-300">
                  <MapPin size={16} className="mt-1" />
                  <span className="text-sm">
                    [Insert your office/registered address here]
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
              <ul className="space-y-2">
                {footerLinks.products.map((link) => (
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