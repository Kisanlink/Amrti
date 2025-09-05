import { useState, useEffect } from 'react';

export const useWelcomeScreen = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    // Check if welcome screen has been shown in this session
    const welcomeShown = sessionStorage.getItem('welcomeShown');
    
    if (!welcomeShown) {
      setShowWelcome(true);
    } else {
      setHasShownWelcome(true);
    }
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setHasShownWelcome(true);
    // Mark as shown in session storage
    sessionStorage.setItem('welcomeShown', 'true');
  };

  const resetWelcome = () => {
    sessionStorage.removeItem('welcomeShown');
    setHasShownWelcome(false);
    setShowWelcome(true);
  };

  return {
    showWelcome,
    hasShownWelcome,
    handleWelcomeComplete,
    resetWelcome
  };
};
