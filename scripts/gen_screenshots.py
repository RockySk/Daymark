#!/usr/bin/env python3
"""Generate high-resolution, on-brand Daymark Android app screenshots (Material You M3)
Showcases:
1. Upcoming events with progress and category chips (Light Mode)
2. Live search and filtered views (Light Mode)
3. Dark Mode with full Material You contrast
4. Count-up / Past events & experience tracking (Light Mode)
5. Time breakdown / Months view (Light Mode)
6. New Event creation & customization screen
7. Material You Home-screen Widgets showcase

Outputs directly to App_Screenshots/, fastlane/metadata/android/en-US/images/phoneScreenshots/,
and public/assets/tour/
"""
import os
import math
import sys
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 2400
SCALE = 2  # supersample for ultra-crisp text and shapes

_WIN = sys.platform == "win32"
FONTS = {
    "regular": "C:/Windows/Fonts/arial.ttf" if _WIN else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "bold": "C:/Windows/Fonts/arialbd.ttf" if _WIN else "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
}


def font(kind, px):
    path = FONTS[kind]
    if os.path.exists(path):
        return ImageFont.truetype(path, int(px))
    return ImageFont.load_default()


THEMES = {
    "light": dict(
        bg=(248, 246, 252),
        surface=(255, 255, 255),
        card_bg=(255, 255, 255),
        text=(28, 27, 31),
        subtle=(100, 96, 107),
        variant=(235, 230, 244),
        outline=(200, 194, 210),
        primary=(103, 80, 164),
        on_primary=(255, 255, 255),
        banner_bg=(238, 232, 248),
    ),
    "dark": dict(
        bg=(20, 19, 24),
        surface=(31, 29, 36),
        card_bg=(38, 36, 44),
        text=(232, 227, 235),
        subtle=(170, 164, 178),
        variant=(56, 52, 64),
        outline=(78, 74, 88),
        primary=(208, 188, 255),
        on_primary=(56, 30, 114),
        banner_bg=(45, 41, 54),
    ),
}

ACCENTS = {
    "birthday": (220, 90, 130),
    "travel": (0, 150, 140),
    "anniversary": (230, 60, 60),
    "work": (210, 140, 20),
    "general": (120, 90, 200),
    "health": (46, 160, 70),
}


def rr(d, box, r, fill):
    d.rounded_rectangle(box, radius=r, fill=fill)


def mix(a, b, t):
    return tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(3))


def text_center(d, cx, y, s, f, fill):
    b = d.textbbox((0, 0), s, font=f)
    d.text((cx - (b[2] - b[0]) / 2 - b[0], y), s, font=f, fill=fill)


def star(d, cx, cy, r, fill):
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        rad = r if i % 2 == 0 else r * 0.45
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    d.polygon(pts, fill=fill)


def draw_card(d, x, y, w, h, ev, th, s):
    accent = ACCENTS.get(ev.get("cat", "general"), th["primary"])
    # Card surface
    rr(d, [x, y, x + w, y + h], 44 * s, th["card_bg"])
    # Left accent indicator
    rr(d, [x, y + 16 * s, x + 14 * s, y + h - 16 * s], 7 * s, accent)
    pad = 48 * s

    # Badge icon
    badge_bg = mix(th["card_bg"], accent, 0.20 if th == THEMES["light"] else 0.32)
    rr(d, [x + pad, y + 36 * s, x + pad + 88 * s, y + 36 * s + 88 * s], 44 * s, badge_bg)
    text_center(d, x + pad + 44 * s, y + 50 * s, ev["letter"], font("bold", 50 * s), accent)

    # Title & Target Date
    d.text((x + pad + 116 * s, y + 38 * s), ev["name"], font=font("bold", 42 * s), fill=th["text"])
    d.text((x + pad + 116 * s, y + 92 * s), ev["date"], font=font("regular", 30 * s), fill=th["subtle"])

    # Star / Pin icon
    if ev.get("pin"):
        star(d, x + w - 58 * s, y + 68 * s, 26 * s, accent)

    # Big Number + Unit + Direction
    nf = font("bold", 112 * s)
    d.text((x + pad, y + 148 * s), ev["num"], font=nf, fill=accent)
    nb = d.textbbox((0, 0), ev["num"], font=nf)
    num_w = nb[2] - nb[0]
    d.text((x + pad + num_w + 24 * s, y + 184 * s), ev["unit"], font=font("bold", 38 * s), fill=th["text"])
    d.text((x + pad + num_w + 24 * s, y + 234 * s), ev["dir"], font=font("bold", 24 * s), fill=th["subtle"])

    # Progress bar
    by = y + 296 * s
    rr(d, [x + pad, by, x + w - pad, by + 14 * s], 7 * s, th["variant"])
    fill_w = max(int((w - 2 * pad) * ev["prog"]), 14 * s)
    rr(d, [x + pad, by, x + pad + fill_w, by + 14 * s], 7 * s, accent)

    # Chips / tags
    cy = by + 38 * s
    cx = x + pad
    for label, ghost in ev["chips"]:
        f = font("bold", 26 * s)
        tw = d.textbbox((0, 0), label, font=f)
        cw = (tw[2] - tw[0]) + 44 * s
        col = th["variant"] if ghost else mix(th["card_bg"], accent, 0.22)
        text_col = th["subtle"] if ghost else accent
        rr(d, [cx, cy, cx + cw, cy + 50 * s], 25 * s, col)
        d.text((cx + 22 * s, cy + 10 * s), label, font=f, fill=text_col)
        cx += cw + 18 * s


