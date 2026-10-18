package com.sourabhkulkarni.countdate;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(WidgetUpdaterPlugin.class);
    super.onCreate(savedInstanceState);
    WidgetHelper.updateAllWidgets(this);
    WidgetHelper.scheduleMidnightUpdate(this);
  }

  @Override
  public void onStart() {
    super.onStart();
    if (getBridge() != null && getBridge().getWebView() != null) {
      WebView webview = getBridge().getWebView();
      webview.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
    }
    WidgetHelper.updateAllWidgets(this);
    WidgetHelper.scheduleMidnightUpdate(this);
  }

  @Override
  public void onResume() {
    super.onResume();
    WidgetHelper.updateAllWidgets(this);
    WidgetHelper.scheduleMidnightUpdate(this);
  }
}
