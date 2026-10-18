from PIL import Image, ImageDraw, ImageFont
import os

BASE = r"c:\Users\Sourabh K\Documents\My Projects\Date Count\Date-count"
RES = os.path.join(BASE, "android", "app", "src", "main", "res")
BG_COLOR = (103, 80, 164)  # #6750A4

# Load new Daymark foreground icon
fg_path = os.path.join(RES, "mipmap-xxxhdpi", "ic_launcher_foreground.png")
fg = Image.open(fg_path).convert("RGBA")

# --- drawable/icon.png (splash icon shown by Android 12+ SplashScreen API) ---
icon = Image.new("RGBA", (1024, 1024), BG_COLOR + (255,))
fg_resized = fg.resize((700, 700), Image.LANCZOS)
offset = ((1024 - 700) // 2, (1024 - 700) // 2)
icon.paste(fg_resized, offset, fg_resized)
icon.save(os.path.join(RES, "drawable", "icon.png"))
print("icon.png done")

# --- branding.png ("Daymark" text) ---
branding_w, branding_h = 400, 80
branding = Image.new("RGBA", (branding_w, branding_h), (0, 0, 0, 0))
draw = ImageDraw.Draw(branding)
try:
    font = ImageFont.truetype("arial.ttf", 52)
except:
    font = ImageFont.load_default()
bbox = draw.textbbox((0, 0), "Daymark", font=font)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
x = (branding_w - tw) // 2
y = (branding_h - th) // 2 - bbox[1]
draw.text((x, y), "Daymark", fill=(255, 255, 255, 255), font=font)
branding.save(os.path.join(RES, "drawable", "branding.png"))
print("branding.png done")

# --- splash.png for every density folder ---
splash_sizes = {
    "drawable": (480, 800),
    "drawable-land-hdpi": (800, 480),
    "drawable-land-mdpi": (480, 320),
    "drawable-land-xhdpi": (1280, 720),
    "drawable-land-xxhdpi": (1600, 960),
    "drawable-land-xxxhdpi": (1920, 1080),
    "drawable-port-hdpi": (480, 800),
    "drawable-port-mdpi": (320, 480),
    "drawable-port-xhdpi": (720, 1280),
    "drawable-port-xxhdpi": (960, 1600),
    "drawable-port-xxxhdpi": (1080, 1920),
}

for folder, (w, h) in splash_sizes.items():
    img = Image.new("RGB", (w, h), BG_COLOR)
    draw_s = ImageDraw.Draw(img)
    # Place icon centered, shifted up slightly
    icon_size = min(w, h) // 3
    icon_resized = fg.resize((icon_size, icon_size), Image.LANCZOS)
    ix = (w - icon_size) // 2
    iy = (h - icon_size) // 2 - icon_size // 6
    img.paste(icon_resized, (ix, iy), icon_resized)
    # "Daymark" text below icon
    try:
        text_size = max(icon_size // 4, 24)
        tfont = ImageFont.truetype("arial.ttf", text_size)
    except:
        tfont = ImageFont.load_default()
    tbox = draw_s.textbbox((0, 0), "Daymark", font=tfont)
    ttw = tbox[2] - tbox[0]
    tx = (w - ttw) // 2
    ty = iy + icon_size + icon_size // 8
    draw_s.text((tx, ty), "Daymark", fill=(255, 255, 255), font=tfont)

    out_dir = os.path.join(RES, folder)
    os.makedirs(out_dir, exist_ok=True)
    img.save(os.path.join(out_dir, "splash.png"))
    print(f"{folder}/splash.png done ({w}x{h})")

print("ALL DONE")