def draw_phone_frame(theme="light"):
    th = THEMES[theme]
    s = SCALE
    img = Image.new("RGB", (W * s, H * s), th["bg"])
    d = ImageDraw.Draw(img)
    sw = W * s

    # Status Bar
    d.text((54 * s, 36 * s), "09:41", font=font("bold", 34 * s), fill=th["text"])
    d.rounded_rectangle([sw - 140 * s, 42 * s, sw - 68 * s, 72 * s], radius=8 * s, outline=th["subtle"], width=2 * s)
    d.rectangle([sw - 134 * s, 48 * s, sw - 82 * s, 66 * s], fill=th["subtle"])
    d.text((sw - 230 * s, 40 * s), "100%", font=font("bold", 26 * s), fill=th["subtle"])

    # App Header
    d.text((54 * s, 100 * s), "Daymark", font=font("bold", 68 * s), fill=th["text"])
    
    # Header Action Icons (Search, Filter, Settings)
    hx = sw - 280 * s
    hy = 130 * s
    # Filter
    d.line([hx, hy, hx + 36 * s, hy], fill=th["subtle"], width=5 * s)
    d.line([hx + 6 * s, hy + 16 * s, hx + 30 * s, hy + 16 * s], fill=th["subtle"], width=5 * s)
    # Search
    sx = hx + 88 * s
    d.ellipse([sx, hy - 6 * s, sx + 34 * s, hy + 28 * s], outline=th["subtle"], width=5 * s)
    d.line([sx + 30 * s, hy + 24 * s, sx + 44 * s, hy + 38 * s], fill=th["subtle"], width=5 * s)
    # Settings
    gx = hx + 176 * s
    d.ellipse([gx, hy - 8 * s, gx + 42 * s, hy + 34 * s], outline=th["subtle"], width=5 * s)
    d.ellipse([gx + 14 * s, hy + 6 * s, gx + 28 * s, hy + 20 * s], fill=th["subtle"])

    return img, d, th, s, sw


