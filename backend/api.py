import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import io
import csv
from datetime import datetime
from ml_model import predict_cbc_values, train_model, load_model

app = Flask(__name__)
# Configure CORS to allow requests from specific origins with any headers
CORS(app, supports_credentials=True, resources={r"/*": {"origins": ["https://bioflow090.netlify.app", "http://localhost:8080", "http://localhost:5070", "*"], "allow_headers": "*", "expose_headers": "*"}})

# Try to load the model at startup
print("Initializing the ML model...")
try:
    model = load_model()
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    print("Will attempt to load or train the model when needed")

# Reference ranges for context
reference_ranges = {
    'RBC': {
        'male': {'low': 4.35, 'high': 5.65, 'unit': 'million cells/µL'},
        'female': {'low': 3.92, 'high': 5.13, 'unit': 'million cells/µL'}
    },
    'PCV': {
        'male': {'low': 41, 'high': 50, 'unit': '%'},
        'female': {'low': 36, 'high': 44, 'unit': '%'}
    },
    'MCV': {
        'male': {'low': 80, 'high': 100, 'unit': 'fL'},
        'female': {'low': 80, 'high': 100, 'unit': 'fL'}
    },
    'MCH': {
        'male': {'low': 27, 'high': 33, 'unit': 'pg'},
        'female': {'low': 27, 'high': 33, 'unit': 'pg'}
    },
    'MCHC': {
        'male': {'low': 33, 'high': 36, 'unit': 'g/dL'},
        'female': {'low': 33, 'high': 36, 'unit': 'g/dL'}
    },
    'RDW': {
        'male': {'low': 11.5, 'high': 14.5, 'unit': '%'},
        'female': {'low': 11.5, 'high': 14.5, 'unit': '%'}
    },
    'TLC': {
        'male': {'low': 5000, 'high': 10000, 'unit': 'cells/µL'},
        'female': {'low': 4500, 'high': 11000, 'unit': 'cells/µL'}
    },
    'PLT': {
        'male': {'low': 135000, 'high': 317000, 'unit': '/µL'},
        'female': {'low': 157000, 'high': 371000, 'unit': '/µL'}
    },
    'HGB': {
        'male': {'low': 13.2, 'high': 16.6, 'unit': 'g/dL'},
        'female': {'low': 11.6, 'high': 15.0, 'unit': 'g/dL'}
    }
}

valid_genders = ['male', 'female']

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print("Received data:", data)  # Debug logging

        # Extract data from request
        try:
            permittivity = float(data['permittivity'])
            age = int(data['age'])
            gender = data['gender'].lower()

            # Convert gender to 'M' or 'F' for the ML model
            sex = 'M' if gender == 'male' else 'F'
        except (ValueError, TypeError, KeyError) as e:
            return jsonify({
                'error': f'Invalid input values: {str(e)}. Age and permittivity must be valid numbers.'
            }), 400

        name = data.get('name', '')

        print(f"Extracted - Name: {name}, Age: {age}, Gender: {gender}, Permittivity: {permittivity}")

        # Validate gender
        if gender not in valid_genders:
            print(f"Invalid gender: '{gender}', Valid values are: {valid_genders}")
            return jsonify({
                'error': f'Invalid gender. Accepted values are {", ".join(valid_genders)}'
            }), 400

        # Validate permittivity range (based on CSV data)
        if permittivity < 24.8 or permittivity > 25.4:
            print(f"Warning: Permittivity value {permittivity} is out of expected range (24.8-25.4)")
            return jsonify({
                'error': f'Permittivity value {permittivity} is out of expected range (24.8-25.4)'
            }), 400

        # Use the ML model to predict CBC values
        prediction_result = predict_cbc_values(age, sex, permittivity)

        # Add status indications (low, normal, high)
        results = {}

        # Process each parameter
        for param in ['RBC', 'PCV', 'MCV', 'MCH', 'MCHC', 'RDW', 'TLC', 'PLT', 'HGB']:
            value = prediction_result[param]
            ref_range = reference_ranges[param][gender]

            # For TLC (WBC) and PLT, we need to adjust the values for comparison and display
            display_value = value
            compare_value = value

            # For TLC (WBC) and PLT, convert to absolute values (multiply by 1000)
            if param == 'TLC' or param == 'PLT':
                # The model predicts in lower values, but we want to display in absolute values
                # and compare with reference ranges in absolute values
                display_value = value * 1000  # Convert to absolute values for display
                compare_value = display_value  # Use the same value for comparison

            # Determine status
            status = 'low' if compare_value < ref_range['low'] else ('high' if compare_value > ref_range['high'] else 'normal')

            # Format value with unit
            formatted_value = f"{display_value} {ref_range['unit']}"

            # Add to results
            results[param.lower()] = {
                'value': formatted_value,
                'status': status,
                'reference_range': f"{ref_range['low']} - {ref_range['high']} {ref_range['unit']}"
            }

        # Format and return predictions
        response = {
            'name': name,
            'age': age,
            'gender': gender,
            'permittivity': permittivity,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'results': results
        }

        return jsonify(response)

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in predict route: {str(e)}\n{error_details}")
        return jsonify({'error': str(e)}), 400

@app.route('/test', methods=['GET'])
def test():
    return jsonify({
        'status': 'success',
        'message': 'API is working!'
    })

@app.route('/info', methods=['GET'])
def info():
    return jsonify({
        'status': 'running',
        'models_loaded': True,
        'valid_genders': valid_genders,
        'permittivity_range': '24.8 - 25.4',
        'version': '2.0'
    })

@app.route('/download-report', methods=['POST'])
def download_report():
    try:
        data = request.json

        # Extract patient information
        name = data.get('name', 'Patient')
        age = data.get('age', '')
        gender = data.get('gender', '')
        permittivity = data.get('permittivity', '')
        timestamp = data.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        results = data.get('results', {})

        # Create a CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow(['BioFlow CBC Report'])
        writer.writerow([f'Generated on: {timestamp}'])
        writer.writerow([])

        # Write patient information
        writer.writerow(['Patient Information'])
        writer.writerow(['Name', name])
        writer.writerow(['Age', age])
        writer.writerow(['Gender', gender])
        writer.writerow(['Permittivity', permittivity])
        writer.writerow([])

        # Write CBC results
        writer.writerow(['CBC Results'])
        writer.writerow(['Parameter', 'Value', 'Status', 'Reference Range'])

        # Add each parameter to the CSV
        for param_key, param_data in results.items():
            writer.writerow([
                param_key.upper(),
                param_data.get('value', ''),
                param_data.get('status', '').upper(),
                param_data.get('reference_range', '')
            ])

        # Add footer
        writer.writerow([])
        writer.writerow(['This report was generated by BioFlow AI and should be reviewed by a healthcare professional.'])
        writer.writerow(['BioFlow is not a diagnostic tool and does not replace medical advice.'])

        # Prepare the CSV for download
        output.seek(0)

        # Create a response with the CSV
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'BioFlow_CBC_Report_{name.replace(" ", "_")}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        )

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in download-report route: {str(e)}\n{error_details}")
        return jsonify({'error': str(e)}), 400

# Add a root endpoint for health checks
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'status': 'running',
        'message': 'BioFlow API is operational',
        'version': '2.0'
    })

if __name__ == "__main__":
    # Get port from environment variable for Render deployment
    port = int(os.environ.get("PORT", 5071))
    app.run(host='0.0.0.0', port=port, debug=True)
