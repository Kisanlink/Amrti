import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import MoringaProduct from './pages/MoringaProduct';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
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

function App() {
  const { showWelcome, handleWelcomeComplete } = useWelcomeScreen();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalData, setLoginModalData] = useState({
    message: 'Please login to continue',
    redirectUrl: '/'
  });

  // Listen for login required events
  useEffect(() => {
    const handleLoginRequired = (event: CustomEvent) => {
      setLoginModalData({
        message: event.detail.message || 'Please login to continue',
        redirectUrl: event.detail.redirectUrl || window.location.pathname
      });
      setShowLoginModal(true);
    };

    window.addEventListener('loginRequired', handleLoginRequired as EventListener);
    
    return () => {
      window.removeEventListener('loginRequired', handleLoginRequired as EventListener);
    };
  }, []);

  return (
    <AppProvider>
      <NotificationProvider>
        <Router>
          <ScrollToTop />
          {showWelcome && (
            <WelcomeScreen onComplete={handleWelcomeComplete} duration={4000} />
          )}
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
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
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
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
            <Footer />
          </div>
          
          {/* Login Required Modal */}
          <LoginRequiredModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            message={loginModalData.message}
            redirectUrl={loginModalData.redirectUrl}
          />
        </Router>
      </NotificationProvider>
    </AppProvider>
  );
}

export default App;
