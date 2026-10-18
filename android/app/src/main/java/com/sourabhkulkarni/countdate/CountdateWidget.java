package com.sourabhkulkarni.countdate;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.os.Bundle;

public class CountdateWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            WidgetHelper.updateWidget(context, appWidgetManager, appWidgetId, CountdateWidget.class);
        }
        WidgetHelper.scheduleMidnightUpdate(context);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        WidgetHelper.updateWidget(context, appWidgetManager, appWidgetId, CountdateWidget.class);
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        WidgetHelper.deleteWidgetPrefs(context, appWidgetIds);
    }
}
