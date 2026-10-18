#!/usr/bin/env python3
"""Generate the Daymark app icon (white calendar on Material You purple)
for every Android density. Run from the project root:  python3 scripts/gen_icon.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

DAY_NUMBER = "19"   # the date shown on the calendar face

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]


def load_font(px):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            return ImageFont.truetype(path, int(px))
    return ImageFont.load_default()

RES = "android/app/src/main/res"

PURPLE1 = (127, 103, 190)   # #7F67BE  (gradient top)
PURPLE2 = (79, 55, 139)     # #4F378B  (gradient bottom)
DEEP = (72, 42, 116)        # #482A74  (calendar details on white)
WHITE = (255, 255, 255, 255)

MASTER = 1024  # render big, then downscale for crisp edges


def vgradient(size):
    img = Image.new("RGBA", (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        c = tuple(int(PURPLE1[i] + (PURPLE2[i] - PURPLE1[i]) * t) for i in range(3))
        d.line([(0, y), (size, y)], fill=c + (255,))
    return img


def draw_calendar(img, scale):
    """Draw the calendar centered on a MASTER-sized RGBA image."""
    S = img.size[0]
    d = ImageDraw.Draw(img)
    cx = cy = S / 2
    size = S * scale

    bw = size
    bh = size * 0.86
    left = cx - bw / 2
    right = cx + bw / 2
    top = cy - bh / 2 + size * 0.06
    bottom = top + bh
    r = size * 0.11

    # White body
    d.rounded_rectangle([left, top, right, bottom], radius=r, fill=WHITE)

    # Purple header band (rounded top, straight bottom)
    hh = bh * 0.24
    d.rounded_rectangle([left, top, right, top + hh + r], radius=r, fill=DEEP + (255,))
    d.rectangle([left, top + hh, right, top + hh + r], fill=WHITE)

    # White binder tabs crossing the top edge
    tab_w = size * 0.10
    for fx in (0.30, 0.70):
        x = left + bw * fx
        d.rounded_rectangle(
            [x - tab_w / 2, top - size * 0.11, x + tab_w / 2, top + size * 0.05],
            radius=tab_w / 2,
            fill=WHITE,
        )

    # Big day number "19" centered in the lower (white) area
    body_mid = (top + hh + bottom) / 2 + size * 0.02
    font = load_font(size * 0.46)
    bbox = d.textbbox((0, 0), DAY_NUMBER, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    d.text(
        (cx - tw / 2 - bbox[0], body_mid - th / 2 - bbox[1]),
        DAY_NUMBER,
        font=font,
        fill=DEEP + (255,),
    )


def circle_mask(size):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).ellipse([0, 0, size, size], fill=255)
    return m


def save(img, density, name, size):
    d = os.path.join(RES, f"mipmap-{density}")
    os.makedirs(d, exist_ok=True)
    img.resize((size, size), Image.LANCZOS).save(os.path.join(d, name))


# Masters
fg = Image.new("RGBA", (MASTER, MASTER), (0, 0, 0, 0))
draw_calendar(fg, 0.56)                       # foreground: inside adaptive safe zone

full = vgradient(MASTER)
draw_calendar(full, 0.62)                      # legacy square icon

bg = vgradient(MASTER)                          # plain background

rnd = vgradient(MASTER)
draw_calendar(rnd, 0.62)
rnd.putalpha(circle_mask(MASTER))               # round icon

# Density sizes
FG = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}
LA = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}

for dens in FG:
    save(fg, dens, "ic_launcher_foreground.png", FG[dens])
    save(bg, dens, "ic_launcher_background.png", FG[dens])
    save(full, dens, "ic_launcher.png", LA[dens])
    save(rnd, dens, "ic_launcher_round.png", LA[dens])

# Play Store / store listing icon (512x512)
os.makedirs("fastlane/metadata/android/en-US/images", exist_ok=True)
full.resize((512, 512), Image.LANCZOS).convert("RGB").save(
    "fastlane/metadata/android/en-US/images/icon.png"
)

# In-app logo used by About/Share (transparent foreground on nothing)
logo = Image.new("RGBA", (MASTER, MASTER), (0, 0, 0, 0))
draw_calendar(logo, 0.62)
logo.resize((512, 512), Image.LANCZOS).save("src/assets/countdateapp-logo-foreground.png")

print("Icon generated for all densities + store icon + in-app logo.")