def render_cards_screen(theme, mode_label, view_label, cards, show_search=False):
    img, d, th, s, sw = draw_phone_frame(theme)
    y = 208

    if show_search:
        rr(d, [48 * s, y * s, sw - 48 * s, (y + 90) * s], 45 * s, th["variant"])
        d.ellipse([78 * s, (y + 28) * s, 114 * s, (y + 64) * s], outline=th["subtle"], width=3 * s)
        d.line([108 * s, (y + 58) * s, 126 * s, (y + 76) * s], fill=th["subtle"], width=5 * s)
        d.text((144 * s, (y + 24) * s), "Search birthdays, trips, exams…", font=font("regular", 36 * s), fill=th["subtle"])
        y += 122

    # Segment Bar (Upcoming / Past)
    seg_w = sw - 96 * s
    rr(d, [48 * s, y * s, 48 * s + seg_w, (y + 104) * s], 52 * s, th["variant"])
    half = seg_w / 2
    active = 0 if mode_label == "Upcoming" else 1
    rr(d, [48 * s + active * half + 8 * s, (y + 8) * s, 48 * s + active * half + half - 8 * s, (y + 96) * s], 44 * s, th["primary"])
    text_center(d, 48 * s + half / 2, (y + 26) * s, "Upcoming", font("bold", 40 * s), th["on_primary"] if active == 0 else th["subtle"])
    text_center(d, 48 * s + half + half / 2, (y + 26) * s, "Past", font("bold", 40 * s), th["on_primary"] if active == 1 else th["subtle"])
    y += 134

    # Category Chips
    cx = 48 * s
    chips = [("All", not show_search), ("Birthday", show_search), ("Travel", False), ("Work", False), ("Health", False)]
    for label, on in chips:
        f = font("bold", 32 * s)
        tw = d.textbbox((0, 0), label, font=f)
        cw = (tw[2] - tw[0]) + 60 * s
        if on:
            rr(d, [cx, y * s, cx + cw, (y + 68) * s], 34 * s, th["primary"])
            d.text((cx + 30 * s, (y + 14) * s), label, font=f, fill=th["on_primary"])
        else:
            d.rounded_rectangle([cx, y * s, cx + cw, (y + 68) * s], radius=34 * s, outline=th["outline"], width=2 * s)
            d.text((cx + 30 * s, (y + 14) * s), label, font=f, fill=th["text"])
        cx += cw + 20 * s
    y += 104

    # Event Cards
    for ev in cards:
        draw_card(d, 48 * s, y * s, sw - 96 * s, 390 * s, ev, th, s)
        y += 424

    # Floating Action Button (+)
    fab = 156 * s
    fx, fy = sw - 64 * s - fab, H * s - 300 * s - fab
    d.ellipse([fx, fy, fx + fab, fy + fab], fill=th["primary"])
    text_center(d, fx + fab / 2, fy + 30 * s, "+", font("bold", 96 * s), th["on_primary"])

    # Bottom View Switcher (Days, Weeks, Months)
    by = H * s - 160 * s
    rr(d, [48 * s, by, sw - 48 * s, by + 104 * s], 52 * s, th["variant"])
    third = (sw - 96 * s) / 3
    views = ["Days", "Weeks", "Months"]
    act = views.index(view_label)
    rr(d, [48 * s + act * third + 8 * s, by + 8 * s, 48 * s + act * third + third - 8 * s, by + 96 * s], 44 * s, th["primary"])
    for i, v in enumerate(views):
        text_center(d, 48 * s + i * third + third / 2, by + 26 * s, v, font("bold", 38 * s), th["on_primary"] if i == act else th["subtle"])

    return img.resize((W, H), Image.LANCZOS)


