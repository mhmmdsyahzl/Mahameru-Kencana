import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCFIX3Fryf_xp67YjceColb9W-AbvNWRSc",
  authDomain: "jejakrimba-3b49a.firebaseapp.com",
  projectId: "jejakrimba-3b49a",
  storageBucket: "jejakrimba-3b49a.firebasestorage.app",
  messagingSenderId: "419442432731",
  appId: "1:419442432731:web:9afc79b7e06c1418398afe"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Mengaktifkan mode offline persistence & auto-sync otomatis
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistence gagal karena banyak tab browser yang terbuka.');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser tidak mendukung fitur offline persistence.');
  }
});