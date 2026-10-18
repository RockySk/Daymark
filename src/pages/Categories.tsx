import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonInput,
  IonButton,
  IonButtons,
  IonModal,
  IonSelect,
  IonSelectOption,
  useIonToast,
} from "@ionic/react";
import { add, trashOutline, lockClosed } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { on } from "../lib/Events";
import LocalizeBackButton from "../components/LocalizeBackButton";
import {
  getCategories,
  addCategory,
  deleteCategory,
} from "../data/categories";
import { Category } from "../data/types";

const COLOR_OPTIONS = [
  "primary",
  "secondary",
  "tertiary",
  "success",
  "warning",
  "danger",
  "medium",
];
const EMOJI = ["📅", "🎂", "💖", "✈️", "💼", "🎓", "🎉", "💪", "🏖️", "💍", "👶", "🏠", "⭐", "🎯"];

const Categories: React.FC<{ accent: string }> = ({ accent }) => {
  const { t } = useTranslation();
  const [present] = useIonToast();
  const [cats, setCats] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [color, setColor] = useState("primary");

  const load = async () => setCats(await getCategories());
  useEffect(() => {
    load();
    on("countdate_categories:change", load);
  }, []);

  const save = async () => {
    if (!name.trim()) return;
    await addCategory({ name: name.trim(), icon, color });
    setName("");
    setIcon("⭐");
    setColor("primary");
    setModalOpen(false);
    present({ message: t("p.categories.added"), duration: 1300, color: accent });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <LocalizeBackButton color={accent} />
          <IonTitle>{t("p.categories.title")}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setModalOpen(true)} color={accent}>
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList inset>
          {cats.map((c) => (
            <IonItem key={c.id}>
              <span slot="start" style={{ fontSize: "1.5rem" }}>
                {c.icon}
              </span>
              <IonLabel>
                <h2>{c.name}</h2>
                <p style={{ textTransform: "capitalize" }}>{c.color}</p>
              </IonLabel>
              {c.builtIn ? (
                <IonIcon
                  slot="end"
                  icon={lockClosed}
                  color="medium"
                  title={t("p.categories.builtIn")}
                />
              ) : (
                <IonIcon
                  slot="end"
                  icon={trashOutline}
                  color="danger"
                  style={{ cursor: "pointer" }}
                  onClick={() => deleteCategory(c.id)}
                />
              )}
            </IonItem>
          ))}
        </IonList>
      </IonContent>

      <IonModal
        isOpen={modalOpen}
        onDidDismiss={() => setModalOpen(false)}
        breakpoints={[0, 0.75]}
        initialBreakpoint={0.75}
      >
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonTitle>{t("p.categories.new")}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={save} strong color={accent}>
                {t("g.confirm")}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem className="form-card">
            <IonInput
              label={t("p.categories.name")}
              labelPlacement="stacked"
              value={name}
              onIonInput={(e) => setName(e.detail.value!)}
              placeholder={t("p.categories.namePlaceholder")}
            />
          </IonItem>

          <div className="form-card form-card--pad">
            <div className="form-label">{t("p.add.icon")}</div>
            <div className="chip-row">
              {EMOJI.map((em) => (
                <button
                  key={em}
                  className={`pick-chip ${icon === em ? "pick-chip--on" : ""}`}
                  onClick={() => setIcon(em)}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <IonItem className="form-card">
            <IonSelect
              label={t("p.add.color")}
              labelPlacement="stacked"
              value={color}
              onIonChange={(e) => setColor(e.detail.value)}
              interface="action-sheet"
            >
              {COLOR_OPTIONS.map((c) => (
                <IonSelectOption key={c} value={c}>
                  {c}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Categories;
