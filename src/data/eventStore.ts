import { Preferences } from "@capacitor/preferences";
import { v4 as uuid } from "uuid";
import key from "../lib/storageKey.json";
import { trigger } from "../lib/Events";
import { CountdateEvent, Recurrence } from "./types";
import { refreshNativeWidgets } from "../lib/WidgetUpdater";

/**
 * Central data-access layer for events. Every page goes through this module
 * instead of touching Preferences directly, so the storage format and any
 * future migrations live in exactly one place.
 */

const STORAGE_KEY = key.data; // "countdate_events_data"

/** Fill in defaults for fields that older saved events did not have. */
function migrate(raw: any, index: number): CountdateEvent {
  return {
    id: raw.id ? String(raw.id) : uuid(),
    event_name: raw.event_name ?? raw.name ?? "",
    date: raw.date,
    description: raw.description,
    categoryId: raw.categoryId ?? "general",
    color: raw.color,
    icon: raw.icon,
    pinned: raw.pinned ?? false,
    recurrence: (raw.recurrence as Recurrence) ?? "none",
    reminderDaysBefore: Array.isArray(raw.reminderDaysBefore)
      ? raw.reminderDaysBefore
      : [],
    createdAt: raw.createdAt ?? Date.now() - (10000 - index),
    order: typeof raw.order === "number" ? raw.order : index,
    photos: Array.isArray(raw.photos) ? raw.photos : undefined,
    endDate: raw.endDate,
    includeEndDay: typeof raw.includeEndDay === "boolean" ? raw.includeEndDay : false,
  };
}

export async function getEvents(): Promise<CountdateEvent[]> {
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  if (!value || value.includes("null")) return [];
  let parsed: any[];
  try {
    parsed = JSON.parse(value);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.map(migrate);
}

export async function saveEvents(events: CountdateEvent[]): Promise<void> {
  await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(events) });
  trigger("countdate_data:change");
  refreshNativeWidgets();
}

export async function getEvent(id: string): Promise<CountdateEvent | undefined> {
  const events = await getEvents();
  return events.find((e) => String(e.id) === String(id));
}

export async function addEvent(
  data: Omit<CountdateEvent, "id" | "createdAt" | "order">
): Promise<CountdateEvent> {
  const events = await getEvents();
  const newEvent: CountdateEvent = {
    ...data,
    id: uuid(),
    createdAt: Date.now(),
    order: events.length,
  };
  await saveEvents([...events, newEvent]);
  return newEvent;
}

export async function updateEvent(
  id: string,
  patch: Partial<CountdateEvent>
): Promise<void> {
  const events = await getEvents();
  const next = events.map((e) =>
    String(e.id) === String(id) ? { ...e, ...patch } : e
  );
  await saveEvents(next);
}

export async function deleteEvent(id: string): Promise<void> {
  const events = await getEvents();
  await saveEvents(events.filter((e) => String(e.id) !== String(id)));
}

export async function togglePin(id: string): Promise<void> {
  const events = await getEvents();
  const next = events.map((e) =>
    String(e.id) === String(id) ? { ...e, pinned: !e.pinned } : e
  );
  await saveEvents(next);
}

/** Persist a new manual ordering (used by drag-to-reorder on the edit screen). */
export async function reorderEvents(orderedIds: string[]): Promise<void> {
  const events = await getEvents();
  const byId = new Map(events.map((e) => [String(e.id), e]));
  const reordered: CountdateEvent[] = [];
  orderedIds.forEach((id, i) => {
    const e = byId.get(String(id));
    if (e) reordered.push({ ...e, order: i });
  });
  // Append anything not in the ordered list (safety net).
  events.forEach((e) => {
    if (!orderedIds.includes(String(e.id))) reordered.push(e);
  });
  await saveEvents(reordered);
}

export async function deleteAllEvents(): Promise<void> {
  await Preferences.remove({ key: STORAGE_KEY });
  trigger("countdate_data:change");
  refreshNativeWidgets();
}
