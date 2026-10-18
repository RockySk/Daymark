import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  isPlatform,
  IonList,
  IonItem,
  IonLabel,
  IonListHeader,
  IonToggle,
  IonIcon,
  IonRouterLink,
} from "@ionic/react";
import {
  code,
  contrast,
  documentText,
  help,
  information,
  phonePortraitOutline,
  notifications,
  pricetagsOutline,
  text,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { testNotification } from "../data/reminders";
import { Preferences as Storage } from "@capacitor/preferences";
import key from "../lib/storageKey.json";
import { useEffect, useState } from "react";
import { trigger } from "../lib/Events";
import ThemeSelectModal from "../components/ThemeSelectModal";
import FontSelectModal from "../components/FontSelectModal";
import TextColorSelectModal from "../components/TextColorSelectModal";
import "./Settings.css";
import { useHistory } from "react-router";
import LocalizeBackButton from "../components/LocalizeBackButton";
import LanguageSelectModal from "../components/LanguageSelectModal";
import { Device } from "@capacitor/device";

const Settings: React.FC<{ accent: string; setView: any }> = ({
  accent,
  setView,
}) => {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<"ios" | "android" | "web">("android");
  const [darkChecked, setDarkChecked] = useState<boolean>();
  const [devChecked, setDevChecked] = useState<boolean>(false);
  const [relativeChecked, setRelativeChecked] = useState<boolean>(false);
  const history = useHistory();

  const getDevMode = async () => {
    const { value } = await Storage.get({ key: key.dev });
    if (value === "true") setDevChecked(true);
  };
  const getRelativeMode = async () => {
    const { value } = await Storage.get({ key: key.relative });
    if (value === "true") setRelativeChecked(true);
  };

  const toggleDevModeHandler = async () => {
    const tovalue = !devChecked;
    await Storage.set({ key: key.dev, value: tovalue.toString() });
    setDevChecked(tovalue);
    trigger("countdate_dev:change");
  };

  const toggleRelativeModeHandler = async () => {
    const tovalue = !relativeChecked;
    await Storage.set({ key: key.relative, value: tovalue.toString() });
    setRelativeChecked(tovalue);
    setView("days");
    trigger("countdate_relative:change");
  };

  const darkEnable = (value: any) => {
    let darkmodeEnable;
    const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
    matchMedia.addEventListener("change", () => getDarkMode());
    if (value === "dark") {
      darkmodeEnable = true;
      document.body.classList.add("dark");
    } else if (value === "light") {
      darkmodeEnable = false;
      document.body.classList.remove("dark");
    } else if (matchMedia.matches) {
      darkmodeEnable = matchMedia.matches;
      document.body.classList.add("dark");
    } else {
      darkmodeEnable = matchMedia.matches;
      document.body.classList.remove("dark");
    }
    return darkmodeEnable;
  };
  const getDarkMode = async () => {
    const { value } = await Storage.get({ key: key.theme });
    setDarkChecked(darkEnable(value));
  };
  const toggleDarkModeHandler = async () => {
    if (darkChecked) {
      await Storage.set({ key: key.theme, value: "light" });
      document.body.classList.remove("dark");
    } else {
      await Storage.set({ key: key.theme, value: "dark" });
      document.body.classList.add("dark");
    }
    setDarkChecked(!darkChecked);
  };
  const darkmodeToSystem = async () => {
    const sys = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkChecked(sys);
    if (sys) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    await Storage.set({ key: key.theme, value: "" });
  };

  const handleReviewTour = async () => {
    await Storage.remove({ key: key.firstTime });
    history.push("/home");
    setTimeout(() => trigger("countdate_first:change"), 500);
  };

  useEffect(() => {
    getDevMode();
    getRelativeMode();
    getDarkMode();
    const getDevicePlatform = async () => {
      const info = await Device.getInfo();
      setPlatform(info.platform);
    };
    getDevicePlatform();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <LocalizeBackButton color={accent} />
          <IonTitle>{t("p.settings.title")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div
          style={{ paddingBottom: "calc(var(--ion-safe-area-bottom) + 12px)" }}
        >
          <IonList inset>
            <IonListHeader>
              <IonLabel>{t("p.settings.general.title")}</IonLabel>
            </IonListHeader>
            <IonItem>
              <LanguageSelectModal accent={accent} />
            </IonItem>
            <IonRouterLink routerLink="/categories">
              <IonItem>
                <IonIcon slot="start" icon={pricetagsOutline} color={accent} />
                <IonLabel color="dark">
                  {t("p.settings.general.categories")}
                </IonLabel>
              </IonItem>
            </IonRouterLink>
            <IonItem>
              <IonIcon slot="start" icon={text} color={accent} />
              <IonToggle
                checked={relativeChecked}
                onClick={toggleRelativeModeHandler}
                color={accent}
              >
                {t("p.settings.general.toggleRelativeMode")}
              </IonToggle>
            </IonItem>
            <IonItem button onClick={handleReviewTour}>
              <IonIcon slot="start" icon={help} color={accent} />
              <IonLabel>{t("p.settings.general.reviewTour")}</IonLabel>
            </IonItem>
            <IonRouterLink routerLink="/backup">
              <IonItem>
                <IonIcon slot="start" icon={documentText} color={accent} />
                <IonLabel color="dark">
                  {t("p.settings.general.backup")}
                </IonLabel>
              </IonItem>
            </IonRouterLink>
            <IonRouterLink routerLink="/about">
              <IonItem>
                <IonIcon slot="start" icon={information} color={accent} />
                <IonLabel color="dark">
                  {t("p.settings.general.about")}
                </IonLabel>
              </IonItem>
            </IonRouterLink>
          </IonList>

          <IonList inset>
            <IonListHeader>
              <IonLabel>{t("p.settings.theme.title")}</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonIcon slot="start" icon={contrast} color={accent} />
              <IonToggle
                checked={darkChecked}
                onClick={toggleDarkModeHandler}
                color={accent}
              >
                {t("p.settings.theme.toggleDarkMode")}
              </IonToggle>
            </IonItem>
            <IonItem button onClick={darkmodeToSystem}>
              <IonIcon slot="start" icon={phonePortraitOutline} color={accent} />
              <IonLabel>{t("p.settings.theme.followSystem")}</IonLabel>
            </IonItem>
            <IonItem>
              <ThemeSelectModal />
            </IonItem>
            <IonItem>
              <FontSelectModal accent={accent} />
            </IonItem>
            {platform === "android" && (
              <IonItem>
                <TextColorSelectModal accent={accent} />
              </IonItem>
            )}
          </IonList>

          {platform === "android" && (
            <IonList inset>
              <IonListHeader>
                <IonLabel>{t("p.settings.advanced.title")}</IonLabel>
              </IonListHeader>
              <IonItem>
                <IonIcon slot="start" icon={code} color={accent} />
                <IonToggle
                  checked={devChecked}
                  onClick={toggleDevModeHandler}
                  color={accent}
                >
                  {t("p.settings.general.toggleDevMode")}
                </IonToggle>
              </IonItem>
              {isPlatform("hybrid") && devChecked && (
                <>
                  <IonItem button onClick={testNotification}>
                    <IonIcon slot="start" icon={notifications} color={accent} />
                    <IonLabel>
                      {t("p.settings.general.testLocalNotification")}
                    </IonLabel>
                  </IonItem>
                  <IonItem button onClick={() => window.location.reload()}>
                    <IonIcon slot="start" icon={phonePortraitOutline} color={accent} />
                    <IonLabel>
                      {t("p.settings.general.webFrontendReload")}
                    </IonLabel>
                  </IonItem>
                </>
              )}
            </IonList>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
