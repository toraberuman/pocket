export type TripCategory =
  | "交通"
  | "住宿"
  | "食"
  | "景點"
  | "購物"
  | "體驗"
  | "季節"
  | "櫻花"
  | "其他";

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