def render_add_event_screen():
    img, d, th, s, sw = draw_phone_frame("light")
    y = 200

    # Page Header
    d.text((48 * s, y * s), "← New Event", font=font("bold", 54 * s), fill=th["text"])
    y += 90

    # Event Name Input Box
    rr(d, [48 * s, y * s, sw - 48 * s, (y + 110) * s], 32 * s, th["surface"])
    d.rounded_rectangle([48 * s, y * s, sw - 48 * s, (y + 110) * s], radius=32 * s, outline=th["primary"], width=3 * s)
    d.text((72 * s, (y + 16) * s), "Event Name", font=font("bold", 24 * s), fill=th["primary"])
    d.text((72 * s, (y + 48) * s), "Japan Autumn Vacation", font=font("bold", 38 * s), fill=th["text"])
    y += 140

    # Date Picker Input Box
    rr(d, [48 * s, y * s, sw - 48 * s, (y + 100) * s], 28 * s, th["surface"])
    d.rounded_rectangle([48 * s, y * s, sw - 48 * s, (y + 100) * s], radius=28 * s, outline=th["outline"], width=2 * s)
    d.text((72 * s, (y + 14) * s), "Date & Time", font=font("regular", 24 * s), fill=th["subtle"])
    d.text((72 * s, (y + 46) * s), "24 Oct 2026, 10:30 AM", font=font("bold", 36 * s), fill=th["text"])
    y += 130

    # Category Selector Pills
    d.text((54 * s, y * s), "Category", font=font("bold", 36 * s), fill=th["text"])
    y += 56
    cx = 48 * s
    cats = [("Travel", True), ("Birthday", False), ("Work", False), ("Custom +", False)]
    for name, sel in cats:
        f = font("bold", 32 * s)
        tw = d.textbbox((0, 0), name, font=f)
        cw = (tw[2] - tw[0]) + 56 * s
        if sel:
            rr(d, [cx, y * s, cx + cw, (y + 66) * s], 33 * s, ACCENTS["travel"])
            d.text((cx + 28 * s, (y + 14) * s), name, font=f, fill=(255, 255, 255))
        else:
            d.rounded_rectangle([cx, y * s, cx + cw, (y + 66) * s], radius=33 * s, outline=th["outline"], width=2 * s)
            d.text((cx + 28 * s, (y + 14) * s), name, font=f, fill=th["text"])
        cx += cw + 18 * s
    y += 100

    # Repeat & Recurrence
    d.text((54 * s, y * s), "Repeat Cycle", font=font("bold", 36 * s), fill=th["text"])
    y += 56
    reps = ["Does not repeat", "Yearly (Anniversary)", "Monthly", "Weekly"]
    for i, rep in enumerate(reps):
        bg = mix(th["surface"], th["primary"], 0.15) if i == 1 else th["surface"]
        rr(d, [48 * s, y * s, sw - 48 * s, (y + 74) * s], 22 * s, bg)
        d.text((72 * s, (y + 18) * s), rep, font=font("bold" if i == 1 else "regular", 32 * s), fill=th["primary"] if i == 1 else th["text"])
        y += 86

    y += 20
    # Reminder Notification Section
    d.text((54 * s, y * s), "Remind Me", font=font("bold", 36 * s), fill=th["text"])
    y += 56
    rem_tags = ["On the day", "1 day before", "1 week before"]
    cx = 48 * s
    for rem in rem_tags:
        f = font("bold", 30 * s)
        tw = d.textbbox((0, 0), rem, font=f)
        cw = (tw[2] - tw[0]) + 50 * s
        rr(d, [cx, y * s, cx + cw, (y + 60) * s], 30 * s, th["variant"])
        d.text((cx + 25 * s, (y + 12) * s), rem, font=f, fill=th["primary"])
        cx += cw + 16 * s
    y += 120

    # Primary Save Button
    rr(d, [48 * s, (H - 180) * s, sw - 48 * s, (H - 80) * s], 50 * s, th["primary"])
    text_center(d, sw / 2, (H - 146) * s, "Save Event", font("bold", 44 * s), th["on_primary"])

    return img.resize((W, H), Image.LANCZOS)


