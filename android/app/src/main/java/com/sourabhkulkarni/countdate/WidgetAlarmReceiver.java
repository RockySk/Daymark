package com.sourabhkulkarni.countdate;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class WidgetAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (context == null) return;

        // Refresh all widgets immediately upon receiving time/date changes, boot, or alarm
        WidgetHelper.updateAllWidgets(context);

        // Reschedule next midnight update
        WidgetHelper.scheduleMidnightUpdate(context);
    }
}
