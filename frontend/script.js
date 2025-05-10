document.addEventListener('DOMContentLoaded', () => {
    console.log("Login page loaded");
    const loginForm = document.getElementById('loginForm');
    const loginStatus = document.getElementById('login-status');
    
    // Check Firebase initialization
    if (typeof firebase === 'undefined') {
        console.error("ERROR: Firebase is not defined. Check if the SDK is loaded correctly.");
        showMessage("Error: Authentication service unavailable", true);
    } else {
        console.log("Firebase is defined");
        try {
            const auth = firebase.auth();
            console.log("Firebase auth is initialized");
        } catch (e) {
            console.error("Error initializing Firebase auth:", e);
        }
    }
    
    // Helper function to show status messages
    function showMessage(message, isError = false) {
        console.log("Showing message:", message, "isError:", isError);
        loginStatus.textContent = message;
        loginStatus.style.display = 'block';
        loginStatus.style.backgroundColor = isError ? '#ffdddd' : '#ddffdd';
        loginStatus.style.color = isError ? '#990000' : '#006600';
        
        // Hide the message after 5 seconds
        setTimeout(() => {
            loginStatus.style.display = 'none';
        }, 5000);
    }
    
    // Email/Password Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        showMessage('Signing in...');
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log('User signed in:', user);
                showMessage('Login successful! Redirecting...');
                
                // Redirect to dashboard after successful login
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            })
            .catch((error) => {
                console.error('Login error:', error.code, error.message);
                
                // Handle specific error codes
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    showMessage('Invalid email or password. Please try again.', true);
                } else if (error.code === 'auth/invalid-email') {
                    showMessage('Please enter a valid email address.', true);
                } else {
                    showMessage('Login failed: ' + error.message, true);
                }
            });
    });

    // Forgot password link
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            const email = prompt('Enter your email address to reset your password:');
            
            if (email) {
                firebase.auth().sendPasswordResetEmail(email)
                    .then(() => {
                        showMessage('Password reset email sent. Please check your inbox.');
                    })
                    .catch((error) => {
                        console.error('Password reset error:', error);
                        showMessage('Failed to send reset email: ' + error.message, true);
                    });
            }
        });
    }
});
