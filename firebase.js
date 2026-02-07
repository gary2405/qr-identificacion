import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "qr-identificacion.firebaseapp.com",
  databaseURL: "https://qr-identificacion-default-rtdb.firebaseio.com",
  projectId: "qr-identificacion",
  storageBucket: "qr-identificacion.appspot.com",
  messagingSenderId: "331843010145",
  appId: "1:331843010145:web:8b064c80fe57c06d53f420"
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);
const storage = getStorage(app);

export { db, storage };
