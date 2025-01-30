// import { getStorage } from "firebase/storage";
import firebase from 'firebase/compat/app';
import "firebase/compat/storage";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';

const app = firebase.initializeApp({
  apiKey: "AIzaSyB44iy9mhMWQsav40sMpwcVaaI88XWeMxk",
  authDomain: "tesis-mobility.firebaseapp.com",
  projectId: "tesis-mobility",
  storageBucket: "tesis-mobility.firebasestorage.app",
  messagingSenderId: "936567345609",
  appId: "1:936567345609:web:21dd1c1e2d6649a319d818",
  measurementId: "G-D69C6T620P"
})

const db = app.firestore()
const authentication = app.auth()
const storage = app.storage()
const functions = app.functions()

// export { database, authentication, storage }
export { db, authentication, storage, functions }
