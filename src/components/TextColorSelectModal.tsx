import { useState } from "react";
import {
  IonIcon,
  IonLabel,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
} from "@ionic/react";
import { refresh, save, text } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { Preferences } from "@capacitor/preferences";
import key from "../lib/storageKey.json";
import { trigger } from "../lib/Events";
import { ChromePicker } from "react-color";
import "./TextColorSelectModal.css";

export function applyTextColor(color: string) {
  if (color) {
    document.documentElement.style.setProperty("--ion-text-color", color);
    document.documentElement.style.setProperty("--ion-color-dark", color);
  } else {
    document.documentElement.style.removeProperty("--ion-text-color");
    document.documentElement.style.removeProperty("--ion-color-dark");
  }
}

export default function TextColorSelectModal({ accent }: { accent: string }) {
  const { t } = useTranslation();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [hex, setHex] = useState("#000000");

  const saveColor = async () => {
    await Preferences.set({ key: key.textColor, value: hex });
    applyTextColor(hex);
    trigger("countdate_text:change");
    setModalIsOpen(false);
  };

  const resetColor = async () => {
    await Preferences.remove({ key: key.textColor });
    applyTextColor("");
    trigger("countdate_text:change");
    setModalIsOpen(false);
  };

  const openPicker = async () => {
    const { value } = await Preferences.get({ key: key.textColor });
    if (value) setHex(value);
    setModalIsOpen(true);
  };

  return (
    <>
      <IonLabel onClick={openPicker}>
        <IonIcon icon={text} /> {t("c.settings.changeTextColor")}
      </IonLabel>

      <IonModal isOpen={modalIsOpen} onDidDismiss={() => setModalIsOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{t("c.settings.changeTextColor")}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setModalIsOpen(false)} color={accent}>
                {t("g.close")}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonButton
            onClick={resetColor}
            expand="block"
            shape="round"
            color={accent}
            fill="outline"
            className="ion-margin-bottom"
          >
            <IonIcon icon={refresh} slot="start" />
            Reset to Default
          </IonButton>

          <div style={{ marginBottom: 20 }}>
            <p
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                color: hex,
                textAlign: "center",
                margin: "20px 0",
              }}
            >
              Text Color
            </p>
            <p
              style={{
                fontSize: "1rem",
                color: hex,
                textAlign: "center",
                margin: "0 0 20px",
              }}
            >
              This color will apply to all text in the app
            </p>
          </div>

          <ChromePicker
            onChangeComplete={(color: any) => setHex(color.hex)}
            color={hex}
            disableAlpha
          />

          <IonButton
            onClick={saveColor}
            expand="block"
            shape="round"
            color={accent}
            className="ion-margin-top"
            style={{ marginTop: 20 }}
          >
            <IonIcon icon={save} slot="start" />
            Save Color
          </IonButton>
        </IonContent>
      </IonModal>
    </>
  );
}
