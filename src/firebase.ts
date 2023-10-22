import {initializeApp} from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";

export const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY, // cSpell:ignore VITE_FIREBASE_APIKEY
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN, // cSpell:ignore VITE_FIREBASE_AUTHDOMAIN
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASEURL, // cSpell:ignore VITE_FIREBASE_DATABASEURL
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID, // cSpell:ignore VITE_FIREBASE_PROJECTID
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET, // cSpell:ignore VITE_FIREBASE_STORAGEBUCKET
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID, // cSpell:ignore VITE_FIREBASE_MESSAGINGSENDERID
  appId: import.meta.env.VITE_FIREBASE_APPID,
});

export const storage = getStorage(firebaseApp);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const provider = new GoogleAuthProvider();
