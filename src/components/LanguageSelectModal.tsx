import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonRadio, IonRadioGroup, IonTitle, IonToolbar } from "@ionic/react";
import { language } from "ionicons/icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trigger } from "../lib/Events";

export default function LanguageSelectModal({accent}:{accent: string;}) {
  const {t,i18n} = useTranslation()

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [radioSelected, setRadioSelected] = useState("en");

  const allLangName = ["kn", "en", "hi", "te", "ta", "mr", "bn", "de", "es"];
  const langAndDetail: any = {
    "kn": {
      name: "ಕನ್ನಡ (Kannada)",
      by: "Sourabh Kulkarni"
    },
    "en": {
      name: "English",
      by: "Sourabh Kulkarni"
    },
    "hi": {
      name: "हिन्दी (Hindi)",
      by: "Sourabh Kulkarni"
    },
    "te": {
      name: "తెలుగు (Telugu)",
      by: "Sourabh Kulkarni"
    },
    "ta": {
      name: "தமிழ் (Tamil)",
      by: "Sourabh Kulkarni"
    },
    "mr": {
      name: "मराठी (Marathi)",
      by: "Sourabh Kulkarni"
    },
    "bn": {
      name: "বাংলা (Bengali)",
      by: "Sourabh Kulkarni"
    },
    "de": {
      name: "Deutsch (German)",
      by: "natowi"
    },
    "es": {
      name: "Español (Spanish)",
      by: "calu25"
    },
  }
  return (
    <>
      <IonLabel onClick={() => setModalIsOpen(true)}>
        <IonIcon icon={language} /> {t("c.settings.changeLang")}
      </IonLabel>

      <IonModal isOpen={modalIsOpen} onDidDismiss={() => setModalIsOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{t("c.settings.changeLang")}</IonTitle>
            <IonButtons slot="start">
              <IonButton color={accent} onClick={() => setModalIsOpen(false)}>
                {t("g.close")}
              </IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton color={accent} onClick={() => {
                i18n.changeLanguage(radioSelected);
                setModalIsOpen(false)
                trigger("countdate_data:change")
              }}>
                {t("g.confirm")}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            <IonRadioGroup
              onIonChange={(e) => {
                setRadioSelected(e.detail.value);
              }}
              value={radioSelected}
            >
              {allLangName.map((element) => (
                <IonItem key={element}>
                  <IonRadio color={accent} value={element}>
                    <h6>{langAndDetail[element].name}</h6>
                    <small>{langAndDetail[element].by}</small>
                  </IonRadio>
                </IonItem>
              ))}
            </IonRadioGroup>
          </IonList>
        </IonContent>
      </IonModal>
    </>
  )
}
