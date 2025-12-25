import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "AIzaSyARGEPBqUQ7fB-4tSEhT4fWcR9Ff42jkCI",
  authDomain: "ludoconsulting-ac029.firebaseapp.com",
  projectId: "ludoconsulting-ac029",
  storageBucket: "ludoconsulting-ac029.appspot.com",
  messagingSenderId: "321462481374",
  appId: "1:321462481374:web:2c4d4eebcc8ee465306d4f",
  measurementId: "G-NHCPDXYC33",
};

export const ADMIN_EMAIL = "ludo.consulting3@gmail.com";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
