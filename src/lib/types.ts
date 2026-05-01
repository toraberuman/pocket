export type LocaleCode = "zh-TW" | "en";

export type TripCategory =
  | "transport"
  | "stay"
  | "restaurant"
  | "sight"
  | "shopping"
  | "experience"
  | "other";

export type TripSubcategory =
  | "flight"
  | "train"
  | "taxi"
  | "drive"
  | "walk"
  | "bus"
  | "metro"
  | "ferry"
  | "transfer"
  | "stay"
  | "restaurant"
  | "sight"
  | "shopping"
  | "experience"
  | "other";

export interface PlaceDraft {
  id: string;
  mapsUrl?: string;
  googlePlaceId?: string;
  name: string;
  nativeName?: string;
  phone?: string;
  address?: string;
  websiteUrl?: string;
  reservationUrl?: string;
  lat?: number;
  lng?: number;
}

export interface TripItemDraft {
  id: string;
  tripId: string;
  dayDate: string;
  startTime?: string;
  endTime?: string;
  category: TripCategory;
  subcategory?: TripSubcategory;
  reservationStatus?: string;
  paymentMethod?: string;
  cardLabel?: string;
  amount?: number;
  currency?: string;
  notes?: string;
  detailJson?: Record<string, unknown>;
  place: PlaceDraft;
}

export interface TripSummary {
  id: string;
  slug: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
  defaultCurrency: string;
  coverImageUrl?: string;
  isPrivate?: boolean;
}

export interface TripDetail extends TripSummary {
  notes: string[];
  items: TripItemDraft[];
}

export interface ResolvePlaceResult {
  mapsUrl: string;
  googlePlaceId?: string;
  name: string;
  nativeName?: string;
  phone?: string;
  address?: string;
  websiteUrl?: string;
  reservationUrl?: string;
  lat?: number;
  lng?: number;
  raw?: unknown;
}
