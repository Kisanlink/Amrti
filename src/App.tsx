import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { useAppDispatch } from './store';
import { setCartCount, setWishlistCount, resetCounters } from './store/slices/counterSlice';
import { setUser, setToken, clearAuth } from './store/slices/authSlice';
import CartService from './services/cartService';
import WishlistService from './services/wishlistService';
import AuthService from './services/authService';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './lib/queryClient';
import { updateCartQueries } from './hooks/queries/useCart';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import MoringaProduct from './pages/MoringaProduct';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import RecipeSubmission from './pages/RecipeSubmission';
import MySubmissions from './pages/MySubmissions';
import AdminPendingRecipes from './pages/admin/AdminPendingRecipes';
import AdminReviewDetail from './pages/admin/AdminReviewDetail';
import AdminPortal from './pages/admin/AdminPortal';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/CheckoutMagic';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import CancellationRefund from './pages/CancellationRefund';
import ScrollToTop from './components/ui/ScrollToTop';
import LoginRequiredModal from './components/ui/LoginRequiredModal';
import WelcomeScreen from './components/ui/WelcomeScreen';
import { useWelcomeScreen } from './hooks/useWelcomeScreen';
import './index.css';

function AppContent() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient(); // Added for cache invalidation
  const { showWelcome, handleWelcomeComplete } = useWelcomeScreen();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalData, setLoginModalData] = useState({
    message: 'Please login to continue',
    redirectUrl: '/'
  });

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Initialize counters and auth state on app mount
  useEffect(() => {
    const initializeCounters = async () => {
      try {
        // Initialize cart count
        const cartCount = await CartService.getItemCount();
        dispatch(setCartCount(cartCount));
      } catch (error) {
        console.warn('Failed to initialize cart count:', error);
        dispatch(setCartCount(0));
      }

      try {
        // Initialize wishlist count
        const wishlistCount = await WishlistService.getWishlistCount();
        dispatch(setWishlistCount(wishlistCount));
      } catch (error) {
        console.warn('Failed to initialize wishlist count:', error);
        dispatch(setWishlistCount(0));
      }
    };

    const initializeAuth = async () => {
      try {
        // Initialize Redux auth state from AuthService
        const currentUser = AuthService.getCurrentUser();
        const isAuth = AuthService.isAuthenticated();
        
        if (currentUser && isAuth) {
          dispatch(setUser(currentUser));
          try {
            const token = await AuthService.getIdToken();
            if (token) {
              dispatch(setToken(token));
            }
          } catch (error) {
            console.warn('Failed to get token on init:', error);
          }
        }
      } catch (error) {
        console.warn('Failed to initialize auth state:', error);
      }
    };

    initializeCounters();
    initializeAuth();
  }, [dispatch]);

  // Listen for login required events
  useEffect(() => {
    const handleLoginRequired = (event: CustomEvent) => {
      setLoginModalData({
        message: event.detail.message || 'Please login to continue',
        redirectUrl: event.detail.redirectUrl || window.location.pathname
      });
      setShowLoginModal(true);
    };

    const handleUserLogin = async (event?: Event) => {
      // Update Redux auth state immediately
      const customEvent = event as CustomEvent;
      const eventUser = customEvent?.detail;
      const currentUser = eventUser || AuthService.getCurrentUser();
      
      if (currentUser) {
        console.log('App: Updating Redux auth state on login', currentUser);
        dispatch(setUser(currentUser));
        
        // Get and set token
        try {
          const token = await AuthService.getIdToken();
          if (token) {
            dispatch(setToken(token));
          }
        } catch (error) {
          console.warn('Failed to get token after login:', error);
        }
      }
      
      // CRITICAL: After login, verify cart migration succeeded and retry if needed
      // Migration happens in authService, but we need to verify it worked
      setTimeout(async () => {
        try {
          // Get guest cart items before they're cleared (if still available)
          const { GuestCartService } = await import('./services/guestCartService');
          const guestSessionId = GuestCartService.getCurrentSessionId();
          let guestCartItems: any[] = [];
          
          if (guestSessionId) {
            try {
              const guestCart = await GuestCartService.getCart();
              guestCartItems = guestCart?.items || [];
              console.log('Guest cart items before migration verification:', guestCartItems.length);
            } catch (e) {
              console.log('Could not fetch guest cart (may already be cleared)');
            }
          }
          
          // Wait a bit for migration to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verify migration by checking authenticated cart
          let mergedCart = await CartService.getCart();
          const mergedItems = mergedCart?.items || [];
          const mergedTotalItems = mergedCart?.total_items || (mergedCart as any)?.items_count || 0;
          
          console.log('Post-login cart verification:', {
            mergedTotalItems,
            mergedItemsCount: mergedItems.length,
            guestItemsCount: guestCartItems.length
          });
          
          // If cart is empty but we had guest items, migration may have failed - retry
          if (mergedTotalItems === 0 && guestCartItems.length > 0) {
            console.warn('Cart migration may have failed - cart is empty but guest had items. Retrying migration...');
            
            try {
              // Retry migration
              const retryMergedCart = await CartService.migrateGuestCart();
              if (retryMergedCart) {
                mergedCart = retryMergedCart;
                const retryItems = retryMergedCart?.items || [];
                const retryTotalItems = retryMergedCart?.total_items || (retryMergedCart as any)?.items_count || 0;
                
                if (retryTotalItems > 0 && retryItems.length > 0) {
                  console.log('Cart migration retry succeeded:', {
                    totalItems: retryTotalItems,
                    itemsCount: retryItems.length
                  });
                } else {
                  console.error('Cart migration retry still returned empty cart');
                }
              }
            } catch (retryError) {
              console.error('Cart migration retry failed:', retryError);
            }
          }
          
          // Update cache with merged cart
          if (mergedCart) {
            updateCartQueries(queryClient, mergedCart, dispatch);
            console.log('Cart cache updated after login');
          } else {
            // Invalidate to force refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
          }
        } catch (error) {
          console.error('Error handling cart after login:', error);
          // Fallback: invalidate cache
          queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
        }
      }, 1000); // Wait 1 second for migration to complete
      
      // Refresh counters after login
      try {
        const cartCount = await CartService.getItemCount();
        dispatch(setCartCount(cartCount));
      } catch {
        dispatch(setCartCount(0));
      }
      
      try {
        const wishlistCount = await WishlistService.getWishlistCount();
        dispatch(setWishlistCount(wishlistCount));
      } catch {
        dispatch(setWishlistCount(0));
      }
    };

    const handleUserLogout = async () => {
      // Update Redux auth state
      dispatch(clearAuth());
      
      // Reset counters on logout
      dispatch(resetCounters());
      
      // Reinitialize counters for guest
      try {
        const cartCount = await CartService.getItemCount();
        dispatch(setCartCount(cartCount));
      } catch {
        dispatch(setCartCount(0));
      }
      
      try {
        const wishlistCount = await WishlistService.getWishlistCount();
        dispatch(setWishlistCount(wishlistCount));
      } catch {
        dispatch(setWishlistCount(0));
      }
    };

    window.addEventListener('loginRequired', handleLoginRequired as EventListener);
    window.addEventListener('userLoggedIn', handleUserLogin);
    window.addEventListener('userLoggedOut', handleUserLogout);
    
    return () => {
      window.removeEventListener('loginRequired', handleLoginRequired as EventListener);
      window.removeEventListener('userLoggedIn', handleUserLogin);
      window.removeEventListener('userLoggedOut', handleUserLogout);
    };
  }, [dispatch, queryClient]);

  return (
    <>
      <ScrollToTop />
      {showWelcome && (
        <WelcomeScreen onComplete={handleWelcomeComplete} duration={4000} />
      )}
      <div className="flex flex-col min-h-screen">
        {!isAdminRoute && <Navbar />}
        <main className={isAdminRoute ? 'flex-grow' : 'flex-grow'}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/products/moringa101" element={<MoringaProduct />} />
            <Route path="/moringa" element={<MoringaProduct />} />
            <Route path="/product/moringa/101" element={<MoringaProduct />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/recipe-submission" element={<RecipeSubmission />} />
            <Route path="/my-submissions" element={<MySubmissions />} />
            <Route path="/admin/portal" element={<AdminPortal />} />
            <Route path="/admin/reviews" element={<AdminPendingRecipes />} />
            <Route path="/admin/reviews/:reviewId" element={<AdminReviewDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:orderId" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/cancellation-refund" element={<CancellationRefund />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
      
      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={loginModalData.message}
        redirectUrl={loginModalData.redirectUrl}
      />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AppProvider>
  );
}

export default App;
