// Core domain types for Countdate.
// This is the single source of truth for the event data model. New features
// should extend these interfaces (all new fields optional) so older saved data
// keeps working and the rest of the app stays decoupled from storage details.

export type Recurrence =
  | "none"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

/**
 * A single countdown / count-up event.
 *
 * Legacy events (created before the redesign) only had `id`, `event_name` and
 * `date`. Every field added since is optional and defaulted at read time by the
 * store's migration step, so the app can evolve without breaking old backups.
 */
export interface CountdateEvent {
  id: string;
  event_name: string;
  /** ISO-8601 string including timezone, e.g. "2030-01-01T23:59:00+05:30". */
  date: string;
  description?: string;

  /** Id of the owning category (see DEFAULT_CATEGORIES). */
  categoryId?: string;
  /** Ionic color name OR hex string used as the card accent. */
  color?: string;
  /** Emoji or ionicon name shown on the card. */
  icon?: string;

  pinned?: boolean;
  recurrence?: Recurrence;

  /** Days-before values at which to fire a reminder notification (e.g. [0, 1, 7]). */
  reminderDaysBefore?: number[];

  /** Epoch millis the event was created — used for the "Newest" sort. */
  createdAt?: number;
  /** Manual ordering index for drag-to-reorder. */
  order?: number;

  /** File paths to photos attached to this event. */
  photos?: string[];

  /** ISO-8601 end date for range / multi-day / experience events. */
  endDate?: string;

  /** Whether to include the end date in the day count (+1 day inclusive). */
  includeEndDay?: boolean;
}

export interface Category {
  id: string;
  name: string;
  /** Ionic color name or hex. */
  color: string;
  /** Emoji or ionicon name. */
  icon: string;
  /** Built-in categories cannot be deleted. */
  builtIn?: boolean;
}

export type SortMode = "soonest" | "newest" | "name" | "manual";

export interface AppSettings {
  darkMode: "system" | "light" | "dark";
  accent: string;
  textColor: string;
  relativeTime: boolean;
  sortMode: SortMode;
  defaultReminderDaysBefore: number[];
  devMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: "system",
  accent: "primary",
  textColor: "",
  relativeTime: false,
  sortMode: "soonest",
  defaultReminderDaysBefore: [],
  devMode: false,
};
