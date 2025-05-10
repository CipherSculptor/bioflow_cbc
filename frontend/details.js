document.addEventListener('DOMContentLoaded', () => {
    const profileButton = document.getElementById('profileButton');
    const profileDropdown = document.getElementById('profileDropdown');
    const detailsForm = document.getElementById('detailsForm');
    
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
    
    // Pre-fill form with existing data if available
    const existingData = JSON.parse(localStorage.getItem('userDetails') || '{}');
    if (existingData.name) {
        detailsForm.querySelector('input[placeholder="Enter your Name"]').value = existingData.name;
        detailsForm.querySelector('input[placeholder="Enter your Age"]').value = existingData.age;
        detailsForm.querySelector('input[placeholder="Enter your Gender"]').value = existingData.gender;
        detailsForm.querySelector('input[placeholder="Enter your Permittivity Value"]').value = existingData.permittivity;
    }
    
    // Handle form submission
    detailsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            name: detailsForm.querySelector('input[placeholder="Enter your Name"]').value,
            age: detailsForm.querySelector('input[placeholder="Enter your Age"]').value,
            gender: detailsForm.querySelector('input[placeholder="Enter your Gender"]').value,
            permittivity: detailsForm.querySelector('input[placeholder="Enter your Permittivity Value"]').value
        };
        
        // Store data in localStorage
        localStorage.setItem('userDetails', JSON.stringify(formData));
        
        console.log('Details submitted:', formData);
        alert('Details saved successfully!');
        
        // Redirect to profile page
        window.location.href = 'profile.html';
    });
});
