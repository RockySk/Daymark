package com.sourabhkulkarni.daymark;

import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.KEY_COLOR_PREFIX;
import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.KEY_DATA;
import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.KEY_DATE_PREFIX;
import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.KEY_ID_PREFIX;
import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.KEY_NAME_PREFIX;
import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.KEY_OPACITY_PREFIX;
import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.KEY_UNIT_PREFIX;
import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.KEY_WALLPAPER_PREFIX;
import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.SHARED_PREFS;
import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.UNIT_DAYS;
import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.UNIT_MONTHS;
import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.UNIT_TIME;
import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.UNIT_WEEKS;
import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.UNIT_YEARS;
import static com.sourabhkulkarni.daymark.CountdateWidgetConfig.UNIT_YMD;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.util.TypedValue;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

public class WidgetHelper {

    public static final String ACTION_DAILY_UPDATE   = "com.sourabhkulkarni.daymark.ACTION_DAILY_UPDATE";
    public static final String ACTION_UPDATE_WIDGETS = "com.sourabhkulkarni.daymark.ACTION_UPDATE_WIDGETS";

    public static void updateAllWidgets(Context context) {
        if (context == null) return;
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);

        updateProvider(context, appWidgetManager, CountdateWidget.class);
        updateProvider(context, appWidgetManager, DarkWidget.class);
        updateProvider(context, appWidgetManager, MinimalWidget.class);
        updateProvider(context, appWidgetManager, TransparentWidget.class);
    }

    private static void updateProvider(Context context, AppWidgetManager mgr, Class<?> providerClass) {
        int[] ids = mgr.getAppWidgetIds(new ComponentName(context, providerClass));
        for (int id : ids) {
            updateWidget(context, mgr, id, providerClass);
        }
    }

    /**
     * Updates a single widget instance by ID.
     * Shows calendar-accurate years, months, and days.
     */
    public static void updateWidget(Context context, AppWidgetManager mgr, int widgetId, Class<?> providerClass) {
        if (context == null || mgr == null) return;

        SharedPreferences prefs = context.getSharedPreferences(SHARED_PREFS, Context.MODE_PRIVATE);
        String eventId      = prefs.getString(KEY_ID_PREFIX   + widgetId, null);
        String eventName    = prefs.getString(KEY_NAME_PREFIX + widgetId, "No Data");
        String eventDate    = prefs.getString(KEY_DATE_PREFIX + widgetId, "No Data");
        String recurrence   = "none";
        String endDate      = null;
        boolean includeEndDay = false;

        int overlayAlpha = prefs.contains(KEY_OPACITY_PREFIX + widgetId)
                ? prefs.getInt(KEY_OPACITY_PREFIX + widgetId, 255)
                : WidgetThemes.defaultOpacityFor(providerClass);
        String wallpaperB64 = prefs.getString(KEY_WALLPAPER_PREFIX + widgetId, null);
        String colorMode    = prefs.getString(KEY_COLOR_PREFIX + widgetId, WidgetThemes.MODE_DEFAULT);
        String unitMode     = prefs.getString(KEY_UNIT_PREFIX  + widgetId, UNIT_YMD);
        int overlayColor    = WidgetThemes.resolveColor(prefs, colorMode, providerClass);

        String rawJson = prefs.getString(KEY_DATA, null);
        if (rawJson != null) {
            try {
                JSONArray array = new JSONArray(rawJson);
                for (int i = 0; i < array.length(); i++) {
                    JSONObject obj = array.getJSONObject(i);
                    String id = obj.optString("id", "");
                    if (eventId != null && eventId.equals(id)) {
                        eventName  = obj.optString("event_name", eventName);
                        eventDate  = obj.optString("date", eventDate);
                        endDate    = obj.optString("endDate", null);
                        recurrence = obj.optString("recurrence", "none");
                        includeEndDay = obj.optBoolean("includeEndDay", false);

                        SharedPreferences.Editor editor = prefs.edit();
                        editor.putString(KEY_NAME_PREFIX + widgetId, eventName);
                        editor.putString(KEY_DATE_PREFIX + widgetId, eventDate);
                        editor.apply();
                        break;
                    }
                }
            } catch (Exception ignored) {}
        }

        String countText = "—";
        String label     = "";

        Date targetDate    = parseDateString(eventDate);
        Date targetEndDate = (endDate != null && !endDate.isEmpty()) ? parseDateString(endDate) : null;

        if (targetDate != null) {
            Calendar todayCal = startOfDay(Calendar.getInstance());

            Calendar targetCal = startOfDay(Calendar.getInstance());
            targetCal.setTime(targetDate);
            targetCal = startOfDay(targetCal);

            if ("yearly".equalsIgnoreCase(recurrence)) {
                targetCal.set(Calendar.YEAR, todayCal.get(Calendar.YEAR));
                while (targetCal.before(todayCal)) { targetCal.add(Calendar.YEAR, 1); }
            } else if ("monthly".equalsIgnoreCase(recurrence)) {
                targetCal.set(Calendar.YEAR,  todayCal.get(Calendar.YEAR));
                targetCal.set(Calendar.MONTH, todayCal.get(Calendar.MONTH));
                while (targetCal.before(todayCal)) { targetCal.add(Calendar.MONTH, 1); }
            } else if ("weekly".equalsIgnoreCase(recurrence)) {
                while (targetCal.before(todayCal)) { targetCal.add(Calendar.DAY_OF_YEAR, 7); }
            } else if ("daily".equalsIgnoreCase(recurrence)) {
                targetCal.set(Calendar.YEAR,        todayCal.get(Calendar.YEAR));
                targetCal.set(Calendar.DAY_OF_YEAR, todayCal.get(Calendar.DAY_OF_YEAR));
                while (targetCal.before(todayCal)) { targetCal.add(Calendar.DAY_OF_YEAR, 1); }
            }

            Calendar otherCal = (Calendar) targetCal.clone();

            if (targetEndDate != null) {
                Calendar endCal = startOfDay(Calendar.getInstance());
                endCal.setTime(targetEndDate);
                endCal = startOfDay(endCal);

                if (!todayCal.before(targetCal) && !todayCal.after(endCal)) {
                    otherCal = endCal;
                } else if (todayCal.after(endCal)) {
                    otherCal = endCal;
                }
            }

            int cmp = todayCal.compareTo(otherCal);
            Calendar earlier = cmp <= 0 ? todayCal : otherCal;
            Calendar later   = cmp <= 0 ? otherCal : todayCal;
            later = (Calendar) later.clone();
            if (includeEndDay) {
                later.add(Calendar.DAY_OF_MONTH, 1);
            }

            long diffMillis = Math.abs(otherCal.getTimeInMillis() - todayCal.getTimeInMillis());
            long diffDays = diffMillis / 86400000L;
            long remHours = (diffMillis / (3600000L)) % 24L;
            long remMinutes = (diffMillis / (60000L)) % 60L;

            int[] ymd = calendarYmd(earlier, later);
            boolean isToday = ymd[0] == 0 && ymd[1] == 0 && ymd[2] == 0;

            if (isToday && !UNIT_TIME.equals(unitMode)) {
                countText = "0";
                label = "today!";
            } else {
                countText = formatCount(unitMode, ymd[0], ymd[1], ymd[2], (int) diffDays, (int) remHours, (int) remMinutes);
                label = cmp < 0 ? "to go" : "ago";
            }
        }

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(
                context,
                widgetId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        RemoteViews views = buildViews(
                context, mgr, widgetId, providerClass,
                eventName, countText, label,
                overlayAlpha, overlayColor, wallpaperB64, pi
        );
        if (views != null) {
            mgr.updateAppWidget(widgetId, views);
        }
    }

    public static void deleteWidgetPrefs(Context context, int[] ids) {
        if (context == null || ids == null) return;
        SharedPreferences.Editor editor = context.getSharedPreferences(SHARED_PREFS, Context.MODE_PRIVATE).edit();
        for (int id : ids) {
            editor.remove(KEY_ID_PREFIX + id);
            editor.remove(KEY_NAME_PREFIX + id);
            editor.remove(KEY_DATE_PREFIX + id);
            editor.remove(KEY_OPACITY_PREFIX + id);
            editor.remove(KEY_WALLPAPER_PREFIX + id);
            editor.remove(KEY_COLOR_PREFIX + id);
            editor.remove(KEY_UNIT_PREFIX + id);
        }
        editor.apply();
    }

    private static RemoteViews buildViews(
            Context context,
            AppWidgetManager mgr,
            int widgetId,
            Class<?> providerClass,
            String eventName,
            String countText,
            String label,
            int overlayAlpha,
            int overlayColor,
            String wallpaperB64,
            PendingIntent tapIntent) {

        int layoutId;
        if (providerClass == CountdateWidget.class) {
            layoutId = R.layout.countdate_widget;
        } else if (providerClass == DarkWidget.class) {
            layoutId = R.layout.widget_dark;
        } else if (providerClass == MinimalWidget.class) {
            layoutId = R.layout.widget_minimal;
        } else if (providerClass == TransparentWidget.class) {
            layoutId = R.layout.widget_transparent;
        } else {
            return null;
        }

        RemoteViews views = new RemoteViews(context.getPackageName(), layoutId);
        views.setOnClickPendingIntent(R.id.widget_root, tapIntent);
        views.setOnClickPendingIntent(R.id.widget_content, tapIntent);
        views.setTextViewText(R.id.widget_name,  eventName);
        views.setTextViewText(R.id.widget_count, countText);
        views.setTextViewText(R.id.widget_label, label);
        float countSp = countText != null && countText.length() > 6 ? 26f : 40f;
        views.setTextViewTextSize(R.id.widget_count, TypedValue.COMPLEX_UNIT_SP, countSp);

        applyAppearance(context, mgr, widgetId, views, overlayAlpha, overlayColor, wallpaperB64);
        return views;
    }

    private static void applyAppearance(
            Context context,
            AppWidgetManager mgr,
            int widgetId,
            RemoteViews views,
            int overlayAlpha,
            int overlayColor,
            String wallpaperB64) {

        Bitmap wallpaper = null;
        if (wallpaperB64 != null) {
            try {
                byte[] bytes = Base64.decode(wallpaperB64, Base64.DEFAULT);
                wallpaper = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
            } catch (Exception ignored) {}
        }

        int[] size = widgetSizePx(context, mgr, widgetId);
        float radius = TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP, 28f, context.getResources().getDisplayMetrics());
        Bitmap composed = composeBackground(wallpaper, overlayColor, overlayAlpha, size[0], size[1], radius);
        views.setImageViewBitmap(R.id.widget_bg_image, composed);

        boolean wallpaperShowing = wallpaper != null;
        applyTextColors(views, overlayColor, overlayAlpha, wallpaperShowing);
    }

    private static void applyTextColors(RemoteViews views, int overlayColor, int overlayAlpha, boolean wallpaperShowing) {
        int nameColor;
        int countColor;
        int labelColor;

        if (wallpaperShowing && overlayAlpha < 140) {
            nameColor  = 0xFFFFFFFF;
            countColor = 0xFFFFFFFF;
            labelColor = 0xE6FFFFFF;
        } else if (WidgetThemes.isLightColor(overlayColor)) {
            nameColor  = 0xFF1D1B20;
            countColor = overlayColor == 0xFFFFFFFF ? 0xFF6750A4 : overlayColor;
            labelColor = 0xFF49454F;
        } else {
            nameColor  = 0xE6FFFFFF;
            countColor = 0xFFFFFFFF;
            labelColor = 0xCCFFFFFF;
        }

        views.setTextColor(R.id.widget_name,  nameColor);
        views.setTextColor(R.id.widget_count, countColor);
        views.setTextColor(R.id.widget_label, labelColor);
    }

    static int[] widgetSizePx(Context ctx, AppWidgetManager mgr, int widgetId) {
        Bundle opt = mgr.getAppWidgetOptions(widgetId);
        int wDp = opt != null ? opt.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, 0) : 0;
        int hDp = opt != null ? opt.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0) : 0;
        if (wDp <= 0) wDp = 250;
        if (hDp <= 0) hDp = 120;
        float density = ctx.getResources().getDisplayMetrics().density;
        int w = Math.max(8, Math.round(wDp * density));
        int h = Math.max(8, Math.round(hDp * density));
        int max = 400;
        if (w > max || h > max) {
            float scale = Math.min(max / (float) w, max / (float) h);
            w = Math.max(8, Math.round(w * scale));
            h = Math.max(8, Math.round(h * scale));
        }
        return new int[]{w, h};
    }

    /**
     * Builds a rounded bitmap: optional wallpaper (center-cropped to the widget
     * size) with a colour overlay at the requested alpha. Stretching the widget
     * triggers a rebuild via onAppWidgetOptionsChanged so the image fills the
     * new bounds.
     */
    static Bitmap composeBackground(Bitmap wallpaper, int colorRgb, int alpha, int w, int h, float radius) {
        Bitmap out = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(out);
        RectF rect = new RectF(0, 0, w, h);

        Path clip = new Path();
        clip.addRoundRect(rect, radius, radius, Path.Direction.CW);
        canvas.clipPath(clip);

        if (wallpaper != null && !wallpaper.isRecycled()) {
            Bitmap cropped = scaleCenterCrop(wallpaper, w, h);
            canvas.drawBitmap(cropped, 0, 0, null);
        }

        Paint overlay = new Paint(Paint.ANTI_ALIAS_FLAG);
        int a = Math.max(0, Math.min(255, alpha));
        overlay.setColor((a << 24) | (colorRgb & 0x00FFFFFF));
        canvas.drawRect(rect, overlay);
        return out;
    }

    private static Bitmap scaleCenterCrop(Bitmap src, int w, int h) {
        if (src.getWidth() <= 0 || src.getHeight() <= 0) {
            return Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        }
        float scale = Math.max(w / (float) src.getWidth(), h / (float) src.getHeight());
        int sw = Math.max(1, Math.round(src.getWidth() * scale));
        int sh = Math.max(1, Math.round(src.getHeight() * scale));
        Bitmap scaled = Bitmap.createScaledBitmap(src, sw, sh, true);
        int x = Math.max(0, (scaled.getWidth() - w) / 2);
        int y = Math.max(0, (scaled.getHeight() - h) / 2);
        int cw = Math.min(w, scaled.getWidth() - x);
        int ch = Math.min(h, scaled.getHeight() - y);
        return Bitmap.createBitmap(scaled, x, y, cw, ch);
    }

    public static void scheduleMidnightUpdate(Context context) {
        if (context == null) return;
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) return;

            Intent intent = new Intent(context, WidgetAlarmReceiver.class);
            intent.setAction(ACTION_DAILY_UPDATE);
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context,
                    9991,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            Calendar midnight = Calendar.getInstance();
            midnight.add(Calendar.DAY_OF_YEAR, 1);
            midnight.set(Calendar.HOUR_OF_DAY, 0);
            midnight.set(Calendar.MINUTE,      0);
            midnight.set(Calendar.SECOND,      1);
            midnight.set(Calendar.MILLISECOND, 0);

            long triggerAtMillis = midnight.getTimeInMillis();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                try {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
                } catch (SecurityException se) {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
                }
            } else {
                alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            }
        } catch (Exception ignored) {}
    }

    private static Calendar startOfDay(Calendar cal) {
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal;
    }

    /** Calendar-accurate years, months, days between two dates (later ≥ earlier). */
    static int[] calendarYmd(Calendar earlier, Calendar later) {
        int years  = later.get(Calendar.YEAR) - earlier.get(Calendar.YEAR);
        int months = later.get(Calendar.MONTH) - earlier.get(Calendar.MONTH);
        int days   = later.get(Calendar.DAY_OF_MONTH) - earlier.get(Calendar.DAY_OF_MONTH);

        if (days < 0) {
            months -= 1;
            Calendar prevMonth = (Calendar) later.clone();
            prevMonth.add(Calendar.MONTH, -1);
            days += prevMonth.getActualMaximum(Calendar.DAY_OF_MONTH);
        }
        if (months < 0) {
            years -= 1;
            months += 12;
        }
        return new int[]{Math.abs(years), Math.abs(months), Math.abs(days)};
    }

    static String formatCount(String unitMode, int years, int months, int days, int totalDays, int hours, int minutes) {
        if (UNIT_TIME.equals(unitMode)) {
            StringBuilder sb = new StringBuilder();
            if (totalDays > 0) sb.append(totalDays).append("d ");
            sb.append(hours).append("h ").append(minutes).append("m");
            return sb.toString().trim();
        }
        if (UNIT_DAYS.equals(unitMode)) {
            return totalDays + "d";
        }
        if (UNIT_MONTHS.equals(unitMode)) {
            int totalMonths = (years * 12) + months;
            StringBuilder sb = new StringBuilder();
            if (totalMonths > 0) sb.append(totalMonths).append("m ");
            if (days > 0 || sb.length() == 0) sb.append(days).append("d");
            return sb.toString().trim();
        }
        if (UNIT_YEARS.equals(unitMode)) {
            int remainingDays = totalDays - (years * 365);
            if (remainingDays < 0) remainingDays = 0;
            StringBuilder sb = new StringBuilder();
            if (years > 0) sb.append(years).append("y ");
            if (remainingDays > 0 || sb.length() == 0) sb.append(remainingDays).append("d");
            return sb.toString().trim();
        }
        if (UNIT_WEEKS.equals(unitMode)) {
            int weeks = totalDays / 7;
            int remDays = totalDays % 7;
            StringBuilder sb = new StringBuilder();
            if (weeks > 0) sb.append(weeks).append("w ");
            if (remDays > 0 || sb.length() == 0) sb.append(remDays).append("d");
            return sb.toString().trim();
        }
        // Default: UNIT_YMD
        return formatYmd(years, months, days);
    }

    static String formatYmd(int years, int months, int days) {
        StringBuilder sb = new StringBuilder();
        if (years > 0) sb.append(years).append("y ");
        if (months > 0) sb.append(months).append("m ");
        if (days > 0 || sb.length() == 0) sb.append(days).append("d");
        return sb.toString().trim();
    }

    public static Date parseDateString(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty() || "No Data".equals(dateStr)) return null;
        try {
            String cleaned  = dateStr.trim();
            if (cleaned.contains("T")) {
                String dateTimePart = cleaned.split("[+-]")[0];
                if (dateTimePart.length() >= 16) {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm", Locale.US);
                    return sdf.parse(dateTimePart.substring(0, 16));
                }
            }
            String datePart = cleaned.contains("T") ? cleaned.split("T")[0] : cleaned;
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
            return sdf.parse(datePart);
        } catch (Exception e) {
            return null;
        }
    }

    public static Class<?> providerClassFor(AppWidgetManager mgr, int widgetId) {
        android.appwidget.AppWidgetProviderInfo info = mgr.getAppWidgetInfo(widgetId);
        if (info != null && info.provider != null) {
            String className = info.provider.getClassName();
            if (className.contains("DarkWidget")) return DarkWidget.class;
            if (className.contains("MinimalWidget")) return MinimalWidget.class;
            if (className.contains("TransparentWidget")) return TransparentWidget.class;
        }
        return CountdateWidget.class;
    }
}
