import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# The target URL for the AI service, allowing for dynamic model selection
AI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/"

@app.route('/api/proxy', methods=['POST'])
def proxy():
    # Get the user's API key from the request header, if it exists
    user_api_key = request.headers.get('X-AIME-API-Key')

    # Get the default API key from environment variables
    default_api_key = os.getenv('API_KEY')

    # Use the user's key if provided, otherwise use the default key
    api_key_to_use = user_api_key or default_api_key

    if not api_key_to_use:
        return jsonify({"error": "API key is not configured on the server and was not provided by the user."}), 500

    # Get the JSON body from the incoming request
    request_data = request.get_json()

    # Extract the model from the request data, with a fallback
    model = request_data.pop('model', 'gemini-pro')

    # Determine the correct endpoint based on the model name
    if 'imagen' in model:
        endpoint = 'predict'
    else:
        endpoint = 'generateContent'

    api_url = f"{AI_API_BASE_URL}{model}:{endpoint}"


    # Set up the headers for the request to the AI service
    headers = {
        'Content-Type': 'application/json',
    }

    # Set up the query parameters, including the API key
    params = {
        'key': api_key_to_use
    }

    try:
        # Forward the request to the AI service
        response = requests.post(api_url, params=params, headers=headers, json=request_data)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

        # Return the JSON response from the AI service to the client
        return jsonify(response.json()), response.status_code

    except requests.exceptions.RequestException as e:
        # Handle network errors or bad responses from the AI service
        error_message = f"Failed to connect to AI service: {e}"
        # Try to get more specific error info from the response if available
        try:
            error_details = e.response.json()
            error_message = error_details.get("error", {}).get("message", error_message)
        except (ValueError, AttributeError):
            pass # No JSON in response, stick with the original error.

        return jsonify({"error": error_message}), getattr(e.response, 'status_code', 500)

if __name__ == '__main__':
    app.run(port=5001, debug=True)