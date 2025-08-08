
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAyZ7Brayq847LBAS1-ybvv--6Z_6EWax0",
  authDomain: "flowtaskai-wdiy4.firebaseapp.com",
  projectId: "flowtaskai-wdiy4",
  storageBucket: "flowtaskai-wdiy4.appspot.com",
  messagingSenderId: "563461762912",
  appId: "1:563461762912:web:ff87b7b2a21fa767dff805"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
