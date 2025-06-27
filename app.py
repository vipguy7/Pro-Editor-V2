import os
import uuid
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import face_processor # Your existing script
from PIL import Image

# Configuration
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER

# Ensure upload and processed directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/detect_faces', methods=['POST'])
def detect_faces_route():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = str(uuid.uuid4()) + "_" + filename
        original_image_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

        try:
            file.save(original_image_path)

            # Get image dimensions
            with Image.open(original_image_path) as img:
                width, height = img.size

            # Use your face_processor to detect faces
            detected_boxes = face_processor.detect_faces(original_image_path)

            return jsonify({
                "message": "Faces detected successfully",
                "boxes": detected_boxes,
                "image_filename": unique_filename, # Send filename for later reference
                "image_dimensions": {"width": width, "height": height}
            }), 200
        except Exception as e:
            app.logger.error(f"Error in face detection: {e}")
            return jsonify({"error": str(e)}), 500
        # Not deleting the original uploaded image yet, as it might be needed for apply_effects
    else:
        return jsonify({"error": "File type not allowed"}), 400

@app.route('/api/apply_effects', methods=['POST'])
def apply_effects_route():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    image_filename = data.get('image_filename')
    selections = data.get('selections') # List of {"index": int, "type": "blur"|"pixelate", "params": {...}}

    if not image_filename or selections is None: # selections can be an empty list
        return jsonify({"error": "Missing image_filename or selections"}), 400

    original_image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)

    if not os.path.exists(original_image_path):
        return jsonify({"error": "Original image not found on server. It might have been cleared or an invalid filename was sent."}), 404

    try:
        # We need the original detected boxes again.
        # Ideally, the client would send them, or we re-run detection.
        # For simplicity, let's assume client might need to send original_detected_boxes
        # or we re-detect. Re-detecting is safer if client doesn't cache them.
        # However, process_selected_faces expects detected_boxes.
        # Let's modify the API to expect detected_boxes from the client for this endpoint.

        detected_boxes = data.get('detected_boxes')
        if detected_boxes is None:
             # Fallback: re-detect if not provided. This adds overhead.
             # print("Warning: detected_boxes not provided by client for apply_effects. Re-detecting...")
             detected_boxes = face_processor.detect_faces(original_image_path)


        # Ensure selections are in the format process_selected_faces expects
        # The python script expects selections like:
        # [{"index": 0, "type": "blur", "intensity": 15, "shape": "rounded"}, ...]
        # The client might send:
        # [{"index": 0, "effect": "blur", "params": {"intensity": 15, "shape": "rounded"}}]
        # We need to map this.

        formatted_selections = []
        for sel in selections:
            fs = {"index": sel.get("index"), "type": sel.get("effect")}
            if sel.get("params"):
                fs.update(sel.get("params"))
            formatted_selections.append(fs)

        processed_image_pil, metadata = face_processor.process_selected_faces(
            original_image_path,
            detected_boxes,
            formatted_selections
        )

        if processed_image_pil:
            processed_filename = "processed_" + str(uuid.uuid4()) + "_" + image_filename.split('_', 1)[-1] # Keep original name part
            processed_image_path = os.path.join(app.config['PROCESSED_FOLDER'], processed_filename)
            processed_image_pil.save(processed_image_path)

            # Clean up the original uploaded image for this session after processing
            # try:
            #     os.remove(original_image_path)
            # except OSError as e:
            #     app.logger.error(f"Error deleting original uploaded file {original_image_path}: {e}")

            return send_file(processed_image_path, mimetype='image/png') # Or appropriate mimetype
        else:
            return jsonify({"error": "Failed to process image", "details": metadata}), 500

    except Exception as e:
        app.logger.error(f"Error in applying effects: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001) # Using port 5001 to avoid conflict with Vite dev server
