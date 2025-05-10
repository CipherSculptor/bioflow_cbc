// API configuration
// Using the actual Render backend URL for production
const apiUrl = "https://bioflow-cbc.onrender.com";

// Make the API URL available to the website
window.netlifyEnv = {
  API_URL: apiUrl,
};
