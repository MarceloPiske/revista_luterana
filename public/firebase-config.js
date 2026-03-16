// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyDYSIY3zAj6gsvscWWZBzF1Juu-UQoNFI8",
    authDomain: "acervo-luterano.firebaseapp.com",
    projectId: "acervo-luterano",
    storageBucket: "acervo-luterano.firebasestorage.app",
    messagingSenderId: "561041322186",
    appId: "1:561041322186:web:031b6c399d9ab0929d4433",
    measurementId: "G-D36RK4VRV8"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

// Exportar para usar nos outros ficheiros
export { app, auth, db, analytics, googleProvider };