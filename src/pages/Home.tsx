import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonButtons,
  IonButton,
  useIonActionSheet,
} from "@ionic/react";
import {
  add,
  search as searchIcon,
  settingsOutline,
  swapVerticalOutline,
  star,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { useSwipeable } from "react-swipeable";
import { on } from "../lib/Events";
import { getEvents, togglePin } from "../data/eventStore";
import { getCategories, findCategory } from "../data/categories";
import { isCountdown, daysToTarget } from "../data/dateMath";
import { CountdateEvent, Category, SortMode } from "../data/types";
import EventCard from "../components/EventCard";
import "./Home.css";

const Home: React.FC<{
  accent: string;
  view: string;
  setView: any;
  relative: boolean;
}> = ({ accent, view, setView, relative }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [presentActionSheet] = useIonActionSheet();

  const [events, setEvents] = useState<CountdateEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mode, setMode] = useState<"countdown" | "countup">("countdown");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("soonest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const load = async () => {
    setEvents(await getEvents());
    setCategories(await getCategories());
  };

  useEffect(() => {
    load();
    on("countdate_data:change", load);
    on("countdate_categories:change", load);
  }, []);

  const handleRefresh = (e: any) => {
    load().then(() => setTimeout(() => e.detail.complete(), 400));
  };

  // Swipe left/right anywhere on the list to flip between Upcoming and Past
  // (complements tapping the segment labels).
  const toggleMode = () =>
    setMode((m) => (m === "countdown" ? "countup" : "countdown"));
  const [swipeDir, setSwipeDir] = useState<"" | "left" | "right">("");
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setSwipeDir("left");
      toggleMode();
      setTimeout(() => setSwipeDir(""), 350);
    },
    onSwipedRight: () => {
      setSwipeDir("right");
      toggleMode();
      setTimeout(() => setSwipeDir(""), 350);
    },
    trackMouse: true,
    preventScrollOnSwipe: false,
    delta: 40,
  });

  // Filter by mode + category + search, then sort.
  const visible = events
    .filter((e) => (mode === "countdown" ? isCountdown(e) : !isCountdown(e)))
    .filter(
      (e) => activeCat === "all" || (e.categoryId || "general") === activeCat
    )
    .filter((e) =>
      searchQuery
        ? e.event_name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (sortMode === "name") return a.event_name.localeCompare(b.event_name);
      if (sortMode === "newest") return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortMode === "manual") return (a.order || 0) - (b.order || 0);
      return daysToTarget(a) - daysToTarget(b); // soonest
    });

  const pinned = visible.filter((e) => e.pinned);
  const others = visible.filter((e) => !e.pinned);

  const openSort = () => {
    presentActionSheet({
      header: t("p.home.sortBy"),
      buttons: [
        { text: t("p.home.sortSoonest"), handler: () => setSortMode("soonest") },
        { text: t("p.home.sortNewest"), handler: () => setSortMode("newest") },
        { text: t("p.home.sortName"), handler: () => setSortMode("name") },
        { text: t("g.cancel"), role: "cancel" },
      ],
    });
  };

  const openEventDetail = (ev: CountdateEvent) => {
    history.push(`/event?id=${ev.id}`);
  };

  const renderCards = (list: CountdateEvent[]) =>
    list.map((ev) => (
      <EventCard
        key={ev.id}
        event={ev}
        category={findCategory(categories, ev.categoryId)}
        view={view}
        relative={relative}
        onOpen={() => openEventDetail(ev)}
        onTogglePin={() => togglePin(ev.id)}
      />
    ));

  return (
    <IonPage className="home-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>{t("p.home.title")}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={openSort} aria-label="Sort">
              <IonIcon slot="icon-only" icon={swapVerticalOutline} />
            </IonButton>
            <IonButton
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) setSearchQuery("");
              }}
              aria-label="Search"
            >
              <IonIcon slot="icon-only" icon={searchIcon} />
            </IonButton>
            <IonButton routerLink="/settings" aria-label="Settings">
              <IonIcon slot="icon-only" icon={settingsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        {showSearch && (
          <IonToolbar>
            <IonSearchbar
              value={searchQuery}
              onIonInput={(e) => setSearchQuery(e.detail.value!)}
              placeholder={t("p.home.searchPlaceholder")}
              debounce={200}
            />
          </IonToolbar>
        )}
        <IonToolbar>
          <IonSegment
            value={mode}
            onIonChange={(e) => setMode(e.detail.value as any)}
          >
            <IonSegmentButton value="countdown">
              <IonLabel>{t("p.home.countdown")}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="countup">
              <IonLabel>{t("p.home.countup")}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div
          {...swipeHandlers}
          className={`home-swipe ${swipeDir ? `home-swipe--${swipeDir}` : ""}`}
        >
        {/* Category filter chips */}
        <div className="cat-filter">
          <button
            className={`cat-chip ${activeCat === "all" ? "cat-chip--on" : ""}`}
            onClick={() => setActiveCat("all")}
          >
            {t("p.home.all")}
          </button>
          {categories
            .filter((c) =>
              events.some((e) => (e.categoryId || "general") === c.id)
            )
            .map((c) => (
              <button
                key={c.id}
                className={`cat-chip ${
                  activeCat === c.id ? "cat-chip--on" : ""
                }`}
                onClick={() => setActiveCat(c.id)}
              >
                <span>{c.icon}</span> {c.name}
              </button>
            ))}
        </div>

        <div className="home-list">
          {visible.length === 0 ? (
            <div className="home-empty">
              <div className="home-empty__art">🗓️</div>
              <h2>{t("c.cards.addCountdate!")}</h2>
              <p>{t("p.home.emptyHint")}</p>
              <IonButton routerLink="/add" color={accent} shape="round">
                <IonIcon slot="start" icon={add} />
                {t("c.cards.addCountdate")}
              </IonButton>
            </div>
          ) : (
            <>
              {pinned.length > 0 && (
                <>
                  <div className="home-section-title">
                    <IonIcon icon={star} /> {t("p.home.pinned")}
                  </div>
                  {renderCards(pinned)}
                  {others.length > 0 && (
                    <div className="home-section-title">{t("p.home.all")}</div>
                  )}
                </>
              )}
              {renderCards(others)}
            </>
          )}
        </div>
        </div>
      </IonContent>

      <IonFab vertical="bottom" horizontal="end" slot="fixed" className="home-fab">
        <IonFabButton routerLink="/add" color={accent}>
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>

      <IonFooter className="ion-no-border">
        <IonToolbar>
          <IonSegment
            value={view}
            onIonChange={(e) => setView(`${e.detail.value}`)}
          >
            <IonSegmentButton value="days">
              <IonLabel>{t("p.home.daysView")}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="weeks">
              <IonLabel>{t("p.home.weeksView")}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="months">
              <IonLabel>{t("p.home.monthsView")}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="years">
              <IonLabel>{t("p.home.yearsView")}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Home;
