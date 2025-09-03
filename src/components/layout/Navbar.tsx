import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, Search, Heart, LogOut } from 'lucide-react';
import CartService from '../../services/cartService';
import WishlistService from '../../services/wishlistService';
import AuthService, { AuthUser } from '../../services/authService';
import { useNotification } from '../../context/NotificationContext';
import CartPopup from '../ui/CartPopup';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();
  const { showNotification } = useNotification();

  // Load user and authentication state on mount
  useEffect(() => {
    const loadInitialData = async () => {
      const currentUser = AuthService.getCurrentUser();
      setUser(currentUser);
      setAuthenticated(AuthService.isAuthenticated());
      
      try {
        const cartCount = await CartService.getItemCount();
        setCartCount(cartCount);
      } catch (error) {
        console.error('Failed to load cart count:', error);
        setCartCount(0);
      }
      
      try {
        const wishlistCount = await WishlistService.getWishlistCount();
        setWishlistCount(wishlistCount);
      } catch (error) {
        console.error('Failed to load wishlist count:', error);
        setWishlistCount(0);
      }
    };
    
    loadInitialData();
  }, []);

  // Update cart and wishlist counts periodically
  useEffect(() => {
    const updateCounts = async () => {
      try {
        const cartCount = await CartService.getItemCount();
        setCartCount(cartCount);
      } catch (error) {
        console.error('Failed to update cart count:', error);
      }
      
      try {
        const wishlistCount = await WishlistService.getWishlistCount();
        setWishlistCount(wishlistCount);
      } catch (error) {
        console.error('Failed to update wishlist count:', error);
      }
    };

    // Update counts immediately
    updateCounts();

    // Set up interval to refresh counts every 30 seconds
    const interval = setInterval(updateCounts, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Recipes', path: '/recipes' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
              className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-elegant border-b border-beige-200/50'
            : 'bg-transparent'
        }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-1 sm:space-x-2"
            >
              <img 
                src="/logo2.png" 
                alt="Amrti Nature's Elixir" 
                className="h-12 w-auto sm:h-14 md:h-16 object-contain"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative font-heading font-medium transition-colors duration-200 ${
                  isActive(item.path)
                                                ? 'text-green-600'
                : 'text-russet-800 hover:text-green-600'
                }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-600"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
                          <button className="p-2 text-russet-700 hover:text-green-600 transition-colors">
              <Search size={20} />
            </button>
            
            {/* Wishlist */}
                          <Link to="/wishlist" className="p-2 text-russet-700 hover:text-green-600 transition-colors relative">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white-50 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            
            {/* Cart */}
            <button 
              onClick={() => setShowCartPopup(true)}
                              className="p-2 text-russet-700 hover:text-green-600 transition-colors relative"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            {/* User Menu */}
            <div className="relative user-menu">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 text-russet-700 hover:text-green-600 transition-colors"
              >
                <User size={20} />
              </button>
              
              {/* User Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-black-200 py-2 z-50"
                  >
                    {authenticated ? (
                      <>
                        <div className="px-4 py-2 border-b border-black-200">
                          <p className="text-sm font-semibold text-black-900">{user?.displayName || 'User'}</p>
                          <p className="text-xs text-black-600">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Orders
                        </Link>
                        <button
                          onClick={() => {
                            AuthService.logout();
                            setUser(null);
                            setAuthenticated(false);
                            setShowUserMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <LogOut size={16} />
                            <span>Logout</span>
                          </div>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/signup"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-beige-300 border-t border-black-200"
            >
              <div className="px-4 py-6 space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block py-3 px-2 font-medium transition-colors duration-200 rounded-lg ${
                      isActive(item.path)
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-700 hover:text-green-600 hover:bg-beige-200'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-black-200 space-y-2">
                  <button className="flex items-center space-x-2 w-full py-3 px-2 text-gray-600 hover:text-green-600 hover:bg-beige-200 transition-colors rounded-lg">
                    <Search size={20} />
                    <span>Search</span>
                  </button>
                  
                  {/* Wishlist */}
                  <Link 
                    to="/wishlist" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 w-full py-3 px-2 text-gray-600 hover:text-green-600 hover:bg-beige-200 transition-colors rounded-lg"
                  >
                    <Heart size={20} />
                    <span>Wishlist ({wishlistCount})</span>
                  </Link>
                  
                  {/* Cart */}
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      setShowCartPopup(true);
                    }}
                    className="flex items-center space-x-2 w-full py-3 px-2 text-gray-600 hover:text-green-600 hover:bg-beige-200 transition-colors rounded-lg"
                  >
                    <ShoppingCart size={20} />
                    <span>Cart ({cartCount})</span>
                  </button>
                  
                  {/* User Account */}
                  {authenticated ? (
                    <>
                      <div className="px-2 py-2 border-t border-black-200">
                        <p className="text-sm font-semibold text-black-900">{user?.displayName || 'User'}</p>
                        <p className="text-xs text-black-600">{user?.email}</p>
                      </div>
                      <Link 
                        to="/profile" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 w-full py-2 text-gray-600 hover:text-green-600 transition-colors"
                      >
                        <User size={20} />
                        <span>My Profile</span>
                      </Link>
                      <Link 
                        to="/orders" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 w-full py-2 text-gray-600 hover:text-green-600 transition-colors"
                      >
                        <User size={20} />
                        <span>My Orders</span>
                      </Link>
                                              <button 
                          onClick={() => {
                            AuthService.logout();
                            setUser(null);
                            setAuthenticated(false);
                            setIsOpen(false);
                          }}
                        className="flex items-center space-x-2 w-full py-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <LogOut size={20} />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 w-full py-2 text-gray-600 hover:text-green-600 transition-colors"
                      >
                        <User size={20} />
                        <span>Sign In</span>
                      </Link>
                      <Link 
                        to="/signup" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 w-full py-2 text-gray-600 hover:text-green-600 transition-colors"
                      >
                        <User size={20} />
                        <span>Sign Up</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Cart Popup */}
      <CartPopup 
        isOpen={showCartPopup} 
        onClose={() => setShowCartPopup(false)} 
      />
    </motion.nav>
  );
};

export default Navbar; 