import json # For printing metadata (used by draw_overlay_on_image potentially through label)
# from ultralytics import YOLO # No longer needed
# import cv2 # No longer needed for server-side effects
# import numpy as np # No longer needed for server-side effects
# from PIL import Image, ImageDraw, ImageFont, ImageFilter # ImageFilter not needed

# All effect processing functions (detect_faces, process_manual_regions, apply_gaussian_blur, etc.)
# are removed as effects will be handled client-side with brushes.
# The script is kept for potential future utility functions or if server-side
# processing is re-introduced for other purposes.
# The draw_overlay_on_image function is kept as it might be useful for debugging overlays generally.

from PIL import Image, ImageDraw, ImageFont # Keep PIL for draw_overlay_on_image

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

# All specific effect application functions (apply_gaussian_blur, apply_pixelation, _create_mask, apply_sticker)
# and the main processing function (process_manual_regions) are removed as these effects
# will now be handled client-side.

# The `if __name__ == "__main__":` block is also removed as its target functions are gone.
# If `draw_overlay_on_image` needs testing, it can be done with a simpler specific test case.
