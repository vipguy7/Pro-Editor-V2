import os
import uuid
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import face_processor # Your existing script, now simplified
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

# Route for initial image upload (kept for consistency if frontend still uploads first)
# This route might not be strictly necessary if image is sent directly with regions for processing,
# but keeping it allows the frontend to upload and get a filename reference.
@app.route('/api/upload_image', methods=['POST'])
def upload_image_route():
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
            with Image.open(original_image_path) as img:
                width, height = img.size

            return jsonify({
                "message": "Image uploaded successfully",
                "image_filename": unique_filename,
                "image_dimensions": {"width": width, "height": height}
            }), 200
        except Exception as e:
            app.logger.error(f"Error saving uploaded image: {e}")
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "File type not allowed"}), 400


@app.route('/api/apply_effects', methods=['POST'])
def apply_effects_route():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    image_filename = data.get('image_filename')
    # Expects regions: list of {x, y, width, height, effect, params}
    user_regions_with_effects = data.get('regions')

    if not image_filename or user_regions_with_effects is None:
        return jsonify({"error": "Missing image_filename or regions data"}), 400

    original_image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)

    if not os.path.exists(original_image_path):
        # This could also mean the client is sending an image directly as base64 along with regions.
        # For now, we assume image_filename refers to a previously uploaded image.
        return jsonify({"error": f"Original image not found on server: {image_filename}"}), 404

    try:
        # The user_regions_with_effects should be directly usable by process_manual_regions
        # It expects: list of {x, y, width, height, effect (blur/pixelate), params (intensity/block_size, shape)}

        # Example frontend data for a region:
        # { "id": "manual-1", "x": 50, "y": 60, "width": 100, "height": 120,
        #   "effect": "blur", "params": { "intensity": 15, "shape": "rounded" } }
        # The `id` is frontend-specific, backend uses the list.
        # `face_processor.process_manual_regions` expects 'effect' and 'params' directly.

        processed_image_pil, metadata = face_processor.process_manual_regions(
            original_image_path,
            user_regions_with_effects # Pass directly
        )

        if processed_image_pil:
            # Generate a new filename for the processed image to avoid overwriting
            base, ext = os.path.splitext(image_filename.split('_', 1)[-1]) # Get original name part
            processed_filename = f"processed_{str(uuid.uuid4())}_{base}{ext}"
            processed_image_path = os.path.join(app.config['PROCESSED_FOLDER'], processed_filename)
            processed_image_pil.save(processed_image_path)

            # Optional: Clean up the original uploaded image if it's single-use per session
            # try:
            #     os.remove(original_image_path)
            # except OSError as e:
            #     app.logger.error(f"Error deleting original uploaded file {original_image_path}: {e}")

            return send_file(processed_image_path, mimetype=f'image/{ext.lstrip(".")}')
        else:
            return jsonify({"error": "Failed to process image with manual regions", "details": metadata}), 500

    except Exception as e:
        app.logger.error(f"Error in applying effects to manual regions: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
