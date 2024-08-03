// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzMKKqK_Y4U_w0YHEgryUlHMOKX5XTHrg",
  authDomain: "amrti-675c7.firebaseapp.com",
  projectId: "amrti-675c7",
  storageBucket: "amrti-675c7.appspot.com",
  messagingSenderId: "739166640710",
  appId: "1:739166640710:web:44fad55f60e613dd570847",
  measurementId: "G-X011SBYWKS",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const messaging = getMessaging(app);
