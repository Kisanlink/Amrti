import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';

// Your Firebase configuration
// You'll get this from your Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyCFbFvgShiJkWMBfFh36tqA6544h4KnA-0",
    authDomain: "amrti-fa98b.firebaseapp.com",
    projectId: "amrti-fa98b",
    storageBucket: "amrti-fa98b.firebasestorage.app",
    messagingSenderId: "200445373107",
    appId: "1:200445373107:web:c729bc33b707f82e271ec6",
    measurementId: "G-46MVLMC6ZB"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// reCAPTCHA configuration
export const RECAPTCHA_SITE_KEY = "6LfXi_QrAAAAAL4qkNyc4gmOiRoPswIfKEhD7LZZ";

// Function to get reCAPTCHA token
export const getRecaptchaToken = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('reCAPTCHA is not available in this environment'));
      return;
    }

    // Check if grecaptcha is available
    if (typeof (window as any).grecaptcha === 'undefined') {
      reject(new Error('reCAPTCHA is not loaded'));
      return;
    }

    (window as any).grecaptcha.ready(() => {
      (window as any).grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'phone_auth' })
        .then((token: string) => {
          resolve(token);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  });
};

// Export the app instance if needed elsewhere
export default app;
