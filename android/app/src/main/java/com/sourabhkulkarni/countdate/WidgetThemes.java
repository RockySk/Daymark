package com.sourabhkulkarni.countdate;

import android.content.SharedPreferences;

/**
 * App theme colours that widgets can use, matching {@code src/data/themes.ts}.
 */
public final class WidgetThemes {

    public static final String MODE_DEFAULT = "default";
    public static final String MODE_APP = "app";
    public static final String APP_THEME_PREF = "countdate_app_theme";

    public static final class Swatch {
        public final String id;
        public final String name;
        public final int color;

        public Swatch(String id, String name, int color) {
            this.id = id;
            this.name = name;
            this.color = color;
        }
    }

    public static final Swatch[] APP_SWATCHES = {
            new Swatch("purple",   "Purple Bloom",  0xFF6750A4),
            new Swatch("ocean",    "Ocean Teal",    0xFF006A6A),
            new Swatch("rose",     "Sunset Rose",   0xFFB5446E),
            new Swatch("forest",   "Forest Green",  0xFF386A20),
            new Swatch("midnight", "Midnight Blue", 0xFF3558A0),
            new Swatch("amber",    "Amber Gold",    0xFF8B5E00),
            new Swatch("coral",    "Coral Reef",    0xFFC4441D),
            new Swatch("lavender", "Lavender Mist", 0xFF8B5CF6),
            new Swatch("cherry",   "Cherry Red",    0xFFC62828),
            new Swatch("slate",    "Slate Grey",    0xFF4A5568),
            new Swatch("peach",    "Peach Blush",   0xFFD97706),
            new Swatch("indigo",   "Indigo Night",  0xFF4338CA),
            new Swatch("mint",     "Mint Fresh",    0xFF059669),
            new Swatch("wine",     "Wine Burgundy", 0xFF881337),
            new Swatch("sky",      "Sky Blue",      0xFF0284C7),
            new Swatch("charcoal", "Charcoal Dark", 0xFF1F2937),
    };

    private WidgetThemes() {}

    public static int colorForThemeId(String id) {
        String cleaned = stripQuotes(id);
        for (Swatch s : APP_SWATCHES) {
            if (s.id.equals(cleaned)) return s.color;
        }
        return 0xFF6750A4;
    }

    public static String nameForThemeId(String id) {
        if (MODE_DEFAULT.equals(id)) return "Widget default";
        if (MODE_APP.equals(id)) return "Match app theme";
        String cleaned = stripQuotes(id);
        for (Swatch s : APP_SWATCHES) {
            if (s.id.equals(cleaned)) return s.name;
        }
        return "Widget default";
    }

    public static int defaultColorFor(Class<?> provider) {
        if (provider == DarkWidget.class) return 0xFF1D1B20;
        if (provider == MinimalWidget.class) return 0xFFFFFFFF;
        if (provider == TransparentWidget.class) return 0xFF000000;
        return 0xFF6750A4;
    }

    public static int defaultOpacityFor(Class<?> provider) {
        if (provider == TransparentWidget.class) return 128;
        return 255;
    }

    public static int resolveColor(SharedPreferences prefs, String mode, Class<?> provider) {
        if (MODE_APP.equals(mode)) {
            String appId = prefs.getString(APP_THEME_PREF, "purple");
            return colorForThemeId(appId);
        }
        if (mode == null || mode.isEmpty() || MODE_DEFAULT.equals(mode)) {
            return defaultColorFor(provider);
        }
        return colorForThemeId(mode);
    }

    public static boolean isLightColor(int color) {
        int r = (color >> 16) & 0xFF;
        int g = (color >> 8) & 0xFF;
        int b = color & 0xFF;
        return (0.299 * r + 0.587 * g + 0.114 * b) > 186;
    }

    private static String stripQuotes(String value) {
        if (value == null) return "";
        String trimmed = value.trim();
        if (trimmed.length() >= 2 && trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            return trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed;
    }
}
