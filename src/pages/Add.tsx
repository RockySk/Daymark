import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonDatetime,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonToggle,
  IonTextarea,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonButtons,
  useIonToast,
  useIonAlert,
  IonAccordion,
  IonAccordionGroup,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { checkmark, calendarOutline, imageOutline, closeCircle, timeOutline } from "ionicons/icons";
import LocalizeBackButton from "../components/LocalizeBackButton";
import { formatDateISO } from "../lib/DateFormat";
import { appendLocalTimezone, appendCorrectTimezone } from "../lib/Countdate";
import { addEvent, updateEvent, getEvent } from "../data/eventStore";
import { getCategories, addCategory } from "../data/categories";
import { scheduleReminders } from "../data/reminders";
import { Category, Recurrence } from "../data/types";
import { savePhoto, loadPhoto, deletePhoto } from "../data/photoStore";

// Reminder presets (days before the event).
const REMINDER_PRESETS: { label: string; days: number }[] = [
  { label: "On the day", days: 0 },
  { label: "1 day", days: 1 },
  { label: "3 days", days: 3 },
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "1 month", days: 30 },
];

const COLOR_OPTIONS = [
  "default",
  "primary",
  "secondary",
  "tertiary",
  "success",
  "warning",
  "danger",
  "medium",
];

