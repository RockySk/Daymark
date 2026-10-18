import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  getPlatforms,
  IonChip,
  IonItem,
  IonLabel,
  IonIcon,
  IonList,
  IonNote,
} from "@ionic/react";
import {
  mailOutline,
  bulbOutline,
  bugOutline,
  heart,
  personCircleOutline,
} from "ionicons/icons";
import packageJson from "../../package.json";
import { useTranslation } from "react-i18next";
import logo from "../assets/countdateapp-logo-foreground.png";
import karnatakaFlag from "../assets/karnataka-flag.png";
import LocalizeBackButton from "../components/LocalizeBackButton";

// All user feedback is routed to the developer's inbox.
const DEV_EMAIL = "developer.sourabhk@gmail.com";

const mailto = (subject: string, body: string) =>
  `mailto:${DEV_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

const About: React.FC<{ accent: string }> = ({ accent }) => {
  const { t } = useTranslation();

  const deviceLine = `\n\n---\nApp version: ${
    packageJson.version
  }\nPlatform: ${getPlatforms().join(", ")}`;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <LocalizeBackButton color={accent} />
          <IonTitle>{t("p.about.title")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div
          style={{ paddingBottom: "calc(var(--ion-safe-area-bottom) + 24px)" }}
        >
          <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
            <img src={logo} alt="Daymark" width="84" height="84" />
            <h1 style={{ margin: "8px 0 0", fontWeight: 700 }}>Daymark</h1>
            <IonNote>
              {t("p.about.version", { versionName: packageJson.version })}
            </IonNote>
            <p
              style={{
                margin: "12px 16px",
                color: "var(--m3-on-surface-variant)",
              }}
            >
              {t("p.about.slogan")}
            </p>
            <div>
              {getPlatforms().map((p, i) => (
                <IonChip key={i} color={accent}>
                  {p}
                </IonChip>
              ))}
            </div>
          </div>

          {/* Developer */}
          <div className="home-section-title" style={{ margin: "20px 20px 0" }}>
            {t("p.about.developer")}
          </div>
          <IonList inset>
            <IonItem lines="none">
              <IonIcon slot="start" icon={personCircleOutline} color={accent} />
              <IonLabel>
                <h2>Sourabh Kulkarni</h2>
                <p>{DEV_EMAIL}</p>
              </IonLabel>
            </IonItem>
          </IonList>

          {/* Feedback — everything mails the developer */}
          <div className="home-section-title" style={{ margin: "20px 20px 0" }}>
            {t("p.about.feedbackTitle")}
          </div>
          <IonList inset>
            <IonItem
              button
              detail
              href={mailto(
                "Daymark — Feature Request",
                "I'd love it if Daymark could…" + deviceLine
              )}
            >
              <IonIcon slot="start" icon={bulbOutline} color={accent} />
              <IonLabel>{t("p.about.link.feature")}</IonLabel>
            </IonItem>
            <IonItem
              button
              detail
              href={mailto(
                "Daymark — Bug Report",
                "I found a problem:\n\nSteps to reproduce:\n1. " + deviceLine
              )}
            >
              <IonIcon slot="start" icon={bugOutline} color={accent} />
              <IonLabel>{t("p.about.link.bug")}</IonLabel>
            </IonItem>
            <IonItem
              button
              detail
              href={mailto(
                "Daymark — Feedback",
                "Here's my feedback:\n\n" + deviceLine
              )}
            >
              <IonIcon slot="start" icon={mailOutline} color={accent} />
              <IonLabel>{t("p.about.feedback")}</IonLabel>
            </IonItem>
          </IonList>

          <p
            style={{
              textAlign: "center",
              marginTop: 24,
              color: "var(--m3-on-surface-variant)",
              fontSize: "0.85rem",
            }}
          >
            <IonIcon icon={heart} color="danger" /> Made with Love By Sourabh Kulkarni
            <br />
            From Belagavi, Karnataka, India
          </p>
          <p
            style={{
              textAlign: "center",
              margin: "8px 0",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--ion-text-color)",
            }}
          >
            ಹೆಮ್ಮೆಯ ಕನ್ನಡಿಗ - ಸೌರಭ ಕುಲಕರ್ಣಿ
          </p>
          <div style={{ textAlign: "center", margin: "12px 0" }}>
            <img
              src={karnatakaFlag}
              alt="Karnataka Flag"
              style={{
                width: 120,
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            />
          </div>
          <p style={{ display: "none" }}>
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default About;
