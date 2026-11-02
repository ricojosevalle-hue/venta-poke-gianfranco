// ========================================
// POKE-GIANFRANCO
// CONFIGURACIÓN FIREBASE
// ========================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import {
  getAuth
} from
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  getFirestore
} from
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";


// CONFIGURACIÓN DEL PROYECTO

const firebaseConfig = {
  apiKey: "AIzaSyBvm9QKl1QTs8GIFg3aEY9XS8Nyf0qm6oY",
  authDomain: "poke-gianfranco.firebaseapp.com",
  projectId: "poke-gianfranco",
  storageBucket: "poke-gianfranco.firebasestorage.app",
  messagingSenderId: "497241804342",
  appId: "1:497241804342:web:2d9e1097b433fad8ef5297"
};


// INICIAR FIREBASE

const app = initializeApp(firebaseConfig);


// AUTENTICACIÓN

const auth = getAuth(app);


// BASE DE DATOS

const db = getFirestore(app);


// EXPORTAR SERVICIOS

export {
  app,
  auth,
  db
};

console.log(
  "Firebase Poke-Gianfranco inicializado correctamente."
);