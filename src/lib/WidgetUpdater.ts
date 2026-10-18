import { registerPlugin } from "@capacitor/core";

interface WidgetUpdaterPlugin {
  updateWidgets(): Promise<void>;
}

const WidgetUpdater = registerPlugin<WidgetUpdaterPlugin>("WidgetUpdater");

export async function refreshNativeWidgets(): Promise<void> {
  try {
    await WidgetUpdater.updateWidgets();
  } catch {
    // Silently ignore in browser/dev mode or unsupported platforms
  }
}
