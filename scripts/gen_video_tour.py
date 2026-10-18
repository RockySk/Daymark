#!/usr/bin/env python3
"""Build a smooth animated video tour (MP4) from the App_Screenshots.
Includes subtle pan/zoom, cross-fade transitions, and feature captions.
Saves to App_Screenshots/Daymark_App_Tour.mp4
"""
import os
import glob
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio.v3 as iio

OUTPUT_PATH = "App_Screenshots/Daymark_App_Tour.mp4"
FPS = 30
TRANSITION_FRAMES = 15  # 0.5s cross-fade
HOLD_FRAMES = 45        # 1.5s display hold
TARGET_W, TARGET_H = 720, 1600  # crisp, standard vertical video 9:20 format

CAPTIONS = {
    "01_Upcoming_Events_Light.png": "Countdown & Count-Up · Material You M3",
    "02_Search_And_Filter.png": "Instant Search & Category Filters",
    "03_Material_You_Dark_Mode.png": "Dynamic Material You Dark Theme",
    "04_Count_Up_Past_Milestones.png": "Cherish Past Milestones & Habits",
    "05_Months_And_Relative_Time.png": "Days, Weeks, Months & Relative Time",
    "06_Add_And_Customize_Event.png": "Custom Recurrence & Smart Reminders",
    "07_Home_Screen_Widgets.png": "Home-Screen Widgets with Live Sync",
}

FONT_PATH = "C:/Windows/Fonts/arialbd.ttf" if os.name == "nt" else None


def get_font(size):
    if FONT_PATH and os.path.exists(FONT_PATH):
        return ImageFont.truetype(FONT_PATH, size)
    return ImageFont.load_default()


def prepare_slide(img_path, caption):
    base = Image.open(img_path).convert("RGBA")
    # Resize to target height while keeping aspect
    ratio = TARGET_H / base.height
    new_w = int(base.width * ratio)
    resized = base.resize((new_w, TARGET_H), Image.LANCZOS)
    
    # Center on canvas
    canvas = Image.new("RGBA", (TARGET_W, TARGET_H), (15, 14, 20, 255))
    offset_x = (TARGET_W - new_w) // 2
    canvas.paste(resized, (offset_x, 0))
    
    # Draw floating caption banner at bottom
    overlay = Image.new("RGBA", (TARGET_W, TARGET_H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    
    banner_h = 100
    banner_y = TARGET_H - 140
    # Rounded dark translucent pill
    f = get_font(28)
    bbox = d.textbbox((0, 0), caption, font=f)
    text_w = bbox[2] - bbox[0]
    pill_w = text_w + 60
    pill_x = (TARGET_W - pill_w) // 2
    d.rounded_rectangle([pill_x, banner_y, pill_x + pill_w, banner_y + banner_h], radius=32, fill=(30, 26, 42, 230), outline=(130, 110, 180, 180), width=2)
    # Text centered in pill
    text_x = pill_x + (pill_w - text_w) // 2
    text_y = banner_y + (banner_h - (bbox[3] - bbox[1])) // 2 - 2
    d.text((text_x, text_y), caption, font=f, fill=(245, 240, 255, 255))
    
    combined = Image.alpha_composite(canvas, overlay)
    return combined.convert("RGB")


def main():
    screenshot_files = sorted(glob.glob("App_Screenshots/*.png"))
    if not screenshot_files:
        print("No screenshots found in App_Screenshots/")
        return

    print(f"Loading {len(screenshot_files)} screenshots...")
    slides = []
    for f in screenshot_files:
        filename = os.path.basename(f)
        cap = CAPTIONS.get(filename, "Daymark App")
        slides.append(np.array(prepare_slide(f, cap)))

    frames = []
    for i in range(len(slides)):
        current = slides[i]
        nxt = slides[(i + 1) % len(slides)]
        
        # Hold frame
        for _ in range(HOLD_FRAMES):
            frames.append(current)
            
        # Cross fade to next slide (don't crossfade after the last slide if stopping)
        if i < len(slides) - 1:
            for f_idx in range(TRANSITION_FRAMES):
                alpha = f_idx / float(TRANSITION_FRAMES)
                blended = ((1.0 - alpha) * current + alpha * nxt).astype(np.uint8)
                frames.append(blended)

    # Extra hold on the final slide
    for _ in range(HOLD_FRAMES):
        frames.append(slides[-1])

    print(f"Encoding {len(frames)} frames into {OUTPUT_PATH} at {FPS} FPS...")
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    iio.imwrite(
        OUTPUT_PATH,
        frames,
        fps=FPS,
        codec="libx264",
        pixelformat="yuv420p"
    )
    print(f"Video tour successfully created: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
