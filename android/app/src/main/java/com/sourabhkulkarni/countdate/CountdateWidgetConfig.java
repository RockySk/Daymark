package com.sourabhkulkarni.countdate;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.GridLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;

public class CountdateWidgetConfig extends AppCompatActivity {
    public static final String SHARED_PREFS     = "CapacitorStorage";
    public static final String KEY_NAME_PREFIX  = "wn_";
    public static final String KEY_DATE_PREFIX  = "wd_";
    public static final String KEY_ID_PREFIX    = "wid_";
    public static final String KEY_DATA         = "countdate_events_data";
    public static final String KEY_OPACITY_PREFIX   = "w_opacity_";
    public static final String KEY_WALLPAPER_PREFIX = "w_wallpaper_";
    public static final String KEY_COLOR_PREFIX     = "w_color_";
    public static final String KEY_UNIT_PREFIX      = "w_unit_";

    public static final String UNIT_YMD    = "ymd";
    public static final String UNIT_DAYS   = "days";
    public static final String UNIT_MONTHS = "months";
    public static final String UNIT_YEARS  = "years";
    public static final String UNIT_WEEKS  = "weeks";
    public static final String UNIT_TIME   = "time";

    private int appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private Class<?> providerClass = CountdateWidget.class;
    ArrayList<HashMap<String, String>> eventsList;

    private int selectedPosition = -1;
    private String selectedColorMode = WidgetThemes.MODE_DEFAULT;
    private String selectedUnitMode  = UNIT_YMD;

    private SeekBar  opacitySeekBar;
    private TextView opacityLabel;
    private ImageView wallpaperPreview;
    private TextView  wallpaperNoneLabel;
    private Button    btnRemoveWallpaper;
    private GridLayout themeGrid;
    private TextView   themeLabel;
    private android.widget.RadioGroup unitRadioGroup;

