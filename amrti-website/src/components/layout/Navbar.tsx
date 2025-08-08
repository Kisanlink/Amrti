import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, Search, Heart, LogOut } from 'lucide-react';
import { getCartItemCount } from '../../services/cartService';
import { getWishlistCount } from '../../services/wishlistService';
import { getCurrentUser, isAuthenticated, logout, User as AuthUser } from '../../services/authService';
import { useNotification } from '../../context/NotificationContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();
  const { showNotification } = useNotification();

  // Load user and authentication state on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setAuthenticated(isAuthenticated());
    setCartCount(getCartItemCount());
    setWishlistCount(getWishlistCount());
  }, []);

  // Update cart and wishlist counts periodically and on storage changes
  useEffect(() => {
    const updateCounts = () => {
      setCartCount(getCartItemCount());
      setWishlistCount(getWishlistCount());
    };

    // Update counts immediately
    updateCounts();

    // Listen for storage changes (when cart/wishlist is updated in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart' || e.key === 'wishlist') {
        updateCounts();
      }
    };

    // Listen for custom events (when cart/wishlist is updated in same tab)
    const handleCartUpdate = () => updateCounts();
    const handleWishlistUpdate = () => updateCounts();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
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
            ? 'bg-beige-300/95 backdrop-blur-md shadow-xl border-b border-green-100/50'
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
                src="/logo.png" 
                alt="Amrti Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain"
              />
              <span className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-gradient tracking-tight">
                AMRTI
              </span>
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
                    : 'text-black-700 hover:text-green-600'
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
            <button className="p-2 text-black-600 hover:text-green-600 transition-colors">
              <Search size={20} />
            </button>
            
            {/* Wishlist */}
            <Link to="/wishlist" className="p-2 text-black-600 hover:text-green-600 transition-colors relative">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white-50 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            
            {/* Cart */}
            <Link to="/cart" className="p-2 text-black-600 hover:text-green-600 transition-colors relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white-50 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {/* User Menu */}
            <div className="relative user-menu">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 text-black-600 hover:text-green-600 transition-colors"
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
                          <p className="text-sm font-semibold text-black-900">{user?.fullName}</p>
                          <p className="text-xs text-black-600">{user?.username}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-black-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-black-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Orders
                        </Link>
                        <button
                          onClick={() => {
                            logout();
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
                          className="block px-4 py-2 text-sm text-black-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/signup"
                          className="block px-4 py-2 text-sm text-black-700 hover:bg-green-50 hover:text-green-600 transition-colors"
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
            className="md:hidden p-2 text-black-600 hover:text-green-600 transition-colors"
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
                        : 'text-black-700 hover:text-green-600 hover:bg-beige-200'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-black-200 space-y-2">
                  <button className="flex items-center space-x-2 w-full py-3 px-2 text-black-600 hover:text-green-600 hover:bg-beige-200 transition-colors rounded-lg">
                    <Search size={20} />
                    <span>Search</span>
                  </button>
                  
                  {/* Wishlist */}
                  <Link 
                    to="/wishlist" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 w-full py-3 px-2 text-black-600 hover:text-green-600 hover:bg-beige-200 transition-colors rounded-lg"
                  >
                    <Heart size={20} />
                    <span>Wishlist ({wishlistCount})</span>
                  </Link>
                  
                  {/* Cart */}
                  <Link 
                    to="/cart" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 w-full py-3 px-2 text-black-600 hover:text-green-600 hover:bg-beige-200 transition-colors rounded-lg"
                  >
                    <ShoppingCart size={20} />
                    <span>Cart ({cartCount})</span>
                  </Link>
                  
                  {/* User Account */}
                  {isAuthenticated ? (
                    <>
                      <div className="px-2 py-2 border-t border-black-200">
                        <p className="text-sm font-semibold text-black-900">{user?.fullName}</p>
                        <p className="text-xs text-black-600">{user?.username}</p>
                      </div>
                      <Link 
                        to="/profile" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 w-full py-2 text-black-600 hover:text-green-600 transition-colors"
                      >
                        <User size={20} />
                        <span>My Profile</span>
                      </Link>
                      <Link 
                        to="/orders" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 w-full py-2 text-black-600 hover:text-green-600 transition-colors"
                      >
                        <User size={20} />
                        <span>My Orders</span>
                      </Link>
                      <button 
                        onClick={() => {
                          logout();
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
                        className="flex items-center space-x-2 w-full py-2 text-black-600 hover:text-green-600 transition-colors"
                      >
                        <User size={20} />
                        <span>Sign In</span>
                      </Link>
                      <Link 
                        to="/signup" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 w-full py-2 text-black-600 hover:text-green-600 transition-colors"
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
    </motion.nav>
  );
};

export default Navbar; 