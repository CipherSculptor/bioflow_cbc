# BioFlow - Blood Test Prediction Application

BioFlow is a web application that uses machine learning to predict blood test values based on age, gender, and permittivity measurements.

## Project Structure

The project is divided into two main parts:

- **Frontend**: HTML/CSS/JavaScript application
- **Backend**: Flask API with machine learning model

## Deployment Instructions

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect to your GitHub repository
3. Configure the following settings:
   - **Name**: bioflow-2
   - **Environment**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `gunicorn --chdir backend wsgi:app`
   - **Root Directory**: `/`

4. Add the following environment variables:
   - `PYTHON_VERSION`: 3.9.0

5. Deploy the service

### Frontend Deployment (Netlify)

1. Create a new site on Netlify
2. Connect to your GitHub repository
3. Configure the following settings:
   - **Base directory**: `frontend`
   - **Build command**: (leave empty)
   - **Publish directory**: `/`

4. Add the following environment variables:
   - `API_URL`: https://bioflow-2.onrender.com (or your Render backend URL)

5. Deploy the site

## Local Development

### Backend

1. Navigate to the backend directory:
   ```
   cd bioflow-clean/backend
   ```

2. Create a virtual environment:
   ```
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   ```
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run the development server:
   ```
   python api.py
   ```

### Frontend

The frontend is a static HTML/CSS/JavaScript application. You can open the `index.html` file directly in your browser for local development.

To use a local backend server, update the `apiUrl` variable in `dashboard.js` to point to your local server (e.g., `http://localhost:5071`).

## Features

- User authentication with Firebase
- Blood test prediction based on age, gender, and permittivity
- PDF report generation
- Responsive design

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Flask, Python, scikit-learn
- **Authentication**: Firebase
- **Deployment**: Render (backend), Netlify (frontend)
