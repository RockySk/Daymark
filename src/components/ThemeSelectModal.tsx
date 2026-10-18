import { useState, useEffect } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonLabel,
  IonIcon,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { Preferences } from "@capacitor/preferences";
import key from "../lib/storageKey.json";
import { trigger } from "../lib/Events";
import { colorPalette, checkmarkCircle } from "ionicons/icons";
import { APP_THEMES, findTheme, applyTheme } from "../data/themes";
import { refreshNativeWidgets } from "../lib/WidgetUpdater";
import "./ThemeSelectModal.css";

export default function ThemeSelectModal() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("purple");

  useEffect(() => {
    Preferences.get({ key: key.appTheme }).then(({ value }) => {
      if (value) setSelected(value);
    });
  }, []);

  const save = async (id: string) => {
    setSelected(id);
    await Preferences.set({ key: key.appTheme, value: id });
    await Preferences.set({ key: key.accent, value: "primary" });
    applyTheme(findTheme(id));
    trigger("countdate_accent:change");
    await refreshNativeWidgets();
    setOpen(false);
  };

  return (
    <>
      <IonLabel onClick={() => setOpen(true)}>
        <IonIcon icon={colorPalette} /> {t("c.settings.changeAccent")}
      </IonLabel>

      <IonModal isOpen={open} onDidDismiss={() => setOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>App Theme</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setOpen(false)}>
                {t("g.close")}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="theme-grid">
            {APP_THEMES.map((theme) => {
              const isDark = document.body.classList.contains("dark");
              const palette = isDark ? theme.dark : theme.light;
              const isActive = selected === theme.id;

              return (
                <button
                  key={theme.id}
                  className={`theme-card ${isActive ? "theme-card--active" : ""}`}
                  onClick={() => save(theme.id)}
                  style={{
                    ["--tc-primary" as any]: palette.primary,
                    ["--tc-tint" as any]: palette.primaryTint,
                    background: palette.pageGradient,
                  }}
                >
                  {isActive && (
                    <IonIcon icon={checkmarkCircle} className="theme-card__check" />
                  )}
                  <div className="theme-card__preview">
                    <div className="theme-card__dot" />
                    <div className="theme-card__lines">
                      <span />
                      <span />
                    </div>
                  </div>
                  <div className="theme-card__name">
                    <span>{theme.emoji}</span> {theme.name}
                  </div>
                </button>
              );
            })}
          </div>
        </IonContent>
      </IonModal>
    </>
  );
}
