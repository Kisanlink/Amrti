import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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

// Export the app instance if needed elsewhere
export default app;
