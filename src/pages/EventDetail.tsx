import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  useIonActionSheet,
  useIonAlert,
  useIonToast,
} from "@ionic/react";
import {
  ellipsisVertical,
  createOutline,
  starOutline,
  star,
  shareSocialOutline,
  trashOutline,
  repeat,
  notifications,
  calendarOutline,
  timeOutline,
  closeCircle,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Share } from "@capacitor/share";
import { getEvent, togglePin, deleteEvent } from "../data/eventStore";
import { getCategories, findCategory } from "../data/categories";
import { cancelReminders } from "../data/reminders";
import {
  daysToTarget,
  targetDate,
  isCountdown,
  isEventOngoing,
  totalSpanDays,
  progress,
  parseEventDate,
  experienceDuration,
  liveDurationBreakdown,
} from "../data/dateMath";
import { formatDatePretty } from "../lib/DateFormat";
import { CountdateEvent, Category } from "../data/types";
import { on } from "../lib/Events";
import LocalizeBackButton from "../components/LocalizeBackButton";
import { loadPhoto } from "../data/photoStore";
import "./EventDetail.css";

const EventDetail: React.FC<{ accent: string; view: string; relative: boolean }> = ({
  accent,
  view,
  relative,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const [presentActionSheet] = useIonActionSheet();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const eventId = new URLSearchParams(location.search).get("id") || "";
  const [event, setEvent] = useState<CountdateEvent | null>(null);
  const [category, setCategory] = useState<Category | undefined>();
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  const [viewerScale, setViewerScale] = useState(1);
  const [viewerPos, setViewerPos] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [initDist, setInitDist] = useState<number | null>(null);
  const [liveNow, setLiveNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const load = async () => {
    if (!eventId) return;
    const ev = await getEvent(eventId);
    if (!ev) { history.replace("/home"); return; }
    setEvent(ev);
    const cats = await getCategories();
    setCategory(findCategory(cats, ev.categoryId));
    if (ev.photos && ev.photos.length > 0) {
      Promise.all(ev.photos.map(loadPhoto)).then(setPhotoUrls);
    }
  };

  useEffect(() => {
    load();
    on("countdate_data:change", load);
  }, [eventId]);

  if (!event) return null;

  const isExp = (event.categoryId || "general") === "experience";
  const expEnd = isExp && event.endDate ? parseEventDate(event.endDate) : undefined;
  const live = liveDurationBreakdown(event, liveNow);
  const days = live.totalDays;
  const target = targetDate(event, liveNow);
  const countingDown = !live.isPast;
  const ongoing = isEventOngoing(event, liveNow);
  const span = totalSpanDays(event);
  const pct = Math.round(progress(event, liveNow) * 100);
  const accentColor = event.color || category?.color || "primary";
  const accentCss = accentColor.startsWith("#")
    ? accentColor
    : `var(--ion-color-${accentColor})`;

  const expDur = isExp ? experienceDuration(parseEventDate(event.date), expEnd || liveNow) : null;

  const convert = (d: number) => {
    const years = Math.floor(d / 365);
    d -= years * 365;
    const months = Math.floor(d / 30);
    d -= months * 30;
    return { years, months, days: d };
  };
  const breakdown = convert(days);

  const openMenu = () => {
    presentActionSheet({
      buttons: [
        {
          text: t("c.cards.edit"),
          icon: createOutline,
          handler: () => history.push(`/add?id=${event.id}`),
        },
        {
          text: event.pinned ? t("p.home.unpin") : t("p.home.pin"),
          icon: event.pinned ? starOutline : star,
          handler: () => togglePin(event.id),
        },
        {
          text: t("p.home.share"),
          icon: shareSocialOutline,
          handler: async () => {
            try {
              await Share.share({
                title: event.event_name,
                text: `${event.event_name} — ${days} ${t("c.card.days")}`,
              });
            } catch {}
          },
        },
        {
          text: t("p.home.delete"),
          role: "destructive",
          icon: trashOutline,
          handler: () => {
            presentAlert({
              header: t("c.cards.delete!"),
              message: t("c.cards.deleteMessage"),
              buttons: [
                { text: t("g.cancel"), role: "cancel" },
                {
                  text: t("g.discard"),
                  role: "destructive",
                  handler: async () => {
                    await cancelReminders(event);
                    await deleteEvent(event.id);
                    presentToast({ message: t("c.cards.deleted"), duration: 1400, color: accent });
                    history.replace("/home");
                  },
                },
              ],
            });
          },
        },
        { text: t("g.cancel"), role: "cancel" },
      ],
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <LocalizeBackButton color={accent} />
          <IonTitle>{event.event_name}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={openMenu}>
              <IonIcon slot="icon-only" icon={ellipsisVertical} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="detail" style={{ ["--detail-accent" as any]: accentCss }}>
          {/* Hero section */}
          <div className="detail__hero">
            <div className="detail__icon">{category?.icon || "📅"}</div>
            <h1 className="detail__name">{event.event_name}</h1>
            <p className="detail__date">
              <IonIcon icon={calendarOutline} />{" "}
              {event.endDate ? (
                <>
                  {formatDatePretty(parseEventDate(event.date))} → {formatDatePretty(parseEventDate(event.endDate))}
                </>
              ) : (
                formatDatePretty(target)
              )}
            </p>
            {event.pinned && (
              <span className="detail__pinned">
                <IonIcon icon={star} /> Pinned
              </span>
            )}
          </div>

          {/* Count section */}
          {isExp && expDur ? (
            <>
              <div className="detail__exp-grid">
                <div className="detail__exp-stat">
                  <span className="detail__exp-num">{expDur.years}</span>
                  <span className="detail__exp-label">{expDur.years === 1 ? "Year" : "Years"}</span>
                </div>
                <div className="detail__exp-stat">
                  <span className="detail__exp-num">{expDur.months}</span>
                  <span className="detail__exp-label">{expDur.months === 1 ? "Month" : "Months"}</span>
                </div>
                <div className="detail__exp-stat">
                  <span className="detail__exp-num">{expDur.days}</span>
                  <span className="detail__exp-label">{expDur.days === 1 ? "Day" : "Days"}</span>
                </div>
              </div>
              {expEnd && (
                <div className="detail__info-row" style={{ marginBottom: 16, justifyContent: "center" }}>
                  <IonIcon icon={calendarOutline} />
                  <span>Ended · {formatDatePretty(expEnd)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="detail__count-section">
              <div className="detail__big-num">{days}</div>
              <div className="detail__big-label">
                {days === 1 ? "day" : "days"} {ongoing ? "remaining" : countingDown ? "to go" : "ago"}
              </div>

              {/* Live Ticking Time Banner */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 20,
                background: "color-mix(in srgb, var(--detail-accent) 15%, transparent)",
                color: "var(--detail-accent)",
                fontWeight: 700,
                fontSize: "0.95rem",
                fontVariantNumeric: "tabular-nums",
                margin: "4px auto 14px auto",
              }}>
                <IonIcon icon={timeOutline} />
                <span>
                  {String(live.hours).padStart(2, "0")}h : {String(live.minutes).padStart(2, "0")}m : {String(live.seconds).padStart(2, "0")}s
                </span>
              </div>

              {(countingDown || ongoing) && (
                <div className="detail__progress">
                  <div className="detail__progress-bar">
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <span className="detail__progress-pct">{pct}%</span>
                </div>
              )}

              {/* Breakdown */}
              <div className="detail__breakdown">
                <div className="detail__break-item">
                  <span>{live.years}</span>
                  <small>Years</small>
                </div>
                <div className="detail__break-item">
                  <span>{live.months}</span>
                  <small>Months</small>
                </div>
                <div className="detail__break-item">
                  <span>{live.days}</span>
                  <small>Days</small>
                </div>
                <div className="detail__break-item">
                  <span>{live.hours}h {live.minutes}m</span>
                  <small>Time</small>
                </div>
              </div>
            </div>
          )}

          {/* Info cards */}
          <div className="detail__info">
            {category && (
              <div className="detail__info-row">
                <span className="detail__info-icon">{category.icon}</span>
                <span>{category.name}</span>
              </div>
            )}
            {event.endDate && (
              <div className="detail__info-row">
                <IonIcon icon={calendarOutline} />
                <span>
                  {ongoing ? "Currently ongoing · " : ""}
                  {span} days span
                </span>
              </div>
            )}
            {event.includeEndDay && (
              <div className="detail__info-row">
                <IonIcon icon={checkmarkCircleOutline} />
                <span>Includes end date in calculation (+1 day)</span>
              </div>
            )}
            {event.recurrence && event.recurrence !== "none" && (
              <div className="detail__info-row">
                <IonIcon icon={repeat} />
                <span>Repeats {event.recurrence}</span>
              </div>
            )}
            {event.reminderDaysBefore && event.reminderDaysBefore.length > 0 && (
              <div className="detail__info-row">
                <IonIcon icon={notifications} />
                <span>{event.reminderDaysBefore.length} reminder(s) set</span>
              </div>
            )}
            {event.description && (
              <div className="detail__description">
                <p>{event.description}</p>
              </div>
            )}

            {/* Photos */}
            {photoUrls.length > 0 && (
              <div className="detail__photos">
                {photoUrls.map((src, i) => (
                  src ? (
                    <div key={i} className="detail__photo" onClick={() => {
                      setViewerSrc(src);
                      setViewerScale(1);
                      setViewerPos({ x: 0, y: 0 });
                    }}>
                      <img src={src} alt="" />
                    </div>
                  ) : null
                ))}
              </div>
            )}
          </div>
        </div>
      </IonContent>

      {/* Fullscreen image viewer with pinch-to-zoom */}
      {viewerSrc && (
        <div
          className="photo-viewer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewerSrc(null);
            }
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 2) {
              const dx = e.touches[0].clientX - e.touches[1].clientX;
              const dy = e.touches[0].clientY - e.touches[1].clientY;
              setInitDist(Math.sqrt(dx * dx + dy * dy));
            } else if (e.touches.length === 1) {
              setDragStart({ x: e.touches[0].clientX - viewerPos.x, y: e.touches[0].clientY - viewerPos.y });
            }
          }}
          onTouchMove={(e) => {
            if (e.touches.length === 2 && initDist) {
              const dx = e.touches[0].clientX - e.touches[1].clientX;
              const dy = e.touches[0].clientY - e.touches[1].clientY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              setViewerScale(Math.max(0.5, Math.min(5, viewerScale * (dist / initDist))));
              setInitDist(dist);
            } else if (e.touches.length === 1 && dragStart && viewerScale > 1) {
              setViewerPos({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y,
              });
            }
          }}
          onTouchEnd={() => {
            setDragStart(null);
            setInitDist(null);
          }}
        >
          <button className="photo-viewer__close" onClick={() => setViewerSrc(null)}>
            <IonIcon icon={closeCircle} />
          </button>
          <img
            src={viewerSrc}
            alt=""
            className="photo-viewer__img"
            style={{
              transform: `translate(${viewerPos.x}px, ${viewerPos.y}px) scale(${viewerScale})`,
            }}
          />
          <div className="photo-viewer__controls">
            <button onClick={() => setViewerScale((s) => Math.max(0.5, s - 0.5))}>−</button>
            <span>{Math.round(viewerScale * 100)}%</span>
            <button onClick={() => setViewerScale((s) => Math.min(5, s + 0.5))}>+</button>
          </div>
        </div>
      )}

    </IonPage>
  );
};

export default EventDetail;
