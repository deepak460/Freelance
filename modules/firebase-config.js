// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB221RejvHWwYHPbMF4-J5NaU6g0sdAjEI",
    authDomain: "freelanceflow-93fa9.firebaseapp.com",
    projectId: "freelanceflow-93fa9",
    storageBucket: "freelanceflow-93fa9.firebasestorage.app",
    messagingSenderId: "296748017027",
    appId: "1:296748017027:web:677499aade0ad0188f82b6",
    measurementId: "G-C0GN3LHQ2G"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();