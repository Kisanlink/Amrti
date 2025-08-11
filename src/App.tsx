import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WelcomeScreen from './components/ui/WelcomeScreen';
import ScrollToTop from './components/ui/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import ProductDetail from './pages/ProductDetail';
import MoringaProduct from './pages/MoringaProduct';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Privacy from './pages/Privacy';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import CancellationRefund from './pages/CancellationRefund';
  
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/moringa/101" element={<MoringaProduct />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/return" element={<Returns />} />
        <Route path="/TnC" element={<Terms />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cancellation-refund" element={<CancellationRefund />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [showWelcome, setShowWelcome] = useState(false); // Bypass welcome screen

  const handleWelcomeComplete = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };

  return (
    <AppProvider>
      <NotificationProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-beige-200">
            <AnimatePresence>
              {showWelcome && (
                <WelcomeScreen onComplete={handleWelcomeComplete} />
              )}
            </AnimatePresence>

            {!showWelcome && (
              <>
                <Navbar />
                <AnimatedRoutes />
                <Footer />
              </>
            )}
          </div>
        </Router>
      </NotificationProvider>
    </AppProvider>
  );
}

export default App;
