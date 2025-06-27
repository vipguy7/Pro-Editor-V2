import cv2 # For pixelation and potentially other image ops
import numpy as np # For image manipulation
import json # For printing metadata
# from ultralytics import YOLO # No longer needed
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# detect_faces function is removed as per new plan.

def draw_overlay_on_image(image_path_or_pil_image, regions_to_draw: list[dict[str, int]]):
    """
    Draws semi-transparent rectangles and numbers over specified regions.
    This function might be used for debugging or if the frontend needs an image with overlays.
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

    if not regions_to_draw:
        # print("No regions provided to draw.")
        return img.convert("RGB")

    overlay_img = Image.new("RGBA", img.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay_img)

    for i, box_data in enumerate(regions_to_draw):
        x, y, w, h = box_data["x"], box_data["y"], box_data["width"], box_data["height"]
        label = box_data.get("label", "Region") # Get label if provided

        rectangle_color = (0, 100, 255, 100) # Default blueish
        if "effect" in box_data: # Could color based on effect for debugging
            if box_data["effect"] == "blur":
                rectangle_color = (255, 165, 0, 100) # Orange for blur
            elif box_data["effect"] == "pixelate":
                rectangle_color = (0, 255, 0, 100) # Green for pixelate

        draw.rectangle([x, y, x + w, y + h], outline="blue", fill=rectangle_color, width=2)

        text_content = f"{label} {i + 1}"
        text_position = (x + 5, y + 5)
        try:
            font_size = max(15, int(h / 10))
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except IOError:
                font = ImageFont.load_default()
                if font_size > 15 : # Default font is small, adjust position
                     text_position = (x + 2, y + 2)
            text_bbox = draw.textbbox(text_position, text_content, font=font)
            text_bg_color = (255, 255, 255, 180)
            draw.rectangle(text_bbox, fill=text_bg_color)
            draw.text(text_position, text_content, fill="black", font=font)
        except Exception as e_font:
            print(f"Warning: Could not draw text for region {i+1} due to font error: {e_font}")
            # Draw simple small red square if text fails
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
def process_manual_regions(
    image_path_or_pil_image,
    user_regions_with_effects: list[dict] # Expects list of {x, y, width, height, effect, params}
) -> tuple[Image.Image | None, dict[str, any]]:
    """
    Applies blurring, pixelation, or stickers to user-defined regions in an image.
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
        "processed_regions_count": len(user_regions_with_effects),
        "processed_regions_details": []
    }
    # user_regions_with_effects are already sorted/ordered by user if needed, or processed as received.

    for i, region_data in enumerate(user_regions_with_effects):
        x = region_data.get("x")
        y = region_data.get("y")
        w = region_data.get("width")
        h = region_data.get("height")
        effect_type = region_data.get("effect") # 'effect' instead of 'type' from frontend
        params = region_data.get("params", {})
        shape = params.get("shape", "squared") # Get shape from params if available

        if None in [x, y, w, h, effect_type]:
            print(f"Warning: Invalid region data for region index {i}. Skipping. Data: {region_data}")
            continue

        effect_log_params = {}

        if effect_type == "blur":
            intensity = params.get("intensity", 10)
            output_image = apply_gaussian_blur(output_image, x, y, w, h, intensity, shape)
            effect_log_params = {"intensity": intensity, "shape": shape}
        elif effect_type == "pixelate":
            block_size = params.get("block_size", 10) # block_size from params
            output_image = apply_pixelation(output_image, x, y, w, h, block_size, shape)
            effect_log_params = {"block_size": block_size, "shape": shape}
        elif effect_type == "sticker":
            sticker_id = params.get("sticker_id", "default_sticker.png")
            output_image = apply_sticker(output_image, x, y, w, h, sticker_id)
            effect_log_params = {"sticker_id": sticker_id}
        elif effect_type == "none": # Explicitly handle 'none' if sent
            print(f"Info: Region index {i} has effect 'none'. Skipping processing for this region.")
            continue
        else:
            print(f"Warning: Unknown effect type '{effect_type}' for region index {i}. Skipping.")
            continue

        metadata["processed_regions_details"].append({
            "region_index": i,
            "coordinates": {"x": x, "y": y, "width": w, "height": h},
            "effect_applied": effect_type,
            "parameters": effect_log_params
        })
    return output_image, metadata

