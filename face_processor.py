import cv2 # For pixelation and potentially other image ops
import numpy as np # For image manipulation
import json # For printing metadata
from ultralytics import YOLO
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def detect_faces(image_path: str) -> list[dict[str, int]]:
    """
    Detects faces in an image using YOLOv8.

    Args:
        image_path: Path to the input image.

    Returns:
        A list of dictionaries, where each dictionary contains the
        bounding box coordinates (x, y, width, height) for a detected face.
    """
    try:
        # Try to open PIL image first, in case image_path is actually a PIL image object
        if isinstance(image_path, Image.Image):
            img = image_path
        else:
            img = Image.open(image_path)
    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path}")
        return []
    except Exception as e:
        print(f"Error opening image: {e}")
        return []

    # Load a standard YOLOv8 model (e.g., yolov8n.pt)
    # This model is for general object detection. We will filter for 'person' class (ID 0).
    model_name = "yolov8n.pt"
    try:
        # print(f"Loading YOLO model: {model_name} (this may trigger a download)")
        model = YOLO(model_name)
        # print(f"YOLO model {model_name} loaded successfully.")
    except Exception as e:
        print(f"Error loading YOLO model '{model_name}': {e}")
        return []

    # Perform detection
    try:
        # We are looking for class 0 (person)
        results = model(img, classes=[0], verbose=False)
    except Exception as e:
        print(f"Error during person detection: {e}")
        return []

    detected_persons = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            class_id = int(box.cls[0].cpu().numpy()) if box.cls is not None else -1
            if class_id == 0:
                xyxy = box.xyxy[0].cpu().numpy()
                x_min, y_min, x_max, y_max = int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])
                person_bbox = {
                    "x": x_min, "y": y_min,
                    "width": x_max - x_min, "height": y_max - y_min,
                    "label": "person"
                }
                detected_persons.append(person_bbox)
    # print(f"Returning {len(detected_persons)} 'person' bounding boxes as face proxies.")
    return detected_persons


def draw_overlay_on_image(image_path_or_pil_image, detected_boxes: list[dict[str, int]]):
    """
    Draws semi-transparent rectangles and numbers over detected faces/persons.
    """
    try:
        if isinstance(image_path_or_pil_image, str):
            img = Image.open(image_path_or_pil_image).convert("RGBA")
        elif isinstance(image_path_or_pil_image, Image.Image):
            img = image_path_or_pil_image.convert("RGBA")
        else:
            raise ValueError("Input must be an image path or a PIL Image object.")
    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path_or_pil_image}")
        return None
    except Exception as e:
        print(f"Error opening or converting image: {e}")
        return None

    if not detected_boxes:
        # print("No boxes provided to draw.")
        return img.convert("RGB")

    overlay_img = Image.new("RGBA", img.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay_img)

    for i, box_data in enumerate(detected_boxes):
        x, y, w, h = box_data["x"], box_data["y"], box_data["width"], box_data["height"]
        rectangle_color = (0, 100, 255, 100)
        draw.rectangle([x, y, x + w, y + h], outline="blue", fill=rectangle_color, width=2)

        text_content = str(i + 1)
        text_position = (x + 5, y + 5)
        try:
            font_size = max(15, int(h / 10))
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except IOError:
                font = ImageFont.load_default()
                if font_size > 15 :
                     text_position = (x + 2, y + 2)
            text_bbox = draw.textbbox(text_position, text_content, font=font)
            text_bg_color = (255, 255, 255, 180)
            draw.rectangle(text_bbox, fill=text_bg_color)
            draw.text(text_position, text_content, fill="black", font=font)
        except Exception as e_font:
            print(f"Warning: Could not draw text for box {i+1} due to font error: {e_font}")
            draw.rectangle([x, y, x+10, y+10], fill="red")

    img = Image.alpha_composite(img, overlay_img)
    return img.convert("RGB")


# --- Helper function to create a mask ---
def _create_mask(size, shape="squared", corner_radius_percent=0.2):
    """Creates a mask (PIL Image 'L') of given size and shape."""
    if shape == "rounded":
        mask = Image.new('L', size, 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0) + size, fill=255)
    else: # squared
        mask = Image.new('L', size, 255)
    return mask

# --- Image modification functions ---
def apply_gaussian_blur(image: Image.Image, x: int, y: int, width: int, height: int,
                        intensity: int = 10, shape: str = "squared") -> Image.Image:
    """Applies Gaussian blur to a specified region of the image."""
    if width <= 0 or height <= 0: return image.copy()
    roi = image.crop((x, y, x + width, y + height))
    blurred_roi = roi.filter(ImageFilter.GaussianBlur(radius=intensity))
    mask = _create_mask((width, height), shape)
    modified_image = image.copy()
    modified_image.paste(blurred_roi, (x, y), mask=mask)
    return modified_image

