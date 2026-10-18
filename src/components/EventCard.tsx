import { IonIcon, IonRippleEffect } from "@ionic/react";
import { star, starOutline, repeat, notifications, calendarOutline, timeOutline } from "ionicons/icons";
import { useState, useEffect } from "react";
import { CountdateEvent, Category } from "../data/types";
import { loadPhoto } from "../data/photoStore";
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
import "./EventCard.css";

export default function EventCard(props: {
  event: CountdateEvent;
  category?: Category;
  view: string;
  relative: boolean;
  onOpen: () => void;
  onTogglePin: () => void;
}): JSX.Element {
  const { event, category, view, relative } = props;

  const [liveNow, setLiveNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const accent = event.color || category?.color || "primary";
  const accentCss = accent.startsWith("#")
    ? accent
    : `var(--ion-color-${accent})`;

  const isExperience = (event.categoryId || "general") === "experience";
  const live = liveDurationBreakdown(event, liveNow);
  const days = live.totalDays;
  const countingDown = !live.isPast;
  const ongoing = isEventOngoing(event, liveNow);
  const spanDays = totalSpanDays(event);
  const target = targetDate(event, liveNow);
  const pct = Math.round(progress(event, liveNow) * 100);

  const convert = (d: number) => {
    const years = Math.floor(d / 365);
    d -= years * 365;
    const months = Math.floor(d / 30);
    d -= months * 30;
    return [years, months, d];
  };

  const bigValue = (): string => {
    if (view === "days") return days.toString();
    if (view === "weeks") {
      return relative
        ? Math.floor(days / 7).toString()
        : (Math.round((days / 7) * 10) / 10).toString();
    }
    if (view === "years") {
      const [y, m, d] = convert(days);
      if (relative) return y ? `${y}y ${m}m` : m ? `${m}m ${d}d` : `${d}`;
      return (Math.round((days / 365) * 100) / 100).toString();
    }
    return relative
      ? convert(days)[0] || convert(days)[1]
        ? `${convert(days)[0]}y ${convert(days)[1]}m`
        : `${convert(days)[2]}`
      : (Math.round((days / 30) * 100) / 100).toString();
  };

  const unitLabel = (): string => {
    if (view === "days") return days === 1 ? "day" : "days";
    if (view === "weeks") {
      if (relative) {
        const rem = days % 7;
        return rem ? `weeks · ${rem}d` : "weeks";
      }
      return "weeks";
    }
    if (view === "years") {
      if (relative) {
        const [y, , d] = convert(days);
        return y ? (d ? `· ${d}d` : "years") : "months";
      }
      return "years";
    }
    if (relative) {
      const rem = convert(days)[2];
      return rem ? `· ${rem}d left` : "months";
    }
    return "months";
  };

  // Load photo display URIs from file paths
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  useEffect(() => {
    if (event.photos && event.photos.length > 0) {
      Promise.all(event.photos.slice(0, 3).map(loadPhoto)).then(setPhotoUrls);
    }
  }, [event.photos]);

  // Experience: calendar-accurate breakdown
  const expEnd = isExperience && event.endDate
    ? parseEventDate(event.endDate)
    : undefined;
  const expDur = isExperience
    ? experienceDuration(parseEventDate(event.date), expEnd || new Date())
    : null;

  const dateSubtitle = () => {
    if (event.endDate) {
      const startFmt = formatDatePretty(parseEventDate(event.date));
      const endFmt = formatDatePretty(parseEventDate(event.endDate));
      return `${startFmt} – ${endFmt}`;
    }
    return formatDatePretty(target);
  };

  return (
    <div
      className="ion-activatable event-card"
      style={{ ["--card-accent" as any]: accentCss }}
      onClick={props.onOpen}
    >
      <IonRippleEffect />

      <div className="event-card__head">
        <span className="event-card__icon">{category?.icon || "📅"}</span>
        <div className="event-card__titles">
          <span className="event-card__name">{event.event_name}</span>
          <span className="event-card__date">{dateSubtitle()}</span>
        </div>
        <button
          className="event-card__pin"
          onClick={(e) => {
            e.stopPropagation();
            props.onTogglePin();
          }}
          aria-label="Pin"
        >
          <IonIcon icon={event.pinned ? star : starOutline} />
        </button>
      </div>

      {isExperience && expDur ? (
        <>
          <div className="event-card__experience">
            <div className="event-card__stat">
              <span className="event-card__stat-num">{expDur.years}</span>
              <span className="event-card__stat-label">
                {expDur.years === 1 ? "year" : "years"}
              </span>
            </div>
            <div className="event-card__stat">
              <span className="event-card__stat-num">{expDur.months}</span>
              <span className="event-card__stat-label">
                {expDur.months === 1 ? "month" : "months"}
              </span>
            </div>
            <div className="event-card__stat">
              <span className="event-card__stat-num">{expDur.days}</span>
              <span className="event-card__stat-label">
                {expDur.days === 1 ? "day" : "days"}
              </span>
            </div>
          </div>
          {expEnd && (
            <div className="event-card__chip event-card__chip--ghost" style={{ marginTop: 8 }}>
              Ended · {formatDatePretty(expEnd)}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="event-card__count">
            <span className="event-card__num">{bigValue()}</span>
            <span className="event-card__unit">
              {unitLabel()}
              <span className="event-card__dir">
                {ongoing ? "left" : countingDown ? "to go" : "ago"}
              </span>
            </span>
          </div>

          {/* Live Hours, Minutes, Seconds Ticker */}
          <div className="event-card__live-ticker">
            <IonIcon icon={timeOutline} style={{ fontSize: "0.85rem", opacity: 0.8 }} />
            <span>
              {String(live.hours).padStart(2, "0")}h {String(live.minutes).padStart(2, "0")}m {String(live.seconds).padStart(2, "0")}s
            </span>
          </div>

          {(countingDown || ongoing) && (
            <div className="event-card__progress">
              <span style={{ width: `${pct}%` }} />
            </div>
          )}
        </>
      )}

      {/* Photo strip */}
      {photoUrls.length > 0 && (
        <div className="event-card__photos">
          {photoUrls.map((src, i) => (
            src ? <img key={i} src={src} alt="" className="event-card__photo" /> : null
          ))}
          {event.photos && event.photos.length > 3 && (
            <span className="event-card__photo-more">+{event.photos.length - 3}</span>
          )}
        </div>
      )}

      <div className="event-card__badges">
        {category && (
          <span className="event-card__chip">{category.name}</span>
        )}
        {ongoing && (
          <span className="event-card__chip event-card__chip--active">
            ⏳ Ongoing {spanDays > 0 ? `· ${spanDays}d total` : ""}
          </span>
        )}
        {event.endDate && !ongoing && !isExperience && (
          <span className="event-card__chip event-card__chip--ghost">
            <IonIcon icon={calendarOutline} /> {spanDays}d range
          </span>
        )}
        {event.includeEndDay && (
          <span className="event-card__chip event-card__chip--ghost">
            +1d inclusive
          </span>
        )}
        {event.recurrence && event.recurrence !== "none" && (
          <span className="event-card__chip event-card__chip--ghost">
            <IonIcon icon={repeat} /> {event.recurrence}
          </span>
        )}
        {event.reminderDaysBefore && event.reminderDaysBefore.length > 0 && (
          <span className="event-card__chip event-card__chip--ghost">
            <IonIcon icon={notifications} /> {event.reminderDaysBefore.length}
          </span>
        )}
      </div>
    </div>
  );
}
