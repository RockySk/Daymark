import { LocalNotifications } from "@capacitor/local-notifications";
import { CountdateEvent } from "./types";
import { targetDate } from "./dateMath";

/**
 * Reminder scheduling. Each event can request notifications a number of days
 * before its target date (e.g. [0, 1, 7] => on the day, 1 day before, a week
 * before). We derive a stable notification id from the event id so rescheduling
 * cleanly replaces the previous set.
 */

const MS_DAY = 86400000;

/** Deterministic small integer id from an event id + offset (notifications need ints). */
function notifId(eventId: string, daysBefore: number): number {
  let hash = 0;
  for (let i = 0; i < eventId.length; i++) {
    hash = (hash * 31 + eventId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash % 1000000) * 100 + (daysBefore % 100);
}

export async function ensurePermission(): Promise<boolean> {
  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display === "granted") return true;
    const req = await LocalNotifications.requestPermissions();
    return req.display === "granted";
  } catch {
    return false;
  }
}

/** Cancel any reminders previously scheduled for this event. */
export async function cancelReminders(event: CountdateEvent): Promise<void> {
  const days = event.reminderDaysBefore ?? [];
  // Cancel a generous spread of offsets so stale ones are cleared too.
  const offsets = Array.from(new Set([...days, 0, 1, 2, 3, 7, 14, 30]));
  const ids = offsets.map((d) => ({ id: notifId(event.id, d) }));
  try {
    await LocalNotifications.cancel({ notifications: ids });
  } catch {
    /* no-op */
  }
}

/** (Re)schedule reminders for a single event based on its reminderDaysBefore. */
export async function scheduleReminders(event: CountdateEvent): Promise<void> {
  await cancelReminders(event);
  const days = event.reminderDaysBefore ?? [];
  if (days.length === 0) return;
  if (!(await ensurePermission())) return;

  const target = targetDate(event);
  const now = Date.now();
  const notifications = days
    .map((d) => {
      const fireAt = new Date(target.getTime() - d * MS_DAY);
      // Fire at 9am local for a friendlier reminder time.
      fireAt.setHours(9, 0, 0, 0);
      return { d, fireAt };
    })
    .filter(({ fireAt }) => fireAt.getTime() > now)
    .map(({ d, fireAt }) => ({
      id: notifId(event.id, d),
      title: event.event_name,
      body:
        d === 0
          ? "It's today! 🎉"
          : `${d} day${d === 1 ? "" : "s"} to go`,
      schedule: { at: fireAt, allowWhileIdle: true },
    }));

  if (notifications.length === 0) return;
  try {
    await LocalNotifications.schedule({ notifications });
  } catch {
    /* permission/plugin unavailable on web — ignore */
  }
}

/** Quick test notification (used by dev mode in Settings). */
export async function testNotification(): Promise<void> {
  if (!(await ensurePermission())) return;
  await LocalNotifications.schedule({
    notifications: [
      {
        id: 999999,
        title: "Daymark",
        body: "Reminders are working ✅",
        schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
      },
    ],
  });
}
