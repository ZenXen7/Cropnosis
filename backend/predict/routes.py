from flask import Flask, jsonify, request, Blueprint
import pandas as pd
import base64
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import os
from io import BytesIO
from .models import db, ScanHistory
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")



predict_bp = Blueprint('predict', __name__)


from flask_cors import CORS

model = load_model('finalcropnoses.keras')

class_names = ['Bacterial', 'Fungal', 'Healthy']





@predict_bp.route('/result', methods=['POST'])
def predict():


    client = genai.Client(api_key=api_key)

   


    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    img_file = request.files['image']

    if img_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Load and preprocess the image
    img = image.load_img(BytesIO(img_file.read()), target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)  
    img_array /= 255.0  
    

    


    # Predict
    predictions = model.predict(img_array)
    predicted_index = np.argmax(predictions)
    predicted_class = class_names[predicted_index]
    confidence = float(predictions[0][predicted_index])


    prompt = (
    f"Briefly explain what the plant disease '{predicted_class}' is in about 2 sentences. "
    f"Include its causes, symptoms, and effects on the plant.\n\n"
    f"Then, provide at least three simple tips to treat or prevent '{predicted_class}'. "
    f"1. Tip 1\n"
    f"2. Tip 2\n"
    f"3. Tip 3\n\n"
    f"Keep everything short, clear, and easy to understand. and also in the tips ensure this following format: 1. Improve Air Circulation: Space plants adequately to allow for good airflow and reduce humidity, a breeding ground for fungi.\n instead of **Improve Air Circulation:** Space plants adequately to allow for good airflow and reduce humidity, a breeding ground for fungi. "
    )


    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )


    print(f"Predicted class: {predicted_class}, Confidence: {confidence}")

    return jsonify({
        "predicted_class": predicted_class,
        "confidence": round(confidence, 2) * 100,
        "recommendation": response.text
    })



@predict_bp.route('/save_result', methods=['POST'])
def save_result():
    data = request.json
    disease = data.get('disease')
    confidence = data.get('confidence')
    image_data = data.get('image') 

    if not disease or confidence is None or not image_data:
        return jsonify({'error': 'Missing required data'}), 400

    try:
        # Decode image from base64
        header, encoded = image_data.split(",", 1)
        img_bytes = base64.b64decode(encoded)

        # Save to DB
        new_scan = ScanHistory(
            user_id=1,
            disease=disease,
            confidence=confidence,
            image_data=img_bytes
        )
        db.session.add(new_scan)
        db.session.commit()

        return jsonify({'message': 'Result saved successfully! ✅'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500