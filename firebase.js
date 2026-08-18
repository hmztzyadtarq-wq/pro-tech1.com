// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/analytics.js";
// لو هتحتاج قاعدة البيانات أو التخزين مستقبلاً بتستدعيهم من هنا برضه

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzFacVVTAe2fMvCDXwexfd6Wi7cI7_1gc",
    authDomain: "bro-tech-mane.firebaseapp.com",
    projectId: "bro-tech-mane",
    storageBucket: "bro-tech-mane.firebasestorage.app",
    messagingSenderId: "391259453925",
    appId: "1:391259453925:web:0fdf19af7e23d469bb970c",
    measurementId: "G-467280QJFT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };