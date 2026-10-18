import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonReorderGroup,
  IonReorder,
  ItemReorderEventDetail,
  IonIcon,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
  IonButtons,
  useIonAlert,
} from "@ionic/react";
import {
  add,
  reorderThreeOutline,
  star,
  starOutline,
  trashOutline,
  createOutline,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { on } from "../lib/Events";
import LocalizeBackButton from "../components/LocalizeBackButton";
import {
  getEvents,
  reorderEvents,
  togglePin,
  deleteEvent,
} from "../data/eventStore";
import { getCategories, findCategory } from "../data/categories";
import { daysToTarget } from "../data/dateMath";
import { CountdateEvent, Category } from "../data/types";

const Edit: React.FC<{ accent: string }> = ({ accent }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [events, setEvents] = useState<CountdateEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const load = async () => {
    const evs = await getEvents();
    evs.sort((a, b) => (a.order || 0) - (b.order || 0));
    setEvents(evs);
    setCategories(await getCategories());
  };

  useEffect(() => {
    load();
    on("countdate_data:change", load);
  }, []);

  const handleReorder = async (e: CustomEvent<ItemReorderEventDetail>) => {
    const reordered = e.detail.complete(events) as CountdateEvent[];
    setEvents(reordered);
    await reorderEvents(reordered.map((ev) => String(ev.id)));
  };

  const confirmDelete = (ev: CountdateEvent) => {
    presentAlert({
      header: t("c.cards.delete!"),
      message: t("c.cards.deleteMessage"),
      buttons: [
        { text: t("g.cancel"), role: "cancel" },
        {
          text: t("g.confirm"),
          role: "destructive",
          handler: () => deleteEvent(ev.id),
        },
      ],
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <LocalizeBackButton color={accent} />
          <IonTitle>{t("p.edit.title")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: "8px 8px calc(var(--ion-safe-area-bottom) + 90px)" }}>
          <div className="form-label" style={{ margin: "12px 16px" }}>
            {t("p.edit.description")}
          </div>

          {events.length === 0 ? (
            <IonItem lines="none">
              <IonLabel>{t("p.edit.noData")}</IonLabel>
            </IonItem>
          ) : (
            <IonList inset>
              <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
                {events.map((ev) => {
                  const cat = findCategory(categories, ev.categoryId);
                  return (
                    <IonItem key={ev.id}>
                      <span slot="start" style={{ fontSize: "1.4rem" }}>
                        {cat?.icon || "📅"}
                      </span>
                      <IonLabel>
                        <h2>{ev.event_name}</h2>
                        <p>
                          {daysToTarget(ev)} {t("c.card.days")}
                          {cat ? ` · ${cat.name}` : ""}
                        </p>
                      </IonLabel>
                      <IonButtons slot="end">
                        <IonIcon
                          icon={ev.pinned ? star : starOutline}
                          color={accent}
                          style={{ fontSize: "1.3rem", cursor: "pointer" }}
                          onClick={() => togglePin(ev.id)}
                        />
                        <IonIcon
                          icon={createOutline}
                          style={{ fontSize: "1.3rem", cursor: "pointer" }}
                          onClick={() => history.push(`/add?id=${ev.id}`)}
                        />
                        <IonIcon
                          icon={trashOutline}
                          color="danger"
                          style={{ fontSize: "1.3rem", cursor: "pointer" }}
                          onClick={() => confirmDelete(ev)}
                        />
                      </IonButtons>
                      <IonReorder slot="end">
                        <IonIcon icon={reorderThreeOutline} size="large" />
                      </IonReorder>
                    </IonItem>
                  );
                })}
              </IonReorderGroup>
            </IonList>
          )}

          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton routerLink="/add" color={accent}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Edit;
