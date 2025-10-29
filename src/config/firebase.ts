// Firebase configuration (updated to match backend expectations)
// Note: This uses reCAPTCHA v2 for Firebase phone authentication (required by Firebase)
// reCAPTCHA v3 is handled separately in utils/recaptchaV3.ts for login form protection
const firebaseConfig = {
    apiKey: "AIzaSyCPzNrFV3Q6a4rcAQF-60G3h3K1WBQqQFI",
    authDomain: "amrti-m1355.firebaseapp.com",
    projectId: "amrti-m1355",
    storageBucket: "amrti-m1355.firebasestorage.app",
    messagingSenderId: "261470136593",
    appId: "1:261470136593:web:167ab30b6a363e461244b0",
    measurementId: "G-8GT1Y5QCL2"
};

// reCAPTCHA site key that matches backend expectations
const RECAPTCHA_SITE_KEY = "6LfXi_QrAAAAAL4qkNyc4gmOiRoPswIfKEhD7LZZ";

// Global variables (exact same as working HTML)
let firebase: any = null;
let auth: any = null;
let recaptchaVerifier: any = null;

// Initialize Firebase (exact same as working HTML)
export const initializeFirebase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Firebase is not available in this environment'));
      return;
    }

    // Check if Firebase is already loaded
    if ((window as any).firebase) {
      console.log('Firebase already loaded, initializing...');
      firebase = (window as any).firebase;
      
      // Initialize Firebase if not already initialized
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      
      auth = firebase.auth();
      console.log('Firebase initialized successfully');
      resolve();
      return;
    }

    console.log('Firebase not loaded, waiting for scripts...');
    
    // Wait for Firebase to load
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds with 100ms intervals
    
    const checkFirebase = () => {
      attempts++;
      console.log(`Checking for Firebase... attempt ${attempts}/${maxAttempts}`);
      
      // Check if Firebase is available and has the required modules
      if ((window as any).firebase && (window as any).firebase.auth) {
        console.log('Firebase loaded! Initializing...');
        firebase = (window as any).firebase;
        
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        
        auth = firebase.auth();
        console.log('Firebase initialized successfully');
        resolve();
      } else if (attempts >= maxAttempts) {
        console.error('Firebase failed to load after maximum attempts');
        console.error('Available window properties:', Object.keys(window).filter(key => key.includes('firebase')));
        reject(new Error('Firebase failed to load within 10 seconds. Please refresh the page.'));
      } else {
        // Check again after a short delay
        setTimeout(checkFirebase, 100);
      }
    };
    
    // Start checking
    checkFirebase();
  });
};

// Get Firebase instance
export const getFirebase = async (): Promise<any> => {
  if (!firebase) {
    await initializeFirebase();
  }
  return firebase;
};

// Get auth instance
export const getAuth = async (): Promise<any> => {
  if (!auth) {
    await initializeFirebase();
  }
  return auth;
};

// Initialize reCAPTCHA for phone authentication (updated to match backend expectations)
export const initializeRecaptcha = async (): Promise<void> => {
  if (!recaptchaVerifier) {
    const firebase = await getFirebase();
    
    recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response: any) => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired. Please try again.');
        recaptchaVerifier = null; // Reset verifier
      }
    });
    
    // Render the reCAPTCHA
    recaptchaVerifier.render().then((widgetId: any) => {
      console.log('reCAPTCHA rendered with widget ID:', widgetId);
    }).catch((error: any) => {
      console.error('Error rendering reCAPTCHA:', error);
      throw new Error('Failed to load reCAPTCHA. Please refresh the page.');
    });
  }
};

// Get reCAPTCHA token (exact same as working HTML)
export const getRecaptchaToken = async (): Promise<string> => {
  if (!recaptchaVerifier) {
    throw new Error('reCAPTCHA not initialized');
  }
  
  return recaptchaVerifier.verify();
};

// Clear reCAPTCHA (exact same as working HTML)
export const clearRecaptcha = (): void => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
};

// Export the Firebase instance
export default getFirebase;