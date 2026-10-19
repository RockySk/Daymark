package com.sourabhkulkarni.daymark;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.os.Bundle;

public class DarkWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) {
            WidgetHelper.updateWidget(context, mgr, id, DarkWidget.class);
        }
        WidgetHelper.scheduleMidnightUpdate(context);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        WidgetHelper.updateWidget(context, appWidgetManager, appWidgetId, DarkWidget.class);
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        WidgetHelper.deleteWidgetPrefs(context, appWidgetIds);
    }
}
