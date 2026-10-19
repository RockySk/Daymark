package com.sourabhkulkarni.daymark;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetUpdater")
public class WidgetUpdaterPlugin extends Plugin {
    @PluginMethod
    public void updateWidgets(PluginCall call) {
        WidgetHelper.updateAllWidgets(getContext());
        WidgetHelper.scheduleMidnightUpdate(getContext());
        call.resolve();
    }
}
