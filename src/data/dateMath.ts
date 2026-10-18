import { appendCorrectTimezone } from "../lib/Countdate";
import { CountdateEvent } from "./types";

const DAY = 86400000;

/** Parse a stored event date string into a timezone-correct Date. */
export function parseEventDate(date: string): Date {
  return new Date(appendCorrectTimezone(date));
}

/**
 * The next date this event actually points at.
 * For non-recurring events that's just the stored date. For recurring events
 * it rolls the stored month/day forward to the next upcoming occurrence, so a
 * birthday never goes "negative" — it always shows the days to the next one.
 */
export function targetDate(event: CountdateEvent, now: Date = new Date()): Date {
  const base = parseEventDate(event.date);
  const rec = event.recurrence ?? "none";
  if (rec === "none") return base;

  const next = new Date(base);
  if (rec === "yearly") {
    next.setFullYear(now.getFullYear());
    while (next.getTime() < now.getTime())
      next.setFullYear(next.getFullYear() + 1);
  } else if (rec === "monthly") {
    next.setFullYear(now.getFullYear());
    next.setMonth(now.getMonth());
    while (next.getTime() < now.getTime()) next.setMonth(next.getMonth() + 1);
  } else if (rec === "weekly") {
    while (next.getTime() < now.getTime()) next.setDate(next.getDate() + 7);
  } else if (rec === "daily") {
    next.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    while (next.getTime() < now.getTime()) next.setDate(next.getDate() + 1);
  } else if (rec === "hourly") {
    const stepMs = 60 * 60 * 1000;
    if (next.getTime() < now.getTime()) {
      const steps = Math.ceil((now.getTime() - next.getTime()) / stepMs);
      next.setTime(next.getTime() + steps * stepMs);
    }
  }
  return next;
}

/** The occurrence immediately before `targetDate` — used as the progress start. */
function previousOccurrence(event: CountdateEvent, now: Date = new Date()): Date {
  const rec = event.recurrence ?? "none";
  const target = targetDate(event, now);
  const prev = new Date(target);
  if (rec === "yearly") prev.setFullYear(prev.getFullYear() - 1);
  else if (rec === "monthly") prev.setMonth(prev.getMonth() - 1);
  else if (rec === "weekly") prev.setDate(prev.getDate() - 7);
  else if (rec === "daily") prev.setDate(prev.getDate() - 1);
  else if (rec === "hourly") prev.setTime(prev.getTime() - 60 * 60 * 1000);
  else return new Date(event.createdAt ?? parseEventDate(event.date).getTime());
  return prev;
}

/** Check if event is currently active / ongoing between start date and end date. */
export function isEventOngoing(event: CountdateEvent, now: Date = new Date()): boolean {
  if (!event.endDate) return false;
  const start = parseEventDate(event.date);
  const end = parseEventDate(event.endDate);
  return now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
}

/** Recurring events always count down to their next occurrence. */
export function isCountdown(event: CountdateEvent, now: Date = new Date()): boolean {
  if ((event.recurrence ?? "none") !== "none") return true;
  if (event.endDate) {
    return parseEventDate(event.endDate).getTime() >= now.getTime();
  }
  return parseEventDate(event.date).getTime() >= now.getTime();
}

/** Total span in whole days between start date and end date. */
export function totalSpanDays(event: CountdateEvent): number {
  if (!event.endDate) return 0;
  const start = parseEventDate(event.date);
  const end = parseEventDate(event.endDate);
  const diff = Math.max(0, Math.floor((end.getTime() - start.getTime()) / DAY));
  return event.includeEndDay ? diff + 1 : diff;
}

/** Absolute whole-day distance to the target date (or end date if ongoing). */
export function daysToTarget(event: CountdateEvent, now: Date = new Date()): number {
  let target = targetDate(event, now);

  if (event.endDate) {
    const start = parseEventDate(event.date);
    const end = parseEventDate(event.endDate);
    if (now.getTime() >= start.getTime() && now.getTime() <= end.getTime()) {
      // Ongoing: count remaining days until end date
      target = end;
    } else if (now.getTime() > end.getTime()) {
      // Finished: count days since end date
      target = end;
    }
  }

  const baseDays = Math.floor(Math.abs(target.getTime() - now.getTime()) / DAY);
  return event.includeEndDay ? baseDays + 1 : baseDays;
}

/**
 * Progress toward the target as 0..1 — how much of the waiting window has
 * elapsed. Drives the card progress bar. Past one-off events read as complete.
 */
export function progress(event: CountdateEvent, now: Date = new Date()): number {
  if (event.endDate) {
    const start = parseEventDate(event.date).getTime();
    const end = parseEventDate(event.endDate).getTime();
    if (end <= start) return now.getTime() >= end ? 1 : 0;
    if (now.getTime() < start) return 0;
    if (now.getTime() > end) return 1;
    const p = (now.getTime() - start) / (end - start);
    return Math.max(0, Math.min(1, p));
  }

  const end = targetDate(event, now).getTime();
  const start = previousOccurrence(event, now).getTime();
  if (!isCountdown(event, now)) return 1;
  if (end <= start) return 0;
  const p = (now.getTime() - start) / (end - start);
  return Math.max(0, Math.min(1, p));
}

/** Calendar-accurate years/months/days between two dates. */
export function experienceDuration(
  fromDate: Date,
  toDate: Date = new Date()
): { years: number; months: number; days: number } {
  let years = toDate.getFullYear() - fromDate.getFullYear();
  let months = toDate.getMonth() - fromDate.getMonth();
  let days = toDate.getDate() - fromDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(toDate.getFullYear(), toDate.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years: Math.abs(years), months: Math.abs(months), days: Math.abs(days) };
}

export interface LiveDuration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalSeconds: number;
  isPast: boolean;
  isToday: boolean;
}

/** Precise live countdown/countup duration with days, hours, minutes, seconds. */
export function liveDurationBreakdown(
  event: CountdateEvent,
  now: Date = new Date()
): LiveDuration {
  let target = targetDate(event, now);
  const start = parseEventDate(event.date);

  if (event.endDate) {
    const end = parseEventDate(event.endDate);
    if (now.getTime() >= start.getTime() && now.getTime() <= end.getTime()) {
      target = end; // Ongoing
    } else if (now.getTime() > end.getTime()) {
      target = end; // Ended
    }
  }

  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const totalSeconds = Math.floor(absMs / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;

  const earlier = isPast ? target : now;
  const later = isPast ? now : target;

  const ymd = experienceDuration(earlier, later);
  const baseDays = Math.floor(absMs / DAY);
  const totalDays = event.includeEndDay ? baseDays + 1 : baseDays;

  return {
    years: ymd.years,
    months: ymd.months,
    days: ymd.days,
    hours,
    minutes,
    seconds,
    totalDays,
    totalSeconds,
    isPast,
    isToday: baseDays === 0,
  };
}
