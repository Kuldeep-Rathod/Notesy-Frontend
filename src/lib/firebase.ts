// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyAy8xfF0UDbPNUZw2rTn55hP4QW3zdtfj0',
    authDomain: 'test-7364d.firebaseapp.com',
    projectId: 'test-7364d',
    storageBucket: 'test-7364d.firebasestorage.app',
    messagingSenderId: '517087563522',
    appId: '1:517087563522:web:90062ac6a310b316cd3c1b',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