# --- Main execution for testing (updated for manual regions) ---
if __name__ == "__main__":
    sample_image_filename = "sample.jpg"
    # overlay_output_filename = "sample_with_overlay.jpg" # Overlay test can be separate
    processed_output_filename = "sample_processed_manual.jpg"

    # Create/load dummy sample image
    try:
        current_img = Image.open(sample_image_filename).convert("RGB")
    except FileNotFoundError:
        current_img = Image.new("RGB", (800, 600), color="lightgray")
        draw_on_current = ImageDraw.Draw(current_img)
        draw_on_current.rectangle([100, 100, 200, 300], fill="lightblue", outline="black") # Object 1
        draw_on_current.rectangle([300, 150, 400, 400], fill="lightgreen", outline="black") # Object 2
        draw_on_current.rectangle([500, 50, 700, 250], fill="pink", outline="black") # Object 3
        try:
            font = ImageFont.truetype("arial.ttf", 40)
        except IOError:
            font = ImageFont.load_default()
        draw_on_current.text((50, 50), "Sample Test Image", fill="black", font=font)
        current_img.save(sample_image_filename)

    # Test process_manual_regions
    print("\n--- Testing process_manual_regions ---")

    # Simulate regions and effects defined by a user on the frontend
    user_defined_regions_and_effects = [
        {
            "x": 100, "y": 100, "width": 100, "height": 200, # Corresponds to Object 1
            "effect": "blur",
            "params": {"intensity": 20, "shape": "rounded"}
        },
        {
            "x": 300, "y": 150, "width": 100, "height": 250, # Corresponds to Object 2
            "effect": "pixelate",
            "params": {"block_size": 15, "shape": "squared"}
        },
        {
            "x": 500, "y": 50, "width": 200, "height": 200, # Corresponds to Object 3
            "effect": "sticker",
            "params": {"sticker_id": "non_existent_sticker.png"} # Will use default sticker
        },
        {
            "x": 10, "y": 10, "width": 50, "height": 50,
            "effect": "none" # Should be skipped
        },
        { # Invalid effect type
            "x": 600, "y": 400, "width": 50, "height": 50,
            "effect": "unknown_effect",
            "params": {}
        },
    ]

    processed_image, metadata = process_manual_regions(
        current_img.copy(),
        user_defined_regions_and_effects
    )

    if processed_image and metadata:
        processed_image.save(processed_output_filename)
        print(f"\nProcessed image with manual regions saved to '{processed_output_filename}'")
        print("\nProcessing Metadata:")
        print(json.dumps(metadata, indent=2))

        expected_ops_count = 3 # blur, pixelate, sticker
        if len(metadata["processed_regions_details"]) == expected_ops_count:
             print(f"\nCorrect number of operations processed ({expected_ops_count}).")
        else:
             print(f"\nWarning: Expected {expected_ops_count} processed operations, got {len(metadata['processed_regions_details'])}")
    else:
        print("\nFailed to process manual regions.")

    # Test overlay drawing with the same manual regions for visualization
    overlay_output_filename = "sample_with_manual_overlays.jpg"
    image_with_manual_overlays = draw_overlay_on_image(current_img.copy(), user_defined_regions_and_effects)
    if image_with_manual_overlays:
        image_with_manual_overlays.save(overlay_output_filename)
        print(f"Image with visual MANUAL region overlays saved to '{overlay_output_filename}'")


    print("\n--- Main test block finished ---")
    print(f"Please visually inspect '{overlay_output_filename}' and '{processed_output_filename}'.")
