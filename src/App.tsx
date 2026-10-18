import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from '@ionic/react-router';
import { App as NativeApp } from "@capacitor/app";
import { useHistory } from "react-router";
import Home from "./pages/Home";
import Add from "./pages/Add";
import Settings from "./pages/Settings";
import Edit from "./pages/Edit";
import About from "./pages/About";
import EventDetail from "./pages/EventDetail";

import "./lib/Darkmode";
import AppTour from "./components/AppTour";
import { findTheme, applyTheme } from "./data/themes";
import { refreshNativeWidgets } from "./lib/WidgetUpdater";
import { applyFont } from "./components/FontSelectModal";
import { applyTextColor } from "./components/TextColorSelectModal";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import { Preferences } from "@capacitor/preferences";
import key from "./lib/storageKey.json";
import { useState } from "react";
import { on } from "./lib/Events";
import { useTranslation } from "react-i18next";
import Share from "./pages/Share";
import AppUrlListener from './pages/AppUrlListener';
import Backup from "./pages/Backup";
import Categories from "./pages/Categories";

// Ionic setup — Material Design everywhere for a Material You look on Android.
setupIonicReact({
  mode: "md",
});

function App() {
  const history = useHistory();
  const [view, setView] = useState("days");
  const [accentColor, setAccentColor] = useState<string>("primary");
  const [textColor, setTextColor] = useState<string>("");
  const [firstTime, setFirstTime] = useState<boolean>(false);
  const [relative, setRelative] = useState<boolean>(false)
  // Hardware back button
  NativeApp.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      history.goBack();
    }
  });

  const getRelativeMode = async () => {
    const { value } = await Preferences.get({ key: key.relative });
    if (value === "true") {
      setRelative(true);
    } else {
      setRelative(false);
    }
  }

  // Restore app theme (applies CSS variables for the selected palette)
  const getAppTheme = async () => {
    const { value } = await Preferences.get({ key: key.appTheme });
    const theme = findTheme(value || "purple");
    applyTheme(theme);
    await refreshNativeWidgets();
  };

  // Restore accent color
  const getAccentColor = async () => {
    const { value } = await Preferences.get({ key: key.accent });
    if (value != null) {
      setAccentColor(value);
    }
  };
  // Restore text color
  const getTextColor = async () => {
    const { value } = await Preferences.get({ key: key.textColor });
    if (value != null) {
      setTextColor(value);
      applyTextColor(value);
    } else {
      setTextColor("");
    }
  };

  // Show welcome modal if it's first time
  let count = 0;
  const getFirstTime = async () => {
    if (count < 1) {
      const { value } = await Preferences.get({ key: key.firstTime });
      if (value == null) {
        setFirstTime(true);
        await Preferences.set({
          key: key.firstTime,
          value: "false",
        });
        count += 1;
      }
    }
  };
  // Restore font
  const getAppFont = async () => {
    const { value } = await Preferences.get({ key: key.appFont });
    if (value) applyFont(value);
  };

  // Restore settings
  getAppTheme();
  getAccentColor();
  getAppFont();
  getTextColor();
  getFirstTime();
  getRelativeMode()
  on("countdate_accent:change", () => {
    getAccentColor();
  });
  on("countdate_text:change", () => {
    getTextColor();
  });
  on("countdate_first:change", () => {
    getFirstTime();
  });
  on("countdate_relative:change", () => {
    getRelativeMode();
  })

  return (
    <IonApp>
      <IonReactRouter>
        <AppUrlListener />
        <IonRouterOutlet>
          <Route exact path="/home">
            <Home accent={accentColor} view={view} setView={setView} relative={relative} />
            <AppTour
              modal={firstTime}
              setModal={setFirstTime}
              color={accentColor}
            />
          </Route>
          <Route exact path="/add">
            <Add accent={accentColor} />
          </Route>
          <Route exact path="/settings">
            <Settings accent={accentColor} setView={setView} />
          </Route>
          <Route exact path="/edit">
            <Edit accent={accentColor} />
          </Route>
          <Route exact path="/categories">
            <Categories accent={accentColor} />
          </Route>
          <Route exact path="/event">
            <EventDetail accent={accentColor} view={view} relative={relative} />
          </Route>
          <Route exact path="/about">
            <About accent={accentColor} />
          </Route>
          <Route exact path="/backup">
            <Backup accent={accentColor} />
          </Route>
          <Route exact path="/share">
            <Share accent={accentColor} />
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
