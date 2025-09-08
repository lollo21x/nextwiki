// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA27qqn90L4cs21nnlk9v3Erf6Svo82lQY",
  authDomain: "doot-inc.firebaseapp.com",
  projectId: "doot-inc",
  storageBucket: "doot-inc.firebasestorage.app",
  messagingSenderId: "361145205770",
  appId: "1:361145205770:web:728036d27c84429b05cbf3",
  measurementId: "G-E0DLQJPS1J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firebase Storage
export const storage = getStorage(app);
