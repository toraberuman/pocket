import type { TimelineActivity } from "$lib/view-models/trip";
import { formatCurrencyAmount } from "$lib/currencies";

export function detailOf(activity: TimelineActivity) {
  return activity.raw.detailJson || {};
}

export function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export function firstText(...values: unknown[]) {
  for (const value of values) {
    const normalized = text(value);
    if (normalized) return normalized;
  }
  return "";
}

export function airportCode(value: unknown) {
  return text(value).match(/[A-Z]{3}/)?.[0] || "";
}

export function airportName(value: unknown) {
  const normalized = text(value);
  if (!normalized) return "";
  return normalized.replace(/^[A-Z]{3}\s*/, "").trim();
}

export function airportFullName(...values: unknown[]) {
  for (const value of values) {
    const normalized = airportName(value);
    if (normalized && !/^[A-Z]{3}$/.test(normalized)) return normalized;
  }
  return "";
}

export function durationText(activity: TimelineActivity) {
  const detail = detailOf(activity);
  const minutes = Number(detail.durationMinutes);
  if (text(detail.durationText)) return text(detail.durationText);
  if (Number.isFinite(minutes) && minutes > 0) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours ? `${hours}h ${mins}m` : `${mins}m`;
  }
  return "";
}

export function fareText(activity: TimelineActivity) {
  if (!activity.raw.amount) return "";
  return formatCurrencyAmount(activity.raw.amount, activity.raw.currency);
}

export function passengerRows(activity: TimelineActivity) {
  const detail = detailOf(activity);
  const raw = detail.passengers;
  if (Array.isArray(raw)) {
    return raw
      .map((row) => (row && typeof row === "object" ? row as Record<string, unknown> : null))
      .filter((row): row is Record<string, unknown> => Boolean(row))
      .map((row) => ({
        name: firstText(row.nameEn, row.englishName, row.passengerNameEn, row.name, row.passengerName) || "Traveler",
        className: firstText(row.className, row.carriageClass, row.cabinClass, row.class, detail.carriageClass),
        seat: firstText(row.seat, detail.seat),
        car: firstText(row.car, row.carNumber, detail.carNumber)
      }));
  }

  return [
    {
      name: firstText(detail.passengerNameEn, detail.englishName, detail.passengerName) || "Traveler",
      className: firstText(detail.carriageClass, detail.cabinClass, detail.class),
      seat: firstText(detail.seat),
      car: firstText(detail.carNumber)
    }
  ];
}

export const barcodeBars = [2, 1, 1, 3, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1];
export const qrBlocks = [0, 1, 2, 4, 6, 7, 10, 12, 14, 16, 18, 22, 24, 25, 28, 29, 30, 33, 35, 38, 40, 41, 42, 44, 46, 48];