def render_widget_showcase():
    img, d, th, s, sw = draw_phone_frame("light")
    y = 200

    d.text((48 * s, y * s), "Home-Screen Widgets", font=font("bold", 54 * s), fill=th["text"])
    d.text((48 * s, (y + 64) * s), "Real-time updates, midnight auto-refresh", font=font("regular", 32 * s), fill=th["subtle"])
    y += 140

    # Widget 1 (2x2 Compact Card)
    w1_w = (sw - 120 * s) / 2
    rr(d, [48 * s, y * s, 48 * s + w1_w, (y + 340) * s], 44 * s, (244, 238, 252))
    d.rounded_rectangle([48 * s, y * s, 48 * s + w1_w, (y + 340) * s], radius=44 * s, outline=(210, 196, 236), width=3 * s)
    rr(d, [72 * s, (y + 24) * s, 140 * s, (y + 92) * s], 34 * s, ACCENTS["birthday"])
    text_center(d, 106 * s, (y + 36) * s, "B", font("bold", 40 * s), (255, 255, 255))
    d.text((156 * s, (y + 36) * s), "Birthday", font=font("bold", 34 * s), fill=th["text"])
    d.text((72 * s, (y + 120) * s), "66", font=font("bold", 100 * s), fill=ACCENTS["birthday"])
    d.text((72 * s, (y + 230) * s), "days to go", font=font("bold", 32 * s), fill=th["subtle"])
    d.text((72 * s, (y + 276) * s), "Mon, 24 Aug 2026", font=font("regular", 26 * s), fill=th["subtle"])

    # Widget 2 (2x2 Compact Anniversary)
    w2_x = 48 * s + w1_w + 24 * s
    rr(d, [w2_x, y * s, w2_x + w1_w, (y + 340) * s], 44 * s, (254, 240, 240))
    d.rounded_rectangle([w2_x, y * s, w2_x + w1_w, (y + 340) * s], radius=44 * s, outline=(242, 204, 204), width=3 * s)
    rr(d, [w2_x + 24 * s, (y + 24) * s, w2_x + 92 * s, (y + 92) * s], 34 * s, ACCENTS["anniversary"])
    text_center(d, w2_x + 58 * s, (y + 36) * s, "A", font("bold", 40 * s), (255, 255, 255))
    d.text((w2_x + 108 * s, (y + 36) * s), "Anniversary", font=font("bold", 34 * s), fill=th["text"])
    d.text((w2_x + 24 * s, (y + 120) * s), "239", font=font("bold", 100 * s), fill=ACCENTS["anniversary"])
    d.text((w2_x + 24 * s, (y + 230) * s), "days to go", font=font("bold", 32 * s), fill=th["subtle"])
    d.text((w2_x + 24 * s, (y + 276) * s), "Sun, 14 Feb 2027", font=font("regular", 26 * s), fill=th["subtle"])
    y += 380

    # Widget 3 (4x2 Wide Glance Card)
    rr(d, [48 * s, y * s, sw - 48 * s, (y + 320) * s], 48 * s, (234, 246, 246))
    d.rounded_rectangle([48 * s, y * s, sw - 48 * s, (y + 320) * s], radius=48 * s, outline=(190, 228, 228), width=3 * s)
    rr(d, [80 * s, (y + 36) * s, 156 * s, (y + 112) * s], 38 * s, ACCENTS["travel"])
    text_center(d, 118 * s, (y + 48) * s, "T", font("bold", 46 * s), (255, 255, 255))
    d.text((180 * s, (y + 40) * s), "Goa Vacation Trip", font=font("bold", 44 * s), fill=th["text"])
    d.text((180 * s, (y + 96) * s), "Fri, 2 Oct 2026 · Multi-day Experience", font=font("regular", 30 * s), fill=th["subtle"])
    d.text((80 * s, (y + 146) * s), "105", font=font("bold", 110 * s), fill=ACCENTS["travel"])
    d.text((290 * s, (y + 184) * s), "days to go", font=font("bold", 40 * s), fill=th["text"])
    d.text((290 * s, (y + 236) * s), "15 weeks remaining", font=font("regular", 30 * s), fill=th["subtle"])
    y += 370

    # Feature List Under Widgets
    bullet_items = [
        "Material You dynamic color adaptation",
        "Exact countdown live ticking on screen",
        "Midnight automatic daily refresh trigger",
        "Deep tap links straight to event details"
    ]
    for b in bullet_items:
        rr(d, [48 * s, y * s, sw - 48 * s, (y + 84) * s], 28 * s, th["card_bg"])
        d.ellipse([76 * s, (y + 36) * s, 92 * s, (y + 52) * s], fill=th["primary"])
        d.text((112 * s, (y + 22) * s), b, font=font("bold", 32 * s), fill=th["text"])
        y += 104

    return img.resize((W, H), Image.LANCZOS)


UPCOMING_DATA = [
    dict(cat="birthday", letter="S", name="Sourabh's Birthday", date="Mon, 24 Aug 2026",
         num="66", unit="days", dir="TO GO", prog=0.55, pin=True,
         chips=[("Birthday", False), ("Yearly", True), ("2 reminders", True)]),
    dict(cat="travel", letter="G", name="Goa Vacation Trip", date="Fri, 2 Oct 2026",
         num="105", unit="days", dir="TO GO", prog=0.28,
         chips=[("Travel", False), ("1 week before", True)]),
    dict(cat="work", letter="E", name="Final Engineering Exam", date="Wed, 9 Dec 2026",
         num="172", unit="days", dir="TO GO", prog=0.18,
         chips=[("Work", False), ("3 reminders", True)]),
]