def apply_pixelation(image: Image.Image, x: int, y: int, width: int, height: int,
                     block_size: int = 10, shape: str = "squared") -> Image.Image:
    """Applies pixelation to a specified region of the image."""
    if width <= 0 or height <= 0 or block_size <= 0: return image.copy()
    roi_pil = image.crop((x, y, x + width, y + height))
    roi_cv = cv2.cvtColor(np.array(roi_pil), cv2.COLOR_RGB2BGR)
    h_roi, w_roi = roi_cv.shape[:2]
    temp_img = cv2.resize(roi_cv, (max(1, w_roi // block_size), max(1, h_roi // block_size)),
                          interpolation=cv2.INTER_LINEAR)
    pixelated_roi_cv = cv2.resize(temp_img, (w_roi, h_roi),
                                  interpolation=cv2.INTER_NEAREST)
    pixelated_roi_pil = Image.fromarray(cv2.cvtColor(pixelated_roi_cv, cv2.COLOR_BGR2RGB))
    mask = _create_mask((width, height), shape)
    modified_image = image.copy()
    modified_image.paste(pixelated_roi_pil, (x, y), mask=mask)
    return modified_image

def apply_sticker(image: Image.Image, x: int, y: int, width: int, height: int,
                  sticker_image_or_path) -> Image.Image:
    """Applies a sticker to a specified region of the image."""
    if width <= 0 or height <= 0: return image.copy()

    try:
        if isinstance(sticker_image_or_path, str):
            sticker = Image.open(sticker_image_or_path).convert("RGBA")
        elif isinstance(sticker_image_or_path, Image.Image):
            sticker = sticker_image_or_path.convert("RGBA")
        else:
            print("Warning: Sticker path/object invalid. Using default.")
            # Create a simple default sticker (e.g., yellow circle)
            sticker = Image.new("RGBA", (100, 100), (0,0,0,0))
            draw = ImageDraw.Draw(sticker)
            draw.ellipse((0,0,99,99), fill="yellow", outline="black")
    except Exception as e:
        print(f"Warning: Could not load sticker '{sticker_image_or_path}'. Using default. Error: {e}")
        sticker = Image.new("RGBA", (100, 100), (0,0,0,0)) # Transparent default
        draw = ImageDraw.Draw(sticker)
        draw.ellipse((0,0,99,99), fill="yellow", outline="black")


    # Resize sticker to fit the bounding box (maintaining aspect ratio if desired, simple fill here)
    sticker_resized = sticker.resize((width, height), Image.Resampling.LANCZOS)

    modified_image = image.copy()
    # The sticker itself should have an alpha channel for transparency
    modified_image.paste(sticker_resized, (x, y), mask=sticker_resized)
    return modified_image


# --- Main processing function ---
def process_selected_faces(
    image_path_or_pil_image,
    detected_boxes: list[dict],
    selections: list[dict]
) -> tuple[Image.Image | None, dict[str, any]]:
    """
    Applies blurring, pixelation, or stickers to selected faces in an image.
    """
    try:
        if isinstance(image_path_or_pil_image, str):
            current_image = Image.open(image_path_or_pil_image).convert("RGB")
        elif isinstance(image_path_or_pil_image, Image.Image):
            current_image = image_path_or_pil_image.convert("RGB")
        else:
            raise ValueError("Input must be an image path or a PIL Image object.")
    except Exception as e:
        print(f"Error loading image: {e}")
        return None, {}

    output_image = current_image.copy()
    metadata = {
        "original_image_size": {"width": current_image.width, "height": current_image.height},
        "detected_faces_count": len(detected_boxes),
        "processed_faces": [],
        "all_detected_boxes": detected_boxes
    }
    selections.sort(key=lambda s: s.get("index", -1))

    for sel in selections:
        box_index = sel.get("index")
        effect_type = sel.get("type")
        shape = sel.get("shape", "squared")

        if box_index is None or not (0 <= box_index < len(detected_boxes)):
            print(f"Warning: Invalid box index {box_index} in selection. Skipping.")
            continue

        box = detected_boxes[box_index]
        x, y, w, h = box["x"], box["y"], box["width"], box["height"]
        effect_params = {}

        if effect_type == "blur":
            intensity = sel.get("intensity", 10)
            output_image = apply_gaussian_blur(output_image, x, y, w, h, intensity, shape)
            effect_params = {"intensity": intensity, "shape": shape}
        elif effect_type == "pixelate":
            block_size = sel.get("block_size", 10)
            output_image = apply_pixelation(output_image, x, y, w, h, block_size, shape)
            effect_params = {"block_size": block_size, "shape": shape}
        elif effect_type == "sticker":
            sticker_id = sel.get("sticker_id", "default_sticker.png") # Expects a path or an identifier
            # In a real app, sticker_id might map to a preloaded image or a path.
            # For this example, apply_sticker handles a path or makes a default if path is bad.
            output_image = apply_sticker(output_image, x, y, w, h, sticker_id)
            effect_params = {"sticker_id": sticker_id} # Log which sticker was intended
        else:
            print(f"Warning: Unknown effect type '{effect_type}' for box index {box_index}. Skipping.")
            continue

        metadata["processed_faces"].append({
            "original_box_index": box_index,
            "coordinates": box,
            "effect_applied": effect_type,
            "parameters": effect_params
        })
    return output_image, metadata

# --- Main execution for testing ---
if __name__ == "__main__":
    sample_image_filename = "sample.jpg"
    overlay_output_filename = "sample_with_overlay.jpg"
    processed_output_filename = "sample_processed.jpg"

    # Create/load dummy sample image
    try:
        current_img = Image.open(sample_image_filename)
        # print(f"Using existing '{sample_image_filename}' for testing.")
    except FileNotFoundError:
        # print(f"Creating a dummy '{sample_image_filename}' for testing.")
        current_img = Image.new("RGB", (800, 600), color="lightgray")
        draw_on_current = ImageDraw.Draw(current_img)
        draw_on_current.rectangle([100, 100, 200, 300], fill="lightblue", outline="black")
        draw_on_current.rectangle([300, 150, 400, 400], fill="lightgreen", outline="black")
        try:
            font = ImageFont.truetype("arial.ttf", 40)
        except IOError:
            font = ImageFont.load_default()
        draw_on_current.text((50, 50), "Sample Test Image", fill="black", font=font)
        current_img.save(sample_image_filename)
        # print(f"Dummy '{sample_image_filename}' created.")

    # Test face detection (will likely find 0 in dummy image)
    # print(f"\nAttempting to detect persons in '{sample_image_filename}'...")
    persons_detected = detect_faces(sample_image_filename) # Pass filename
    # if persons_detected:
    #     print(f"Detected {len(persons_detected)} 'person(s)'.")
    # else:
    #     print("No persons detected.")

    # Test overlay drawing with predefined boxes
    # print("\n--- Testing overlay drawing with predefined boxes ---")
    predefined_boxes = [
        {"x": 50, "y": 50, "width": 150, "height": 200, "label": "predefined1"},
        {"x": 250, "y": 100, "width": 100, "height": 120, "label": "predefined2"},
        {"x": 400, "y": 200, "width": 200, "height": 150, "label": "predefined3"}
    ]
    image_with_predefined_overlays = draw_overlay_on_image(current_img.copy(), predefined_boxes)
    if image_with_predefined_overlays:
        predefined_overlay_filename = "sample_with_predefined_overlays.jpg"
        image_with_predefined_overlays.save(predefined_overlay_filename)
        # print(f"Image with PREDEFINED overlays saved to '{predefined_overlay_filename}'")

    # Test process_selected_faces
    # print("\n--- Testing process_selected_faces ---")
    user_selections = [
        {"index": 0, "type": "blur", "intensity": 15, "shape": "rounded"},
        {"index": 1, "type": "pixelate", "block_size": 20, "shape": "squared"},
        {"index": 2, "type": "blur", "intensity": 5, "shape": "squared"},
        {"index": 0, "type": "pixelate", "block_size": 8, "shape": "squared"}, # Overwrites previous on index 0
        {"index": 99, "type": "blur"}, # Invalid index
        {"index": 1, "type": "unknown_effect"}, # Invalid effect
        {
            "index": 2, "type": "sticker", "sticker_id": "non_existent_sticker.png"
            # This will cause apply_sticker to use its default yellow circle.
            # This also overwrites the blur previously applied to index 2.
        }
    ]

    processed_image, metadata = process_selected_faces(
        current_img.copy(), # Use a fresh copy of the loaded/created image
        predefined_boxes,
        user_selections
    )

    if processed_image and metadata:
        processed_image.save(processed_output_filename)
        print(f"\nProcessed image saved to '{processed_output_filename}'")
        print("\nProcessing Metadata:")
        print(json.dumps(metadata, indent=2))
        # Check for warnings from invalid selections
        # Expected operations:
        # 1. index 0 blur (overwritten)
        # 2. index 1 pixelate
        # 3. index 2 blur (overwritten)
        # 4. index 0 pixelate (final for index 0)
        # 5. index 2 sticker (final for index 2)
        # Total 5 logged operations.
        expected_ops_count = 5
        if len(metadata["processed_faces"]) == expected_ops_count:
             print(f"\nCorrect number of operations processed ({expected_ops_count}).")
        else:
             print(f"\nWarning: Expected {expected_ops_count} processed operations, got {len(metadata['processed_faces'])}")

    else:
        print("\nFailed to process selected faces.")

    print("\n--- Main test block finished ---")
    print(f"Please visually inspect '{predefined_overlay_filename}' and '{processed_output_filename}'.")
