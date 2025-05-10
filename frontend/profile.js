document.addEventListener('DOMContentLoaded', () => {
    const profileButton = document.getElementById('profileButton');
    const profileDropdown = document.getElementById('profileDropdown');
    
    // Toggle profile dropdown
    profileButton.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileButton.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });

    // Load and display user details
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    
    // Check if we have user details
    if (!userDetails.name) {
        // If no details found, redirect to details page
        window.location.href = 'details.html';
        return;
    }
    
    // Update profile information
    document.getElementById('profileName').textContent = userDetails.name || '-';
    document.getElementById('profileAge').textContent = userDetails.age || '-';
    document.getElementById('profileGender').textContent = userDetails.gender || '-';
    document.getElementById('profilePermittivity').textContent = userDetails.permittivity || '-';

    // Add profile dropdown menu item
    const profileLink = document.createElement('a');
    profileLink.href = 'profile.html';
    profileLink.textContent = 'Profile';
    profileDropdown.insertBefore(profileLink, profileDropdown.firstChild);
});
