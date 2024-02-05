// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDuEeZxVGiYcUPdXF2BljsZv8ZPlfuRuSQ',
  authDomain: 'ispj-ahh.firebaseapp.com',
  projectId: 'ispj-ahh',
  storageBucket: 'ispj-ahh.appspot.com',
  messagingSenderId: '629815095093',
  appId: '1:629815095093:web:0fa321a4cfb9b1e8ea667c',
  measurementId: 'G-25H403R2WV',
}

// initialize firebase
const firebaseApp = initializeApp(firebaseConfig)

// initialize firebase authentication
export const firebaseAuth = getAuth(firebaseApp)
// initialize firebase cloud storage
export const firebaseStorage = getStorage(firebaseApp)
// initialize firebase firestore
export const firestoreDB = getFirestore(firebaseApp)
