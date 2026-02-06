// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbMcYZ0BcsUSTTXvxbe5WNaKfVUsbM_Rk",
  authDomain: "qr-identificacion.firebaseapp.com",
  databaseURL: "https://qr-identificacion-default-rtdb.firebaseio.com",
  projectId: "qr-identificacion",
  storageBucket: "qr-identificacion.firebasestorage.app",
  messagingSenderId: "331843010145",
  appId: "1:331843010145:web:8b064c80fe57c06d53f420"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };