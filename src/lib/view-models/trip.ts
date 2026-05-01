import { categoryLabel, subcategoryLabel } from "$lib/i18n/labels";
import { formatCurrencyAmount } from "$lib/currencies";
import type { TripDetail, TripItemDraft, TripSummary } from "$lib/types";

export type PocketTone = "transport" | "food" | "sight" | "stay" | "nature" | "shopping" | "other";
export type TimelineCardKind = "flight" | "train" | "transport" | "stay" | "food" | "shopping" | "sight" | "generic";
export type TimelineDetailKind = "flight" | "train" | "bus" | "stay" | "food" | "generic";

export type TripListCard = {
  slug: string;
  title: string;
  destination: string;
  dateRange: string;
  daysCount: number;
  travelerCount: number;
  status: "upcoming" | "ongoing" | "completed";
  isPrivate?: boolean;
};

export type TimelineActivity = {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  location: string;
  type: PocketTone;
  cardKind: TimelineCardKind;
  detailKind: TimelineDetailKind;
  icon: string;
  label: string;
  tags: string[];
  notes?: string;
  isTransport: boolean;
  isFlight: boolean;
  raw: TripItemDraft;
};

export type TimelineDay = {
  date: string;
  dayLabel: string;
  shortDate: string;
  activities: TimelineActivity[];
};

export type TripPlanView = {
  slug: string;
  title: string;
  destination: string;
  dateRange: string;
  daysCount: number;
  travelerCount: number;
  days: TimelineDay[];
};

export function toTripListCard(trip: TripSummary, today = new Date()): TripListCard {
  return {
    slug: trip.slug,
    title: trip.title,
    destination: trip.destination,
    dateRange: formatDateRange(trip.startDate, trip.endDate),
    daysCount: countDays(trip.startDate, trip.endDate),
    travelerCount: trip.travelerCount,
    status: tripStatus(trip, today),
    isPrivate: trip.isPrivate
  };
}

export function toTripPlanView(trip: TripDetail): TripPlanView {
  const sortedItems = [...trip.items].sort(compareTripItems);
  const grouped = new Map<string, TripItemDraft[]>();

  for (const item of sortedItems) {
    const items = grouped.get(item.dayDate) ?? [];
    items.push(item);
    grouped.set(item.dayDate, items);
  }

  const days = [...grouped.entries()].map(([date, items], index) => ({
    date,
    dayLabel: `Day ${index + 1}`,
    shortDate: formatShortDate(date),
    activities: items.map(toTimelineActivity)
  }));

  return {
    slug: trip.slug,
    title: trip.title,
    destination: trip.destination,
    dateRange: formatDateRange(trip.startDate, trip.endDate),
    daysCount: countDays(trip.startDate, trip.endDate),
    travelerCount: trip.travelerCount,
    days
  };
}

export function toTimelineActivity(item: TripItemDraft): TimelineActivity {
  const type = itemTone(item);
  const subcategory = item.subcategory ? subcategoryLabel(item.subcategory) : undefined;
  const category = categoryLabel(item.category);

  return {
    id: item.id,
    time: item.startTime || "All day",
    endTime: item.endTime,
    title: item.place.name,
    location: item.place.nativeName || item.place.address || item.place.name,
    type,
    cardKind: itemCardKind(item),
    detailKind: itemDetailKind(item),
    icon: itemIconId(item),
    label: subcategory || category,
    tags: itemTags(item),
    notes: item.notes,
    isTransport: isTransport(item),
    isFlight: item.subcategory === "flight",
    raw: item
  };
}

export function itemDetailKind(item: TripItemDraft): TimelineDetailKind {
  if (item.subcategory === "flight") return "flight";
  if (item.subcategory === "train") return "train";
  if (item.subcategory === "bus") return "bus";
  if (item.category === "stay") return "stay";
  if (item.category === "restaurant") return "food";
  return "generic";
}

export function itemCardKind(item: TripItemDraft): TimelineCardKind {
  if (item.subcategory === "flight") return "flight";
  if (item.subcategory === "train") return "train";
  if (isTransport(item)) return "transport";
  if (item.category === "stay") return "stay";
  if (item.category === "restaurant") return "food";
  if (item.category === "shopping") return "shopping";
  if (item.category === "sight" || item.category === "experience") return "sight";
  return "generic";
}

export function itemTone(item: TripItemDraft): PocketTone {
  if (isTransport(item)) return "transport";
  if (item.category === "restaurant") return "food";
  if (item.category === "sight" || item.category === "experience") return "sight";
  if (item.category === "stay") return "stay";
  if (item.category === "shopping") return "shopping";
  return "other";
}

export function itemIconId(item: TripItemDraft) {
  if (isTransport(item)) {
    switch (item.subcategory) {
      case "flight":
        return "plane";
      case "train":
        return "train";
      case "taxi":
        return "taxi";
      case "drive":
        return "car";
      case "walk":
        return "footprints";
      case "bus":
        return "bus";
      case "metro":
        return "tram";
      default:
        return "route";
    }
  }

  switch (item.category) {
    case "restaurant":
      return "utensils";
    case "stay":
      return "bed";
    case "sight":
      return "camera";
    case "shopping":
      return "shopping-bag";
    case "experience":
      return "spark";
    default:
      return "map-pin";
  }
}

function itemTags(item: TripItemDraft) {
  const tags = [
    item.subcategory ? subcategoryLabel(item.subcategory) : undefined,
    item.reservationStatus,
    item.paymentMethod,
    item.amount ? formatMoney(item.amount, item.currency) : undefined
  ];

  return tags.filter((tag): tag is string => Boolean(tag));
}

function isTransport(item: TripItemDraft) {
  return item.category === "transport";
}

function compareTripItems(a: TripItemDraft, b: TripItemDraft) {
  const dateOrder = a.dayDate.localeCompare(b.dayDate);
  if (dateOrder !== 0) return dateOrder;

  const timeOrder = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  if (timeOrder !== 0) return timeOrder;

  return a.place.name.localeCompare(b.place.name);
}

function timeToMinutes(value?: string) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return Number.MAX_SAFE_INTEGER;
  return hours * 60 + minutes;
}

function tripStatus(trip: TripSummary, today: Date) {
  const start = parseDate(trip.startDate);
  const end = parseDate(trip.endDate);
  if (!start || !end) return "upcoming";
  if (today < start) return "upcoming";
  if (today > end) return "completed";
  return "ongoing";
}

function countDays(startDate: string, endDate: string) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return 0;
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
}

function formatDateRange(startDate: string, endDate: string) {
  return `${startDate} - ${endDate}`;
}

function formatShortDate(dateValue: string) {
  const date = parseDate(dateValue);
  if (!date) return dateValue;
  return new Intl.DateTimeFormat("en", { month: "2-digit", day: "2-digit" }).format(date).replace("/", ".");
}

function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatMoney(amount: number, currency?: string) {
  return formatCurrencyAmount(amount, currency);
}
