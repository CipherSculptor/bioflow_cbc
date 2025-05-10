import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Define the path to the CSV file
csv_file_path = os.path.join(os.path.dirname(__file__), 'CBC data_for_meandeley.csv')
model_path = os.path.join(os.path.dirname(__file__), 'cbc_prediction_model.pkl')

def train_model():
    """Train the machine learning model and save it to disk."""
    try:
        print(f"Loading data from {csv_file_path}")
        # Load the data - the file has a non-standard format
        # First, read the raw content
        with open(csv_file_path, 'r') as f:
            lines = f.readlines()

        # Skip the first 3 lines (header rows)
        data_lines = lines[3:]

        # Create a list of dictionaries for each row
        data_list = []
        for line in data_lines:
            if line.strip():  # Skip empty lines
                values = line.strip().split(',')
                if len(values) >= 13:  # Ensure we have enough columns
                    data_list.append({
                        'S_No': values[0],
                        'Age': values[1],
                        'Sex': values[2],
                        'RBC': values[3],
                        'PCV': values[4],
                        'MCV': values[5],
                        'MCH': values[6],
                        'MCHC': values[7],
                        'RDW': values[8],
                        'TLC': values[9],
                        'PLT': values[10],
                        'HGB': values[11],
                        'Permittivity_Real': values[12]
                    })

        # Create DataFrame
        data = pd.DataFrame(data_list)
        print(f"Data loaded successfully with {len(data)} rows")

        # Print column names for debugging
        print("Columns in the dataset:", data.columns.tolist())

        # Convert columns to numeric
        numeric_columns = ['Age', 'Sex', 'RBC', 'PCV', 'MCV', 'MCH', 'MCHC', 'RDW', 'TLC', 'PLT', 'HGB', 'Permittivity_Real']
        for col in numeric_columns:
            if col in data.columns:
                data[col] = pd.to_numeric(data[col], errors='coerce')

        # Convert numeric sex to M/F (0 = female, 1 = male)
        data['Sex_Original'] = data['Sex']  # Keep original for reference
        data['Sex'] = data['Sex'].apply(lambda x: 'M' if x == 1 else 'F')

        # Drop rows with missing values
        data = data.dropna(subset=['Age', 'Sex', 'RBC', 'PCV', 'MCV', 'MCH', 'MCHC', 'RDW', 'TLC', 'PLT', 'HGB', 'Permittivity_Real'])

        print(f"Data after preprocessing: {len(data)} rows")
        print("Sample data:")
        print(data.head())

        # Define features and target variables
        X = data[['Age', 'Sex', 'Permittivity_Real']]
        y = data[['RBC', 'PCV', 'MCV', 'MCH', 'MCHC', 'RDW', 'TLC', 'PLT', 'HGB']]

        print(f"Features shape: {X.shape}, Target shape: {y.shape}")

        # Split the data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Create preprocessing steps for numerical and categorical features
        numeric_features = ['Age', 'Permittivity_Real']
        categorical_features = ['Sex']

        numeric_transformer = StandardScaler()
        categorical_transformer = OneHotEncoder(drop='first')

        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numeric_features),
                ('cat', categorical_transformer, categorical_features)
            ])

        # Create the model pipeline
        model = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', MLPRegressor(hidden_layer_sizes=(100, 50),
                                      activation='relu',
                                      solver='adam',
                                      alpha=0.0001,
                                      batch_size='auto',
                                      learning_rate='adaptive',
                                      max_iter=1000,
                                      random_state=42))
        ])

        # Train the model
        print("Training the model...")
        model.fit(X_train, y_train)

        # Evaluate the model
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)

        print(f"Model trained with Mean Squared Error: {mse:.4f}")
        print(f"R² Score: {r2:.4f}")

        # Save the model to disk
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)

        print(f"Model saved to {model_path}")

        return model

    except Exception as e:
        import traceback
        print(f"Error training model: {str(e)}")
        print(traceback.format_exc())
        return None

def load_model():
    """Load the trained model from disk."""
    try:
        # Check if model exists
        if not os.path.exists(model_path):
            print(f"Model file not found at {model_path}. Training a new model.")
            return train_model()

        # Load the model
        with open(model_path, 'rb') as f:
            model = pickle.load(f)

        print(f"Model loaded from {model_path}")
        return model

    except Exception as e:
        print(f"Error loading model: {str(e)}")
        print("Training a new model instead.")
        return train_model()

def predict_cbc_values(age, sex, permittivity):
    """
    Predict CBC values based on age, sex, and permittivity using the trained model.

    Args:
        age (int): Age of the person
        sex (str): Sex of the person ('M' or 'F')
        permittivity (float): Permittivity value

    Returns:
        dict: Predicted CBC values
    """
    try:
        # Load the model
        model = load_model()

        if model is None:
            raise ValueError("Failed to load or train the model")

        # Prepare input data
        input_data = pd.DataFrame({
            'Age': [age],
            'Sex': [sex],
            'Permittivity_Real': [permittivity]
        })

        # Make prediction
        prediction = model.predict(input_data)[0]

        # Create result dictionary
        result = {}
        target_columns = ['RBC', 'PCV', 'MCV', 'MCH', 'MCHC', 'RDW', 'TLC', 'PLT', 'HGB']

        for i, col in enumerate(target_columns):
            # Round appropriately based on the parameter
            if col in ['RBC', 'MCH', 'MCHC', 'RDW', 'HGB']:
                result[col] = round(prediction[i], 2)
            elif col in ['PCV', 'MCV']:
                result[col] = round(prediction[i], 1)
            elif col in ['TLC', 'PLT']:
                result[col] = int(round(prediction[i]))

        print(f"Prediction successful: {result}")
        return result

    except Exception as e:
        import traceback
        print(f"Error in prediction: {str(e)}")
        print(traceback.format_exc())

        # Fallback to rule-based approach if model fails
        print("Using fallback rule-based approach for prediction")
        return rule_based_prediction(age, sex, permittivity)

def rule_based_prediction(age, sex, permittivity):
    """Fallback rule-based prediction if the ML model fails."""
    # Base values (typical normal ranges)
    base_values = {
        'RBC': 4.8 if sex.upper() == 'M' else 4.3,
        'PCV': 45 if sex.upper() == 'M' else 40,
        'MCV': 90,
        'MCH': 30,
        'MCHC': 33,
        'RDW': 13.0,
        'TLC': 7500,
        'PLT': 250000,
        'HGB': 15.0 if sex.upper() == 'M' else 13.0
    }

    # Age factor (older age slightly decreases values)
    age_factor = 1.0 - (max(0, age - 30) * 0.002)

    # Permittivity factor (higher permittivity slightly increases values)
    normalized_permittivity = max(24.8, min(25.4, permittivity))
    perm_factor = 1.0 + ((normalized_permittivity - 25.1) * 0.2)

    # Apply factors and add some randomness
    import random
    result = {}
    for param, base_value in base_values.items():
        # Apply factors with some randomness
        adjusted_value = base_value * age_factor * perm_factor * random.uniform(0.95, 1.05)

        # Round appropriately
        if param in ['RBC', 'MCH', 'MCHC', 'RDW', 'HGB']:
            result[param] = round(adjusted_value, 2)
        elif param in ['PCV', 'MCV']:
            result[param] = round(adjusted_value, 1)
        elif param in ['TLC', 'PLT']:
            result[param] = int(round(adjusted_value))

    return result

if __name__ == "__main__":
    # Train the model if run directly
    train_model()
