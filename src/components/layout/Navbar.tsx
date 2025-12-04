import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, Search, Heart, LogOut, Loader2, Package } from 'lucide-react';
import CartService from '../../services/cartService';
import AuthService, { AuthUser } from '../../services/authService';
import ProfileService from '../../services/profileService';
import { useNotification } from '../../context/NotificationContext';
import CartPopup from '../ui/CartPopup';
import CartCount from '../ui/CartCount';
import { useWishlistCount } from '../../hooks/queries/useWishlist';
import { useAppSelector } from '../../store';

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  // Use Redux DIRECTLY - no hooks needed, Redux updates trigger re-render automatically
  const wishlistCount = useAppSelector((state) => state.counter.wishlistCount);
  
  // Use Redux auth state for reliable authentication status
  const authUser = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  // Sync from cache on mount only (background sync)
  useWishlistCount();
  
  // Keep local state as fallback for immediate updates
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  
  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync Redux auth state with local state - this is the primary source of truth
  useEffect(() => {
    if (authUser || isAuthenticated) {
      console.log('Navbar: Syncing from Redux', { authUser, isAuthenticated });
      setUser(authUser);
      setAuthenticated(isAuthenticated);
    } else {
      // If Redux doesn't have user, try to get from AuthService (fallback)
      const currentUser = AuthService.getCurrentUser();
      const isAuth = AuthService.isAuthenticated();
      if (currentUser && isAuth) {
        console.log('Navbar: Syncing from AuthService fallback', { currentUser, isAuth });
        setUser(currentUser);
        setAuthenticated(isAuth);
      }
    }
  }, [authUser, isAuthenticated]);

  // Load profile name for display in user menu
  useEffect(() => {
    const shouldLoadProfileName = (authenticated || isAuthenticated) && !profileName;
    if (!shouldLoadProfileName) return;

    let isCancelled = false;

    const loadProfileName = async () => {
      try {
        const profile = await ProfileService.getProfile();
        const fullName = ProfileService.getFullName(profile);
        if (isCancelled) return;

        setProfileName(fullName);

        // Also persist the name into stored user data for other parts of the app
        try {
          const storedUserStr = localStorage.getItem('user');
          if (storedUserStr) {
            const storedUser = JSON.parse(storedUserStr);
            if (!storedUser.name || storedUser.name === 'User') {
              storedUser.name = fullName;
              localStorage.setItem('user', JSON.stringify(storedUser));
            }
          }
        } catch {
          // Ignore storage errors
        }
      } catch {
        // If profile fetch fails, silently ignore and keep existing fallbacks
      }
    };

    loadProfileName();

    return () => {
      isCancelled = true;
    };
  }, [authenticated, isAuthenticated, profileName]);

  // Refresh auth state when user menu is opened
  const handleUserMenuToggle = () => {
    // Refresh auth state before showing menu
    const currentUser = authUser || AuthService.getCurrentUser();
    const isAuth = isAuthenticated || AuthService.isAuthenticated();
    
    if (currentUser) {
      setUser(currentUser);
      setAuthenticated(true);
    } else {
      setUser(null);
      setAuthenticated(false);
    }
    
    setShowUserMenu(!showUserMenu);
  };

  // Listen to authentication state changes (backup to Redux)
  useEffect(() => {
    const handleUserLogin = (event: Event) => {
      // Get user from event detail if available, otherwise from AuthService
      const customEvent = event as CustomEvent<AuthUser>;
      const eventUser = customEvent.detail;
      
      console.log('Navbar: User logged in event received', { eventUser, authUser, isAuthenticated });
      
      // Update local state immediately for UI responsiveness
      const updateAuthState = () => {
        const currentUser = eventUser || AuthService.getCurrentUser();
        const isAuth = currentUser ? true : AuthService.isAuthenticated();
        
        console.log('Navbar: Updating auth state', { currentUser, isAuth });
        setUser(currentUser);
        setAuthenticated(isAuth);
      };
      
      // Update immediately
      updateAuthState();
      
      // Also update after a short delay to catch any async updates
      setTimeout(updateAuthState, 100);
      setTimeout(updateAuthState, 500);
    };

    const handleUserLogout = () => {
      console.log('Navbar: User logged out');
      setUser(null);
      setAuthenticated(false);
      // Wishlist count will be updated automatically by React Query
      // Navigate to login page if not already there
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    };

    // Add event listeners
    window.addEventListener('userLoggedIn', handleUserLogin);
    window.addEventListener('userLoggedOut', handleUserLogout);

    // Cleanup
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
      window.removeEventListener('userLoggedOut', handleUserLogout);
    };
  }, [location.pathname, navigate]);

  // Wishlist updates are now handled by React Query automatically

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
      if (showSearch && !searchRef.current?.contains(event.target as Element)) {
        setShowSearch(false);
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showSearch]);

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Import the API service dynamically to avoid circular dependencies
      const { apiRequest } = await import('../../services/api');
      const response = await apiRequest<any>(`/products/search?q=${encodeURIComponent(query)}`);
      
      // Log the response to debug
      console.log('Search response:', response);
      
      // Extract products from the correct path in the response
      let products = [];
      if (response.data && Array.isArray(response.data)) {
        products = response.data;
      } else if (response.products && Array.isArray(response.products)) {
        products = response.products;
      } else if (Array.isArray(response)) {
        products = response;
      }
      
      console.log('Extracted products:', products);
      setSearchResults(products);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      // Debounce search
      const timeoutId = setTimeout(() => {
        handleSearch(query);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchResultClick = (productId: string) => {
    setShowSearch(false);
    setShowSearchResults(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/product/${productId}`);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
        setShowSearchResults(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

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
      <div className="container-custom px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          {/* Logo - Top Left */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-1 sm:space-x-2"
            >
              {/* Logo */}
              <div className="h-32 w-auto sm:h-28 lg:h-32 flex items-center relative">
                <img 
                  src="/navbar_logo.png"
                  alt="Amrti Nature's Elixir" 
                  className="h-full w-auto object-contain select-none pointer-events-none"
                  // style={{ imageRendering: 'auto' }}
                />
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
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
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              {showSearch ? (
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      placeholder="Search products..."
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      autoFocus
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" size={16} />
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setShowSearchResults(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 text-russet-700 hover:text-green-600 transition-colors"
                >
              <Search size={20} />
            </button>
              )}
              
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showSearchResults && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto"
                  >
                    {searchResults.length > 0 ? (
                      searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSearchResultClick(product.id)}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-300 rounded"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500 truncate">{product.category}</p>
                            <p className="text-sm font-semibold text-green-600">₹{product.price}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500">
                        <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No products found</p>
                        <p className="text-xs">Try a different search term</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Wishlist */}
            <Link to="/wishlist" className="p-2 text-russet-700 hover:text-green-600 transition-colors">
              <div className="relative flex items-center">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </div>
            </Link>
            
            {/* Cart */}
            <button 
              onClick={() => setShowCartPopup(true)}
              className="p-2 text-russet-700 hover:text-green-600 transition-colors relative"
            >
              <CartCount showIcon={true} />
            </button>
            
            {/* User Menu */}
            <div className="relative user-menu">
              <button 
                onClick={handleUserMenuToggle}
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
                    {(authenticated || isAuthenticated) ? (
                      <>
                        <div className="px-4 py-2 border-b border-black-200">
                          <p className="text-sm font-semibold text-black-900">
                            {(() => {
                              // Highest priority: profile name loaded from ProfileService
                              if (profileName) return profileName;

                              const currentUser = user || authUser;

                              // Next: name stored in localStorage user object (e.g., from profile page)
                              try {
                                const storedUserStr = localStorage.getItem('user');
                                if (storedUserStr) {
                                  const storedUser = JSON.parse(storedUserStr);
                                  if (storedUser.name) return storedUser.name;
                                }
                              } catch {
                                // Ignore parsing errors
                              }

                              // Fallbacks: displayName, then generic 'User'
                              return currentUser?.displayName || 'User';
                            })()}
                          </p>
                          <p className="text-xs text-black-600">
                            {(() => {
                              const currentUser = user || authUser;
                              // Try to get email from stored user object
                              try {
                                const storedUserStr = localStorage.getItem('user');
                                if (storedUserStr) {
                                  const storedUser = JSON.parse(storedUserStr);
                                  if (storedUser.email) return storedUser.email;
                                }
                              } catch (e) {
                                // Ignore parsing errors
                              }
                              return currentUser?.phoneNumber || '';
                            })()}
                          </p>
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
                          onClick={async () => {
                            await AuthService.logout();
                            setUser(null);
                            setAuthenticated(false);
                            setShowUserMenu(false);
                            navigate('/login', { replace: true });
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

          {/* Mobile Menu Buttons */}
          <div className="md:hidden flex items-center space-x-2 flex-shrink-0">
            {/* Cart Icon */}
            <button
              onClick={() => setShowCartPopup(!showCartPopup)}
              className="relative p-1.5 sm:p-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <CartCount showIcon={true} />
            </button>
            
            {/* Burger Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Side Panel */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/50 z-40"
                style={{ zIndex: 40 }}
              />
              
              {/* Side Panel */}
              <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-screen w-80 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col"
                style={{ zIndex: 50 }}
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50 flex-shrink-0">
                    <div className="flex items-center">
                      <span className="text-lg font-heading font-semibold text-green-700">Menu</span>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto min-h-0">
                    {/* Debug: Test content visibility */}
                    {/* <div className="text-sm text-gray-500 mb-2">Navigation Menu</div> */}
                    
                    {/* Main Navigation */}
                    <div className="space-y-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center py-3 px-3 font-medium transition-colors duration-200 rounded-lg ${
                            isActive(item.path)
                              ? 'text-green-600 bg-green-50 border-l-4 border-green-600'
                              : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-base">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                    
                    {/* Utility Section */}
                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      {/* Search */}
                      <div>
                        {showSearch ? (
                          <div className="space-y-2">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                              <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                                autoFocus
                              />
                              {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" size={18} />
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setShowSearch(false);
                                setShowSearchResults(false);
                                setSearchQuery('');
                                setSearchResults([]);
                              }}
                              className="w-full py-2 px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowSearch(true)}
                            className="flex items-center space-x-3 w-full py-3 px-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors rounded-lg"
                          >
                            <Search size={20} />
                            <span className="text-base">Search</span>
                          </button>
                        )}
                    
                        {/* Search Results */}
                        {showSearchResults && (
                          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                            {searchResults.length > 0 ? (
                              searchResults.map((product) => (
                                <div
                                  key={product.id}
                                  onClick={() => {
                                    handleSearchResultClick(product.id);
                                    setIsOpen(false);
                                  }}
                                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                >
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    {product.image_url ? (
                                      <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 bg-gray-300 rounded"></div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{product.category}</p>
                                    <p className="text-sm font-semibold text-green-600">₹{product.price}</p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No products found</p>
                                <p className="text-xs">Try a different search term</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                  
                      {/* Wishlist */}
                      <Link 
                        to="/wishlist" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 w-full py-3 px-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors rounded-lg"
                      >
                        <Heart size={20} />
                        <span className="text-base">Wishlist ({wishlistCount})</span>
                      </Link>
                      
                      {/* Cart */}
                      <button 
                        onClick={() => {
                          setIsOpen(false);
                          setShowCartPopup(true);
                        }}
                        className="flex items-center space-x-3 w-full py-3 px-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors rounded-lg"
                      >
                        <ShoppingCart size={20} />
                        <span className="text-base">Cart</span>
                      </button>
                  
                      {/* User Account */}
                      {(authenticated || isAuthenticated) ? (
                        <>
                          <div className="pt-4 border-t border-gray-200">
                            <div className="px-3 py-3 bg-gray-50 rounded-lg mb-2">
                              <p className="text-sm font-semibold text-gray-900">{(user || authUser)?.displayName || 'User'}</p>
                              <p className="text-xs text-gray-600">{(user || authUser)?.phoneNumber}</p>
                            </div>
                            
                            <Link 
                              to="/profile" 
                              onClick={() => setIsOpen(false)}
                              className="flex items-center space-x-3 w-full py-3 px-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors rounded-lg"
                            >
                              <User size={20} />
                              <span className="text-base">My Profile</span>
                            </Link>

                            <Link 
                              to="/orders" 
                              onClick={() => setIsOpen(false)}
                              className="flex items-center space-x-3 w-full py-3 px-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors rounded-lg"
                            >
                              <Package size={20} />
                              <span className="text-base">My Orders</span>
                            </Link>

                            <button 
                              onClick={async () => {
                                await AuthService.logout();
                                setUser(null);
                                setAuthenticated(false);
                                setIsOpen(false);
                                navigate('/login', { replace: true });
                              }}
                              className="flex items-center space-x-3 w-full py-3 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors rounded-lg"
                            >
                              <LogOut size={20} />
                              <span className="text-base">Logout</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="pt-4 border-t border-gray-200 space-y-1">
                          <Link 
                            to="/login" 
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 w-full py-3 px-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors rounded-lg"
                          >
                            <User size={20} />
                            <span className="text-base">Sign In</span>
                          </Link>
                          <Link 
                            to="/signup" 
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 w-full py-3 px-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors rounded-lg"
                          >
                            <User size={20} />
                            <span className="text-base">Sign Up</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
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