const Add: React.FC<{ accent: string }> = ({ accent }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  // Detect edit mode via ?id=
  const editId = new URLSearchParams(location.search).get("id");
  const isEdit = !!editId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [dateOnly, setDateOnly] = useState(formatDateISO(new Date()));
  const [hasCustomTime, setHasCustomTime] = useState(false);
  const [timeValue, setTimeValue] = useState("00:00");
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [includeEndDay, setIncludeEndDay] = useState(false);
  const [categoryId, setCategoryId] = useState("general");
  const [color, setColor] = useState("default");
  const [icon, setIcon] = useState("");
  const [pinned, setPinned] = useState(false);
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [reminders, setReminders] = useState<number[]>([]);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]); // file paths
  const [photoUrls, setPhotoUrls] = useState<string[]>([]); // display URIs
  const [savingPhoto, setSavingPhoto] = useState(false);

  const thisYear = new Date().getFullYear();

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Prefill when editing, or from a deep link.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (editId) {
      getEvent(editId).then((ev) => {
        if (!ev) return;
        setName(ev.event_name);
        setDateOnly(formatDateISO(new Date(appendCorrectTimezone(ev.date))));
        if (ev.date && ev.date.includes("T")) {
          const rawTime = ev.date.split("T")[1]?.slice(0, 5);
          if (rawTime && rawTime !== "23:59") {
            setHasCustomTime(true);
            setTimeValue(rawTime);
          }
        }
        setCategoryId(ev.categoryId || "general");
        setColor(ev.color || "default");
        setIcon(ev.icon || "");
        setPinned(!!ev.pinned);
        setRecurrence(ev.recurrence || "none");
        setReminders(ev.reminderDaysBefore || []);
        setDescription(ev.description || "");
        const paths = ev.photos || [];
        setPhotos(paths);
        Promise.all(paths.map(loadPhoto)).then(setPhotoUrls);
        if (ev.endDate) {
          setHasEndDate(true);
          setEndDate(formatDateISO(new Date(appendCorrectTimezone(ev.endDate))));
        } else {
          setHasEndDate(false);
          setEndDate("");
        }
        setIncludeEndDay(!!ev.includeEndDay);
      });
    } else {
      if (params.get("title")) setName(params.get("title")!);
      const d = params.get("date");
      if (d && d.length === 10) setDateOnly(d);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const toggleReminder = (days: number) => {
    setReminders((prev) =>
      prev.includes(days) ? prev.filter((d) => d !== days) : [...prev, days]
    );
  };

  // Inline custom-category creation: when the user picks "Custom…" we ask for a
  // name, save a brand-new category and immediately select it.
  const promptCustomCategory = () => {
    presentAlert({
      header: t("p.add.customCategory"),
      message: t("p.add.customCategoryHint"),
      inputs: [
        {
          name: "name",
          type: "text",
          placeholder: t("p.categories.namePlaceholder"),
        },
      ],
      buttons: [
        { text: t("g.cancel"), role: "cancel" },
        {
          text: t("g.confirm"),
          handler: async (data) => {
            const label = (data?.name || "").trim();
            if (!label) return;
            const created = await addCategory({
              name: label,
              icon: icon || "⭐",
              color: color === "default" ? "primary" : color,
            });
            const fresh = await getCategories();
            setCategories(fresh);
            setCategoryId(created.id);
            presentToast({
              message: t("p.categories.added"),
              duration: 1200,
              color: accent,
            });
          },
        },
      ],
    });
  };

  const handleCategoryChange = (value: string) => {
    if (value === "__custom__") {
      promptCustomCategory();
      return;
    }
    setCategoryId(value);
  };

  // Calculate span preview between start and end date
  const getSpanPreview = () => {
    if (!hasEndDate || !endDate) return null;
    const s = new Date(`${dateOnly}T00:00:00`);
    const e = new Date(`${endDate}T00:00:00`);
    const diffDays = Math.max(0, Math.round((e.getTime() - s.getTime()) / 86400000));
    const totalDays = includeEndDay ? diffDays + 1 : diffDays;
    return `${totalDays} ${totalDays === 1 ? t("c.card.day", "day") : t("c.card.days", "days")}`;
  };

  const save = async () => {
    if (!name.trim()) {
      presentToast({
        message: t("p.add.nameRequired"),
        duration: 1400,
        color: "danger",
      });
      return;
    }
    const timeToSave = hasCustomTime ? timeValue : "23:59";
    const data = {
      event_name: name.trim(),
      date: appendLocalTimezone(dateOnly, timeToSave),
      categoryId,
      color: color === "default" ? undefined : color,
      icon: icon || undefined,
      pinned,
      recurrence,
      reminderDaysBefore: reminders,
      description: description || undefined,
      photos: photos.length > 0 ? photos : undefined,
      endDate: hasEndDate && endDate ? appendLocalTimezone(endDate, timeToSave) : undefined,
      includeEndDay: !!includeEndDay,
    };

    let savedId = editId || "";
    if (isEdit && editId) {
      await updateEvent(editId, data);
    } else {
      const created = await addEvent(data);
      savedId = created.id;
    }
    // (Re)schedule reminders against the saved event.
    await scheduleReminders({ id: savedId, ...data } as any);

    presentToast({
      message: isEdit ? t("p.add.updated") : t("p.add.toast"),
      duration: 1400,
      icon: checkmark,
      color: accent,
    });
    history.push("/home");
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <LocalizeBackButton color={accent} />
          <IonTitle>{isEdit ? t("p.edit.title") : t("p.add.title")}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong onClick={save} color={accent}>
              {t("g.confirm")}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div style={{ paddingBottom: "calc(var(--ion-safe-area-bottom) + 24px)" }}>
          {/* Name */}
          <IonItem lines="none" className="form-card">
            <IonInput
              label={t("p.add.eventName.label")}
              labelPlacement="stacked"
              value={name}
              clearInput
              placeholder={t("p.add.eventName.placeholder")}
              onIonInput={(e) => setName(e.detail.value!)}
            />
          </IonItem>

          {/* Date Picker + Include End Date Options */}
          <div className="form-card form-card--pad">
            <div className="form-label">
              <IonIcon icon={calendarOutline} /> {hasEndDate ? t("p.add.startDateLabel", "Start date") : t("p.add.dateLabel", "Date")}
            </div>
            <IonDatetime
              presentation="date"
              value={dateOnly}
              min={"1900-01-01"}
              max={`${thisYear + 100}-12-31`}
              showDefaultTitle={false}
              size="cover"
              color={accent}
              onIonChange={(e) => {
                const newDate = formatDateISO(new Date(`${e.detail.value}`));
                setDateOnly(newDate);
                if (endDate && newDate > endDate) {
                  setEndDate(newDate);
                }
              }}
            />

            {/* Option to Set Exact Time */}
            <div className="date-option-divider" />
            <div className="date-toggle-row">
              <div className="date-toggle-info">
                <span className="date-toggle-title">
                  <IonIcon icon={timeOutline} /> {t("p.add.exactTime", "Exact time")}
                </span>
                <span className="date-toggle-subtitle">
                  {t("p.add.exactTimeHint", "Count down to or up from an exact hour and minute")}
                </span>
              </div>
              <IonToggle
                checked={hasCustomTime}
                onIonChange={(e) => setHasCustomTime(e.detail.checked)}
                color={accent}
              />
            </div>

            {hasCustomTime && (
              <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
                <IonDatetime
                  presentation="time"
                  value={timeValue}
                  color={accent}
                  onIonChange={(e) => {
                    const val = `${e.detail.value}`;
                    setTimeValue(val.length >= 5 ? val.slice(0, 5) : val);
                  }}
                />
              </div>
            )}

            {/* Option to Include End Date */}
            <div className="date-option-divider" />
            <div className="date-toggle-row">
              <div className="date-toggle-info">
                <span className="date-toggle-title">
                  <IonIcon icon={calendarOutline} /> {t("p.add.includeEndDate", "Include end date")}
                </span>
                <span className="date-toggle-subtitle">
                  {t("p.add.includeEndDateHint", "Add an end date for multi-day events, trips, or experiences")}
                </span>
              </div>
              <IonToggle
                checked={hasEndDate}
                onIonChange={(e) => {
                  const checked = e.detail.checked;
                  setHasEndDate(checked);
                  if (checked && !endDate) {
                    setEndDate(dateOnly);
                  }
                }}
                color={accent}
              />
            </div>

            {/* End Date Picker (visible when Include End Date is active) */}
            {hasEndDate && (
              <div className="end-date-section">
                <div className="form-label" style={{ marginTop: 14 }}>
                  <IonIcon icon={calendarOutline} /> {t("p.add.endDateLabel", "End date")}
                  {getSpanPreview() && (
                    <span className="span-preview-badge">
                      {getSpanPreview()}
                    </span>
                  )}
                </div>
                <IonDatetime
                  presentation="date"
                  value={endDate || dateOnly}
                  min={dateOnly || "1900-01-01"}
                  max={`${thisYear + 100}-12-31`}
                  showDefaultTitle={false}
                  size="cover"
                  color={accent}
                  onIonChange={(e) =>
                    setEndDate(formatDateISO(new Date(`${e.detail.value}`)))
                  }
                />
              </div>
            )}

            {/* Option to Include End Day in Count (+1 inclusive) */}
            <div className="date-option-divider" />
            <div className="date-toggle-row">
              <div className="date-toggle-info">
                <span className="date-toggle-title">
                  <IonIcon icon={timeOutline} /> {t("p.add.includeEndDay", "Include end day in count (+1 day)")}
                </span>
                <span className="date-toggle-subtitle">
                  {t("p.add.includeEndDayHint", "Counts both the start date and end date (inclusive calculation)")}
                </span>
              </div>
              <IonToggle
                checked={includeEndDay}
                onIonChange={(e) => setIncludeEndDay(e.detail.checked)}
                color={accent}
              />
            </div>
          </div>

          {/* Category */}
          <IonItem className="form-card">
            <IonSelect
              label={t("p.add.category")}
              labelPlacement="stacked"
              value={categoryId}
              onIonChange={(e) => handleCategoryChange(e.detail.value)}
              interface="action-sheet"
            >
              {categories.map((c) => (
                <IonSelectOption key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </IonSelectOption>
              ))}
              <IonSelectOption value="__custom__">
                ➕ {t("p.add.customCategory")}
              </IonSelectOption>
            </IonSelect>
          </IonItem>

          {/* Recurrence */}
          <IonItem className="form-card">
            <IonSelect
              label={t("p.add.repeat")}
              labelPlacement="stacked"
              value={recurrence}
              onIonChange={(e) => setRecurrence(e.detail.value)}
              interface="action-sheet"
            >
              <IonSelectOption value="none">{t("p.add.repeatNone")}</IonSelectOption>
              <IonSelectOption value="hourly">{t("p.add.repeatHourly")}</IonSelectOption>
              <IonSelectOption value="daily">{t("p.add.repeatDaily")}</IonSelectOption>
              <IonSelectOption value="weekly">{t("p.add.repeatWeekly")}</IonSelectOption>
              <IonSelectOption value="monthly">{t("p.add.repeatMonthly")}</IonSelectOption>
              <IonSelectOption value="yearly">{t("p.add.repeatYearly")}</IonSelectOption>
            </IonSelect>
          </IonItem>

          {/* Pin */}
          <IonItem className="form-card">
            <IonToggle
              checked={pinned}
              onIonChange={(e) => setPinned(e.detail.checked)}
              color={accent}
            >
              {t("p.add.pin")}
            </IonToggle>
          </IonItem>

          {/* Reminders */}
          <div className="form-card form-card--pad">
            <div className="form-label">{t("p.add.reminders")}</div>
            <div className="chip-row">
              {REMINDER_PRESETS.map((r) => (
                <button
                  key={r.days}
                  className={`pick-chip ${
                    reminders.includes(r.days) ? "pick-chip--on" : ""
                  }`}
                  onClick={() => toggleReminder(r.days)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced: color, icon, description, photos */}
          <IonAccordionGroup>
            <IonAccordion value="more">
              <IonItem slot="header" className="form-card">
                <IonLabel>{t("p.add.more")}</IonLabel>
              </IonItem>
              <div slot="content" className="form-card form-card--pad">
                <div className="form-label">{t("p.add.color")}</div>
                <div className="chip-row">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      className={`color-dot ${color === c ? "color-dot--on" : ""}`}
                      style={{
                        background:
                          c === "default"
                            ? "var(--m3-surface-variant)"
                            : `var(--ion-color-${c})`,
                      }}
                      onClick={() => setColor(c)}
                      aria-label={c}
                    />
                  ))}
                </div>

                <IonTextarea
                  className="ion-margin-top"
                  label={t("c.editor.description")}
                  labelPlacement="stacked"
                  autoGrow
                  value={description}
                  onIonInput={(e) => setDescription(e.detail.value!)}
                  placeholder="…"
                />

                <div className="form-label" style={{ marginTop: 14 }}>
                  <IonIcon icon={imageOutline} /> Photos
                </div>
                <div className="photo-grid">
                  {photoUrls.map((src, i) => (
                    <div key={i} className="photo-thumb">
                      <img src={src} alt="" />
                      <button
                        className="photo-thumb__remove"
                        onClick={async () => {
                          await deletePhoto(photos[i]);
                          setPhotos((p) => p.filter((_, j) => j !== i));
                          setPhotoUrls((p) => p.filter((_, j) => j !== i));
                        }}
                      >
                        <IonIcon icon={closeCircle} />
                      </button>
                    </div>
                  ))}
                  <label className={`photo-add ${savingPhoto ? "photo-add--busy" : ""}`}>
                    <IonIcon icon={imageOutline} />
                    <span>{savingPhoto ? "Saving…" : "Add"}</span>
                    <input
                      type="file"
                      accept="image/*,image/jpeg,image/png,image/gif,image/webp,image/bmp"
                      multiple
                      hidden
                      disabled={savingPhoto}
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        setSavingPhoto(true);
                        for (const file of Array.from(files)) {
                          try {
                            const path = await savePhoto(file);
                            const url = await loadPhoto(path);
                            setPhotos((p) => [...p, path]);
                            setPhotoUrls((p) => [...p, url]);
                          } catch (err) {
                            console.error("Photo save failed", err);
                          }
                        }
                        setSavingPhoto(false);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </IonAccordion>
          </IonAccordionGroup>

          <IonButton
            expand="block"
            shape="round"
            color={accent}
            className="ion-margin-top"
            onClick={save}
          >
            <IonIcon slot="start" icon={checkmark} />
            {isEdit ? t("p.add.saveChanges") : t("p.add.add")}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Add;
