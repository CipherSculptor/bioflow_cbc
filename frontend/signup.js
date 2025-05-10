document.addEventListener('DOMContentLoaded', () => {
    console.log("Signup page loaded");
    const signupForm = document.getElementById('signupForm');
    const signupStatus = document.getElementById('signup-status');
    
    // Helper function to show status messages
    function showMessage(message, isError = false) {
        signupStatus.textContent = message;
        signupStatus.style.display = 'block';
        signupStatus.style.backgroundColor = isError ? '#ffdddd' : '#ddffdd';
        signupStatus.style.color = isError ? '#990000' : '#006600';
        
        // Hide the message after 5 seconds
        setTimeout(() => {
            signupStatus.style.display = 'none';
        }, 5000);
    }
    
    // Email/Password Signup
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const displayName = document.getElementById('displayName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Basic validation
        if (password !== confirmPassword) {
            showMessage('Passwords do not match. Please try again.', true);
            return;
        }
        
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters long.', true);
            return;
        }
        
        showMessage('Creating your account...');
        
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up
                const user = userCredential.user;
                console.log('User created:', user);
                
                // Update profile with display name
                return user.updateProfile({
                    displayName: displayName
                });
            })
            .then(() => {
                showMessage('Account created successfully! Redirecting...');
                
                // Redirect to dashboard after successful signup
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            })
            .catch((error) => {
                console.error('Signup error:', error.code, error.message);
                
                // Handle specific error codes
                if (error.code === 'auth/email-already-in-use') {
                    showMessage('This email is already in use. Try logging in instead.', true);
                } else if (error.code === 'auth/invalid-email') {
                    showMessage('Please enter a valid email address.', true);
                } else if (error.code === 'auth/weak-password') {
                    showMessage('Password is too weak. Please choose a stronger password.', true);
                } else {
                    showMessage('Signup failed: ' + error.message, true);
                }
            });
    });
});
