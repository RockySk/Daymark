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
import { textOutline, checkmarkCircle } from "ionicons/icons";
import "./FontSelectModal.css";

interface FontDef {
  id: string;
  name: string;
  family: string;
  category: "kannada" | "modern" | "classic" | "handwriting" | "system";
  preview: string;
}

const FONTS: FontDef[] = [
  // System
  { id: "system", name: "System Default", family: "Roboto, -apple-system, sans-serif", category: "system", preview: "Daymark 123 — Count every moment" },

  // Kannada fonts
  { id: "noto-sans-kn", name: "Noto Sans Kannada", family: "'Noto Sans Kannada', sans-serif", category: "kannada", preview: "ಡೇಮಾರ್ಕ್ — ಪ್ರತಿ ಕ್ಷಣವನ್ನು ಎಣಿಸಿ" },
  { id: "noto-serif-kn", name: "Noto Serif Kannada", family: "'Noto Serif Kannada', serif", category: "kannada", preview: "ಡೇಮಾರ್ಕ್ — ಪ್ರತಿ ಕ್ಷಣವನ್ನು ಎಣಿಸಿ" },
  { id: "baloo-tamma", name: "Baloo Tamma 2", family: "'Baloo Tamma 2', cursive", category: "kannada", preview: "ಡೇಮಾರ್ಕ್ — ಪ್ರತಿ ಕ್ಷಣವನ್ನು ಎಣಿಸಿ" },
  { id: "tiro-kn", name: "Tiro Kannada", family: "'Tiro Kannada', serif", category: "kannada", preview: "ಡೇಮಾರ್ಕ್ — ಪ್ರತಿ ಕ್ಷಣವನ್ನು ಎಣಿಸಿ" },
  { id: "rajdhani", name: "Rajdhani", family: "'Rajdhani', sans-serif", category: "kannada", preview: "Daymark — ಪ್ರತಿ ಕ್ಷಣ" },

  // Modern
  { id: "poppins", name: "Poppins", family: "'Poppins', sans-serif", category: "modern", preview: "Daymark 123 — Clean & modern" },
  { id: "inter", name: "Inter", family: "'Inter', sans-serif", category: "modern", preview: "Daymark 123 — Sharp & precise" },
  { id: "quicksand", name: "Quicksand", family: "'Quicksand', sans-serif", category: "modern", preview: "Daymark 123 — Soft & rounded" },
  { id: "verdana", name: "Verdana", family: "Verdana, Geneva, sans-serif", category: "modern", preview: "Daymark 123 — Clear & legible" },
  { id: "trebuchet", name: "Trebuchet MS", family: "'Trebuchet MS', Helvetica, sans-serif", category: "modern", preview: "Daymark 123 — Web classic" },

  // Classic / Serif
  { id: "playfair", name: "Playfair Display", family: "'Playfair Display', serif", category: "classic", preview: "Daymark 123 — Elegant serif" },
  { id: "times", name: "Times New Roman", family: "'Times New Roman', Times, serif", category: "classic", preview: "Daymark 123 — Timeless classic" },
  { id: "georgia", name: "Georgia", family: "Georgia, 'Times New Roman', serif", category: "classic", preview: "Daymark 123 — Warm serif" },
  { id: "palatino", name: "Palatino", family: "'Palatino Linotype', 'Book Antiqua', Palatino, serif", category: "classic", preview: "Daymark 123 — Book-style" },

  // Handwriting / Fun
  { id: "dancing", name: "Dancing Script", family: "'Dancing Script', cursive", category: "handwriting", preview: "Daymark — Beautiful moments" },
  { id: "pacifico", name: "Pacifico", family: "'Pacifico', cursive", category: "handwriting", preview: "Daymark — Surf vibes" },
  { id: "caveat", name: "Caveat", family: "'Caveat', cursive", category: "handwriting", preview: "Daymark — Handwritten notes" },
  { id: "comic", name: "Comic Sans MS", family: "'Comic Sans MS', 'Comic Sans', cursive", category: "handwriting", preview: "Daymark 123 — Fun & casual" },
];

const CATEGORIES = [
  { key: "kannada", label: "ಕನ್ನಡ Kannada" },
  { key: "modern", label: "Modern" },
  { key: "classic", label: "Classic" },
  { key: "handwriting", label: "Handwriting" },
  { key: "system", label: "System" },
] as const;

export function applyFont(fontId: string) {
  const font = FONTS.find((f) => f.id === fontId) || FONTS[0];
  document.documentElement.style.setProperty("--app-font-family", font.family);
  document.body.style.fontFamily = font.family;
}

export default function FontSelectModal({ accent }: { accent: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("system");

  useEffect(() => {
    Preferences.get({ key: key.appFont }).then(({ value }) => {
      if (value) {
        setSelected(value);
        applyFont(value);
      }
    });
  }, []);

  const save = async (id: string) => {
    setSelected(id);
    await Preferences.set({ key: key.appFont, value: id });
    applyFont(id);
    setOpen(false);
  };

  return (
    <>
      <IonLabel onClick={() => setOpen(true)}>
        <IonIcon icon={textOutline} /> Font
      </IonLabel>

      <IonModal isOpen={open} onDidDismiss={() => setOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Choose Font</IonTitle>
            <IonButtons slot="end">
              <IonButton color={accent} onClick={() => setOpen(false)}>
                {t("g.close")}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <div className="font-section-title">{cat.label}</div>
              <div className="font-grid">
                {FONTS.filter((f) => f.category === cat.key).map((font) => {
                  const isActive = selected === font.id;
                  return (
                    <button
                      key={font.id}
                      className={`font-card ${isActive ? "font-card--active" : ""}`}
                      onClick={() => save(font.id)}
                    >
                      {isActive && (
                        <IonIcon icon={checkmarkCircle} className="font-card__check" />
                      )}
                      <span
                        className="font-card__preview"
                        style={{ fontFamily: font.family }}
                      >
                        {font.preview}
                      </span>
                      <span className="font-card__name">{font.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </IonContent>
      </IonModal>
    </>
  );
}
