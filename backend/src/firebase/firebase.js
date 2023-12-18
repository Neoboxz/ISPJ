// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDuEeZxVGiYcUPdXF2BljsZv8ZPlfuRuSQ",
  authDomain: "ispj-ahh.firebaseapp.com",
  projectId: "ispj-ahh",
  storageBucket: "ispj-ahh.appspot.com",
  messagingSenderId: "629815095093",
  appId: "1:629815095093:web:0fa321a4cfb9b1e8ea667c",
  measurementId: "G-25H403R2WV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)