    private String wallpaperBase64 = null;
    private ActivityResultLauncher<String> imagePickerLauncher;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_countdate_widget_config);

        Intent configIntent = getIntent();
        Bundle extras = configIntent.getExtras();
        if (extras != null) {
            appWidgetId = extras.getInt(
                    AppWidgetManager.EXTRA_APPWIDGET_ID,
                    AppWidgetManager.INVALID_APPWIDGET_ID);
        }
        Intent resultValue = new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        setResult(RESULT_CANCELED, resultValue);
        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish();
            return;
        }

        AppWidgetManager mgr = AppWidgetManager.getInstance(this);
        providerClass = WidgetHelper.providerClassFor(mgr, appWidgetId);

        SharedPreferences prefs = getSharedPreferences(SHARED_PREFS, MODE_PRIVATE);
        int defaultOpacity = WidgetThemes.defaultOpacityFor(providerClass);
        int savedOpacity = prefs.contains(KEY_OPACITY_PREFIX + appWidgetId)
                ? prefs.getInt(KEY_OPACITY_PREFIX + appWidgetId, defaultOpacity)
                : defaultOpacity;
        wallpaperBase64  = prefs.getString(KEY_WALLPAPER_PREFIX + appWidgetId, null);
        selectedColorMode = prefs.getString(KEY_COLOR_PREFIX + appWidgetId, WidgetThemes.MODE_DEFAULT);
        selectedUnitMode  = prefs.getString(KEY_UNIT_PREFIX  + appWidgetId, UNIT_YMD);

        unitRadioGroup = findViewById(R.id.unit_radiogroup);
        if (UNIT_DAYS.equals(selectedUnitMode)) {
            unitRadioGroup.check(R.id.radio_unit_days);
        } else if (UNIT_MONTHS.equals(selectedUnitMode)) {
            unitRadioGroup.check(R.id.radio_unit_months);
        } else if (UNIT_YEARS.equals(selectedUnitMode)) {
            unitRadioGroup.check(R.id.radio_unit_years);
        } else if (UNIT_WEEKS.equals(selectedUnitMode)) {
            unitRadioGroup.check(R.id.radio_unit_weeks);
        } else if (UNIT_TIME.equals(selectedUnitMode)) {
            unitRadioGroup.check(R.id.radio_unit_time);
        } else {
            unitRadioGroup.check(R.id.radio_unit_ymd);
        }

        unitRadioGroup.setOnCheckedChangeListener((group, checkedId) -> {
            if (checkedId == R.id.radio_unit_days) {
                selectedUnitMode = UNIT_DAYS;
            } else if (checkedId == R.id.radio_unit_months) {
                selectedUnitMode = UNIT_MONTHS;
            } else if (checkedId == R.id.radio_unit_years) {
                selectedUnitMode = UNIT_YEARS;
            } else if (checkedId == R.id.radio_unit_weeks) {
                selectedUnitMode = UNIT_WEEKS;
            } else if (checkedId == R.id.radio_unit_time) {
                selectedUnitMode = UNIT_TIME;
            } else {
                selectedUnitMode = UNIT_YMD;
            }
        });

        opacitySeekBar = findViewById(R.id.opacity_seekbar);
        opacityLabel   = findViewById(R.id.opacity_label);

        int initialProgress = Math.round(savedOpacity * 100f / 255f);
        opacitySeekBar.setProgress(initialProgress);
        opacityLabel.setText(initialProgress + "%");

        opacitySeekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override public void onProgressChanged(SeekBar s, int p, boolean fromUser) {
                opacityLabel.setText(p + "%");
            }
            @Override public void onStartTrackingTouch(SeekBar s) {}
            @Override public void onStopTrackingTouch(SeekBar s) {}
        });

        themeGrid  = findViewById(R.id.theme_grid);
        themeLabel = findViewById(R.id.theme_selected_label);
        rebuildThemeGrid(prefs);

        wallpaperPreview   = findViewById(R.id.wallpaper_preview);
        wallpaperNoneLabel = findViewById(R.id.wallpaper_none_label);
        btnRemoveWallpaper = findViewById(R.id.btn_remove_wallpaper);

        if (wallpaperBase64 != null) {
            showWallpaperPreview(wallpaperBase64);
        }

        imagePickerLauncher = registerForActivityResult(
                new ActivityResultContracts.GetContent(),
                uri -> {
                    if (uri != null) {
                        processPickedImage(uri);
                    }
                }
        );

        Button btnPickWallpaper = findViewById(R.id.btn_pick_wallpaper);
        btnPickWallpaper.setOnClickListener(v -> imagePickerLauncher.launch("image/*"));

        btnRemoveWallpaper.setOnClickListener(v -> {
            wallpaperBase64 = null;
            wallpaperPreview.setVisibility(View.GONE);
            wallpaperNoneLabel.setVisibility(View.VISIBLE);
            btnRemoveWallpaper.setVisibility(View.GONE);
        });

        eventsList = new ArrayList<>();
        LinearLayout eventsContainer = findViewById(R.id.events_container);
        String strJson = prefs.getString(KEY_DATA, null);
        if (strJson != null) {
            try {
                JSONArray response = new JSONArray(strJson);
                for (int x = 0; x < response.length(); x++) {
                    JSONObject eventObj = response.getJSONObject(x);
                    String eventName = eventObj.optString("event_name", "Event");
                    String eventDate = eventObj.optString("date", "");
                    String eventId   = eventObj.optString("id", String.valueOf(x));
                    String[] parts   = eventDate.split("T");

                    HashMap<String, String> event = new HashMap<>();
                    event.put("name",    eventName);
                    event.put("date",    parts.length > 0 ? parts[0] : eventDate);
                    event.put("rawDate", eventDate);
                    event.put("id",      eventId);
                    eventsList.add(event);
                }
                if (response.length() == 0) addNoDataEntry();
            } catch (JSONException e) {
                addNoDataEntry();
            }
        } else {
            addNoDataEntry();
        }

        String existingEventId = prefs.getString(KEY_ID_PREFIX + appWidgetId, null);
        if (existingEventId != null) {
            for (int i = 0; i < eventsList.size(); i++) {
                if (existingEventId.equals(eventsList.get(i).get("id"))) {
                    selectedPosition = i;
                    break;
                }
            }
        }

        // Dynamically inflate each event item so all events scroll naturally with the ScrollView
        eventsContainer.removeAllViews();
        final ArrayList<View> itemViews = new ArrayList<>();
        for (int i = 0; i < eventsList.size(); i++) {
            final int pos = i;
            HashMap<String, String> ev = eventsList.get(i);
            View itemView = getLayoutInflater().inflate(R.layout.row_layout, eventsContainer, false);
            TextView titleView = itemView.findViewById(R.id.textView);
            TextView dateView  = itemView.findViewById(R.id.textView2);

            titleView.setText(ev.get("name"));
            dateView.setText(ev.get("date"));

            boolean isCurrentSelected = (selectedPosition == pos);
            itemView.setAlpha(selectedPosition == -1 || isCurrentSelected ? 1.0f : 0.45f);
            if (isCurrentSelected) {
                itemView.setBackgroundColor(0x226750A4);
            } else {
                itemView.setBackgroundColor(0x00000000);
            }

            itemView.setOnClickListener(v -> {
                selectedPosition = pos;
                for (View otherView : itemViews) {
                    otherView.setAlpha(0.45f);
                    otherView.setBackgroundColor(0x00000000);
                }
                v.setAlpha(1.0f);
                v.setBackgroundColor(0x226750A4);
                Toast.makeText(this, "Selected: " + ev.get("name"), Toast.LENGTH_SHORT).show();
            });

            itemViews.add(itemView);
            eventsContainer.addView(itemView);

            // Subtle divider between items
            if (i < eventsList.size() - 1) {
                View divider = new View(this);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT, dp(1));
                lp.setMargins(dp(16), 0, dp(16), 0);
                divider.setLayoutParams(lp);
                divider.setBackgroundColor(0x1A000000);
                eventsContainer.addView(divider);
            }
        }

        Button btnAdd = findViewById(R.id.btn_add_widget);
        if (selectedPosition >= 0) {
            btnAdd.setText("Save Widget");
        }
        btnAdd.setOnClickListener(v -> {
            if (selectedPosition < 0) {
                Toast.makeText(this, "Please select an event first.", Toast.LENGTH_SHORT).show();
                return;
            }
            confirmConfig(selectedPosition);
        });
    }

    private void rebuildThemeGrid(SharedPreferences prefs) {
        themeGrid.removeAllViews();
        themeLabel.setText(WidgetThemes.nameForThemeId(selectedColorMode));

        addSwatch(WidgetThemes.MODE_DEFAULT, "Default",
                WidgetThemes.defaultColorFor(providerClass));
        addSwatch(WidgetThemes.MODE_APP, "App theme",
                WidgetThemes.colorForThemeId(prefs.getString(WidgetThemes.APP_THEME_PREF, "purple")));
        for (WidgetThemes.Swatch swatch : WidgetThemes.APP_SWATCHES) {
            addSwatch(swatch.id, swatch.name, swatch.color);
        }
    }

    private void addSwatch(String id, String name, int color) {
        boolean selected = id.equals(selectedColorMode);
        int size = dp(40);
        ImageView iv = new ImageView(this);
        GridLayout.LayoutParams lp = new GridLayout.LayoutParams();
        lp.width = size;
        lp.height = size;
        lp.setMargins(dp(5), dp(5), dp(5), dp(5));
        iv.setLayoutParams(lp);

        GradientDrawable gd = new GradientDrawable();
        gd.setShape(GradientDrawable.OVAL);
        gd.setColor(color);
        gd.setStroke(selected ? dp(3) : dp(1), selected ? 0xFF21005D : 0x33000000);
        iv.setBackground(gd);
        iv.setContentDescription(name);
        if (WidgetThemes.MODE_DEFAULT.equals(id) || WidgetThemes.MODE_APP.equals(id)) {
            TextView badge = new TextView(this);
            badge.setText(WidgetThemes.MODE_APP.equals(id) ? "A" : "D");
            badge.setTextColor(WidgetThemes.isLightColor(color) ? 0xFF1D1B20 : 0xFFFFFFFF);
            badge.setTextSize(12);
            badge.setGravity(Gravity.CENTER);
            badge.setLayoutParams(lp);
            GradientDrawable bg = new GradientDrawable();
            bg.setShape(GradientDrawable.OVAL);
            bg.setColor(color);
            bg.setStroke(selected ? dp(3) : dp(1), selected ? 0xFF21005D : 0x33000000);
            badge.setBackground(bg);
            badge.setOnClickListener(v -> selectColorMode(id));
            themeGrid.addView(badge);
            return;
        }

        iv.setOnClickListener(v -> selectColorMode(id));
        themeGrid.addView(iv);
    }

    private void selectColorMode(String id) {
        selectedColorMode = id;
        rebuildThemeGrid(getSharedPreferences(SHARED_PREFS, MODE_PRIVATE));
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void addNoDataEntry() {
        HashMap<String, String> event = new HashMap<>();
        event.put("name",    "No data");
        event.put("date",    "No data");
        event.put("rawDate", "No data");
        event.put("id",      "0");
        eventsList.add(event);
    }

    private void showWallpaperPreview(String base64) {
        try {
            byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
            Bitmap bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
            if (bmp != null) {
                wallpaperPreview.setImageBitmap(bmp);
                wallpaperPreview.setVisibility(View.VISIBLE);
                wallpaperNoneLabel.setVisibility(View.GONE);
                btnRemoveWallpaper.setVisibility(View.VISIBLE);
            }
        } catch (Exception ignored) {}
    }

    private void processPickedImage(Uri uri) {
        try (InputStream in = getContentResolver().openInputStream(uri)) {
            if (in == null) return;

            Bitmap original = BitmapFactory.decodeStream(in);
            if (original == null) return;

            Bitmap scaled = scaleBitmap(original, 512);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            scaled.compress(Bitmap.CompressFormat.JPEG, 72, baos);
            wallpaperBase64 = Base64.encodeToString(baos.toByteArray(), Base64.NO_WRAP);

            showWallpaperPreview(wallpaperBase64);
        } catch (IOException e) {
            Toast.makeText(this, "Could not load image.", Toast.LENGTH_SHORT).show();
        }
    }

    private static Bitmap scaleBitmap(Bitmap src, int maxPx) {
        int w = src.getWidth(), h = src.getHeight();
        if (w <= maxPx && h <= maxPx) return src;
        float scale = maxPx / (float) Math.max(w, h);
        return Bitmap.createScaledBitmap(src, Math.round(w * scale), Math.round(h * scale), true);
    }

    public void confirmConfig(int position) {
        if (position >= eventsList.size()) return;

        HashMap<String, String> selected = eventsList.get(position);
        String eventName = selected.get("name");
        String eventDate = selected.get("rawDate");
        String eventId   = selected.get("id");

        int opacityAlpha = Math.round(opacitySeekBar.getProgress() * 255f / 100f);

        SharedPreferences.Editor editor = getSharedPreferences(SHARED_PREFS, MODE_PRIVATE).edit();
        editor.putString(KEY_ID_PREFIX    + appWidgetId, eventId);
        editor.putString(KEY_NAME_PREFIX  + appWidgetId, eventName);
        editor.putString(KEY_DATE_PREFIX  + appWidgetId, eventDate);
        editor.putInt   (KEY_OPACITY_PREFIX   + appWidgetId, opacityAlpha);
        editor.putString(KEY_COLOR_PREFIX     + appWidgetId, selectedColorMode);
        editor.putString(KEY_UNIT_PREFIX      + appWidgetId, selectedUnitMode);

        if (wallpaperBase64 != null) {
            editor.putString(KEY_WALLPAPER_PREFIX + appWidgetId, wallpaperBase64);
        } else {
            editor.remove(KEY_WALLPAPER_PREFIX + appWidgetId);
        }
        editor.apply();

        AppWidgetManager mgr = AppWidgetManager.getInstance(this);
        WidgetHelper.updateWidget(this, mgr, appWidgetId, providerClass);
        WidgetHelper.scheduleMidnightUpdate(this);

        Intent resultValue = new Intent();
        resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        setResult(RESULT_OK, resultValue);
        finish();
    }
}
