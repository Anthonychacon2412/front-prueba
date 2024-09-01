// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB44iy9mhMWQsav40sMpwcVaaI88XWeMxk",
  authDomain: "tesis-mobility.firebaseapp.com",
  projectId: "tesis-mobility",
  storageBucket: "tesis-mobility.appspot.com",
  messagingSenderId: "936567345609",
  appId: "1:936567345609:web:21dd1c1e2d6649a319d818",
  measurementId: "G-D69C6T620P"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app)
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
})

export {auth, db }