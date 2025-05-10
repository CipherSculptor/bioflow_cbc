// Firebase configuration
// IMPORTANT: Replace these placeholder values with your actual Firebase project details
const firebaseConfig = {
  apiKey: "AIzaSyDke3AA-kFclSQglyUjr6d6ZeOJrqT6jmU",
  authDomain: "bioflow-4968a.firebaseapp.com",
  projectId: "bioflow-4968a",
  storageBucket: "bioflow-4968a.appspot.com",
  messagingSenderId: "339595950669",
  appId: "1:339595950669:web:e28956a44e14241ffbfa04",
  measurementId: "G-T3ZZCB22N5",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Check if user is already signed in
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in
    console.log("User is already signed in:", user);

    // If on login page, redirect to dashboard
    if (
      window.location.pathname.includes("index.html") ||
      window.location.pathname === "/" ||
      window.location.pathname === ""
    ) {
      window.location.href = "dashboard.html";
    }
  } else {
    // No user is signed in
    console.log("No user is signed in");
  }
});
