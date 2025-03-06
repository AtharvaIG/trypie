
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC7wAXj6G7u_H4RVZjh1BNs-XYdklUrXGs",
  authDomain: "trvltrbe.firebaseapp.com",
  projectId: "trvltrbe",
  storageBucket: "trvltrbe.firebasestorage.app",
  messagingSenderId: "653442919921",
  appId: "1:653442919921:web:6b8c34fb86fa7e2a02e850",
  databaseURL: "https://trvltrbe-default-rtdb.firebaseio.com" // Add this line for Realtime Database
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
