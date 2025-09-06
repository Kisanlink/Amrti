import { useState, useEffect } from 'react';
import AuthService from '../services/authService';

export const useWelcomeScreen = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = AuthService.isAuthenticated();
    
    if (!isAuthenticated) {
      // If user is not logged in, always show welcome screen on reload
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // If user is logged in, check if welcome screen has been shown before
      const welcomeShown = localStorage.getItem('welcomeShown');
      
      if (!welcomeShown) {
        const timer = setTimeout(() => {
          setShowWelcome(true);
        }, 100);
        
        return () => clearTimeout(timer);
      } else {
        setHasShownWelcome(true);
      }
    }
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setHasShownWelcome(true);
    
    // Only mark as shown in localStorage if user is authenticated
    // This way, non-authenticated users will see welcome screen on every reload
    const isAuthenticated = AuthService.isAuthenticated();
    if (isAuthenticated) {
      localStorage.setItem('welcomeShown', 'true');
    }
  };

  const resetWelcome = () => {
    localStorage.removeItem('welcomeShown');
    setHasShownWelcome(false);
    setShowWelcome(true);
  };

  // Add function to clear login modal cooldown
  const clearLoginModalCooldown = () => {
    localStorage.removeItem('lastLoginModal');
  };

  return {
    showWelcome,
    hasShownWelcome,
    handleWelcomeComplete,
    resetWelcome,
    clearLoginModalCooldown
  };
};
