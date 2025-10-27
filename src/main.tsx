import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import AuthService from './services/authService'

// Wait for Firebase scripts to load, then initialize
const initializeApp = async () => {
  try {
    // Wait for Firebase scripts to be loaded
    await new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve(undefined);
      }
    });
    
    // Additional wait for Firebase scripts
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Initializing Firebase authentication...');
    await AuthService.initialize();
    AuthService.setupListeners();
    console.log('Firebase authentication initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
};

// Initialize the app
initializeApp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