FILTERED_DATA = [
    dict(cat="birthday", letter="S", name="Sourabh's Birthday", date="Mon, 24 Aug 2026",
         num="66", unit="days", dir="TO GO", prog=0.55, pin=True,
         chips=[("Birthday", False), ("Yearly", True), ("Reminders", True)]),
    dict(cat="birthday", letter="M", name="Mom's 50th Birthday", date="Tue, 3 Nov 2026",
         num="136", unit="days", dir="TO GO", prog=0.35,
         chips=[("Birthday", False), ("Yearly", True)]),
]

PAST_DATA = [
    dict(cat="general", letter="N", name="New Year 2026", date="Thu, 1 Jan 2026",
         num="170", unit="days", dir="AGO", prog=1.0,
         chips=[("General", False), ("Celebrated", True)]),
    dict(cat="health", letter="G", name="Consistent Gym Routine", date="Sat, 1 Mar 2025",
         num="476", unit="days", dir="AGO", prog=1.0, pin=True,
         chips=[("Health", False), ("1 yr 3 mos", True)]),
    dict(cat="anniversary", letter="A", name="College Graduation", date="Fri, 14 Jun 2024",
         num="735", unit="days", dir="AGO", prog=1.0,
         chips=[("Work", False), ("2 years", True)]),
]

MONTHS_DATA = [
    dict(cat="travel", letter="J", name="Trip to Japan", date="Mon, 15 Mar 2027",
         num="8.2", unit="months", dir="TO GO", prog=0.20, pin=True,
         chips=[("Travel", False), ("Spring", True)]),
    dict(cat="birthday", letter="S", name="Sourabh's Birthday", date="Mon, 24 Aug 2026",
         num="2.2", unit="months", dir="TO GO", prog=0.55,
         chips=[("Birthday", False), ("Yearly", True)]),
    dict(cat="anniversary", letter="C", name="Company Anniversary", date="Sun, 1 Nov 2026",
         num="4.5", unit="months", dir="TO GO", prog=0.32,
         chips=[("Work", False), ("Milestone", True)]),
]


def main():
    dest_dirs = [
        "App_Screenshots",
        "fastlane/metadata/android/en-US/images/phoneScreenshots",
        "public/assets/tour",
    ]

    for d in dest_dirs:
        os.makedirs(d, exist_ok=True)

    print("Generating comprehensive Daymark app screenshots...")

    screens = [
        ("01_Upcoming_Events_Light.png", render_cards_screen("light", "Upcoming", "Days", UPCOMING_DATA, False)),
        ("02_Search_And_Filter.png", render_cards_screen("light", "Upcoming", "Days", FILTERED_DATA, True)),
        ("03_Material_You_Dark_Mode.png", render_cards_screen("dark", "Upcoming", "Days", UPCOMING_DATA, False)),
        ("04_Count_Up_Past_Milestones.png", render_cards_screen("light", "Past", "Days", PAST_DATA, False)),
        ("05_Months_And_Relative_Time.png", render_cards_screen("light", "Upcoming", "Months", MONTHS_DATA, False)),
        ("06_Add_And_Customize_Event.png", render_add_event_screen()),
        ("07_Home_Screen_Widgets.png", render_widget_showcase()),
    ]

    for filename, img in screens:
        # Save to App_Screenshots/
        out_app = os.path.join("App_Screenshots", filename)
        img.save(out_app, quality=95)

        # Also save JPG version with numbering for Fastlane and Tour
        base_num = filename.split("_")[0].lstrip("0")
        jpg_name = f"{base_num}.jpg"
        img.convert("RGB").save(os.path.join("fastlane/metadata/android/en-US/images/phoneScreenshots", jpg_name), quality=92)
        if int(base_num) <= 5:
            img.convert("RGB").save(os.path.join("public/assets/tour", jpg_name), quality=92)

        print(f"  + Created {out_app} & synced {jpg_name}")

    print(f"\nAll {len(screens)} screenshots successfully generated in App_Screenshots/ and synced.")


if __name__ == "__main__":
    main()
