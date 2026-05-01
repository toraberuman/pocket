import { getTripFromCsv, listTripsFromCsv } from "$lib/server/csv-fallback";
import type { TripDetail, TripSubcategory, TripSummary } from "$lib/types";
import { hashPassword } from "$lib/server/auth";
import { defaultCurrencyCode, normalizeCurrency } from "$lib/currencies";

export type SaveTripItemInput = {
  itemId?: string;
  placeId?: string;
  dayDate: string;
  startTime?: string;
  endTime?: string;
  category: string;
  subcategory?: TripSubcategory | string;
  reservationStatus?: string;
  paymentMethod?: string;
  cardLabel?: string;
  amount?: number;
  currency?: string;
  notes?: string;
  name: string;
  nativeName?: string;
  mapsUrl?: string;
  address?: string;
  phone?: string;
  websiteUrl?: string;
  reservationUrl?: string;
  roomType?: string;
  roomInfo?: string;
  meals?: string;
  checkIn?: string;
  checkOut?: string;
  imageUrl?: string;
  detailFields?: Record<string, unknown>;
  detailJson?: Record<string, unknown>;
};

export type CreateTripInput = {
  slug: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
  defaultCurrency?: string;
  coverImageUrl?: string;
  isPrivate?: boolean;
  viewPassword?: string;
  editPassword?: string;
};

export class DuplicateTripSlugError extends Error {
  constructor(slug: string) {
    super(`Trip slug "${slug}" already exists.`);
    this.name = "DuplicateTripSlugError";
  }
}

export function normalizeTripSlug(slug: string) {
  return slug.trim().toLowerCase();
}

export type UpdateTripInput = {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
  defaultCurrency?: string;
  coverImageUrl?: string;
  isPrivate?: boolean;
  viewPassword?: string;
  editPassword?: string;
};

export type TripAccess = TripSummary & {
  viewPasswordHash?: string | null;
  editPasswordHash?: string | null;
};

export async function listTrips(env?: Env): Promise<TripSummary[]> {
  if (!env?.DB) {
    return listTripsFromCsv();
  }

  try {
    const result = await env.DB.prepare(
      `select id, slug, title, destination, start_date as startDate, end_date as endDate,
              traveler_count as travelerCount, default_currency as defaultCurrency,
              cover_image_url as coverImageUrl, is_private as isPrivate
         from trips
        order by start_date desc`
    ).all<TripSummary>();

    return result.results.length ? result.results.map(withDefaultCurrency) : listTripsFromCsv();
  } catch {
    return listTripsFromCsv();
  }
}

export async function getTripBySlug(slug: string, env?: Env): Promise<TripDetail | null> {
  const normalizedSlug = normalizeTripSlug(slug);
  if (!env?.DB) {
    return getTripFromCsv(normalizedSlug);
  }

  try {
    const trip = await env.DB.prepare(
      `select id, slug, title, destination, start_date as startDate, end_date as endDate,
              traveler_count as travelerCount, default_currency as defaultCurrency,
              cover_image_url as coverImageUrl, is_private as isPrivate, notes_json
         from trips
        where lower(slug) = ?1
        limit 1`
    )
      .bind(normalizedSlug)
      .first<TripSummary & { notes_json?: string }>();

    if (!trip) return getTripFromCsv(normalizedSlug);

    let itemResults: Record<string, unknown>[] = [];
    try {
      const itemRows = await env.DB.prepare(
        `select
            ti.id,
            ti.trip_id as tripId,
            ti.day_date as dayDate,
            ti.start_time as startTime,
            ti.end_time as endTime,
            ti.category,
            ti.subcategory,
            ti.reservation_status as reservationStatus,
            ti.payment_method as paymentMethod,
            ti.card_label as cardLabel,
            ti.amount,
            ti.currency,
            ti.notes,
            ti.detail_json as detailJson,
            p.id as placeId,
            p.maps_url as mapsUrl,
            p.google_place_id as googlePlaceId,
            p.name,
            p.native_name as nativeName,
            p.phone,
            p.address,
            p.website_url as websiteUrl,
            p.reservation_url as reservationUrl,
            p.lat,
            p.lng
          from trip_items ti
          left join places p on p.id = ti.place_id
          where ti.trip_id = ?1
          order by ti.day_date asc, ti.start_time asc`
      )
        .bind(trip.id)
        .all<Record<string, unknown>>();
      itemResults = itemRows.results;
    } catch (error) {
      console.error("Failed to load trip items", error);
    }

    const hydrated = {
      ...trip,
      defaultCurrency: trip.defaultCurrency || defaultCurrencyCode,
      notes: trip.notes_json ? JSON.parse(trip.notes_json) : [],
      items: itemResults.map((row: Record<string, unknown>) => ({
        id: String(row.id),
        tripId: String(row.tripId),
        dayDate: String(row.dayDate),
        startTime: row.startTime ? String(row.startTime) : undefined,
        endTime: row.endTime ? String(row.endTime) : undefined,
        category: String(row.category) as TripDetail["items"][number]["category"],
        subcategory: row.subcategory ? (String(row.subcategory) as TripDetail["items"][number]["subcategory"]) : undefined,
        reservationStatus: row.reservationStatus ? String(row.reservationStatus) : undefined,
        paymentMethod: row.paymentMethod ? String(row.paymentMethod) : undefined,
        cardLabel: row.cardLabel ? String(row.cardLabel) : undefined,
        amount: typeof row.amount === "number" ? row.amount : undefined,
        currency: row.currency ? String(row.currency) : undefined,
        notes: row.notes ? String(row.notes) : undefined,
        detailJson: row.detailJson ? JSON.parse(String(row.detailJson)) : undefined,
        place: {
          id: row.placeId ? String(row.placeId) : crypto.randomUUID(),
          mapsUrl: row.mapsUrl ? String(row.mapsUrl) : undefined,
          googlePlaceId: row.googlePlaceId ? String(row.googlePlaceId) : undefined,
          name: row.name ? String(row.name) : "Untitled place",
          nativeName: row.nativeName ? String(row.nativeName) : undefined,
          phone: row.phone ? String(row.phone) : undefined,
          address: row.address ? String(row.address) : undefined,
          websiteUrl: row.websiteUrl ? String(row.websiteUrl) : undefined,
          reservationUrl: row.reservationUrl ? String(row.reservationUrl) : undefined,
          lat: typeof row.lat === "number" ? row.lat : undefined,
          lng: typeof row.lng === "number" ? row.lng : undefined
        }
      }))
    };

    return hydrated;
  } catch {
    return getTripFromCsv(normalizedSlug);
  }
}

export async function getTripAccessBySlug(slug: string, env?: Env): Promise<TripAccess | null> {
  const normalizedSlug = normalizeTripSlug(slug);
  if (!env?.DB) {
    const trip = await getTripFromCsv(normalizedSlug);
    return trip
      ? {
          id: trip.id,
          slug: trip.slug,
          title: trip.title,
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          travelerCount: trip.travelerCount,
          defaultCurrency: trip.defaultCurrency || defaultCurrencyCode,
          coverImageUrl: trip.coverImageUrl,
          isPrivate: false
        }
      : null;
  }

  const trip = await env.DB.prepare(
    `select id, slug, title, destination, start_date as startDate, end_date as endDate,
            traveler_count as travelerCount, default_currency as defaultCurrency,
            cover_image_url as coverImageUrl, is_private as isPrivate,
            view_password_hash as viewPasswordHash, edit_password_hash as editPasswordHash
      from trips
      where lower(slug) = ?1
      limit 1`
  )
    .bind(normalizedSlug)
    .first<TripAccess>();

  return trip ? withDefaultCurrency(trip) : null;
}

export async function createTrip(input: CreateTripInput, env?: Env) {
  if (!env?.DB) {
    throw new Error("D1 binding is not available in this environment.");
  }

  const slug = normalizeTripSlug(input.slug);
  const existing = await env.DB.prepare("select id from trips where lower(slug) = ?1 limit 1").bind(slug).first<{ id: string }>();
  if (existing?.id) {
    throw new DuplicateTripSlugError(slug);
  }

  const id = `trip:${slug}`;
  const viewPasswordHash = input.viewPassword ? await hashPassword(input.viewPassword) : null;
  const editPasswordHash = input.editPassword ? await hashPassword(input.editPassword) : null;
  const defaultCurrency = normalizeCurrency(input.defaultCurrency);

  await env.DB.prepare(
    `insert into trips (
       id, slug, title, destination, start_date, end_date, traveler_count, default_currency, cover_image_url,
       is_private, view_password_hash, edit_password_hash, notes_json, updated_at
     ) values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, '[]', current_timestamp)`
  )
    .bind(
      id,
      slug,
      input.title,
      input.destination,
      input.startDate,
      input.endDate,
      input.travelerCount,
      defaultCurrency,
      input.coverImageUrl || null,
      input.isPrivate ? 1 : 0,
      viewPasswordHash,
      editPasswordHash
    )
    .run();

  return { id, slug };
}

export async function updateTripBySlug(slug: string, input: UpdateTripInput, env?: Env) {
  if (!env?.DB) {
    throw new Error("D1 binding is not available in this environment.");
  }

  const normalizedSlug = normalizeTripSlug(slug);
  const trip = await env.DB.prepare("select id from trips where lower(slug) = ?1 limit 1").bind(normalizedSlug).first<{ id: string }>();
  if (!trip?.id) {
    throw new Error(`Trip ${normalizedSlug} was not found.`);
  }

  const current = await env.DB.prepare(
    `select view_password_hash as viewPasswordHash, edit_password_hash as editPasswordHash
       from trips
      where id = ?1
      limit 1`
  )
    .bind(trip.id)
    .first<{ viewPasswordHash?: string | null; editPasswordHash?: string | null }>();

  const viewPasswordHash =
    input.viewPassword && input.viewPassword.trim()
      ? await hashPassword(input.viewPassword)
      : (current?.viewPasswordHash ?? null);
  const editPasswordHash =
    input.editPassword && input.editPassword.trim()
      ? await hashPassword(input.editPassword)
      : (current?.editPasswordHash ?? null);

  await env.DB.prepare(
    `update trips
        set title = ?2,
            destination = ?3,
            start_date = ?4,
            end_date = ?5,
            traveler_count = ?6,
            default_currency = ?7,
            cover_image_url = ?8,
            is_private = ?9,
            view_password_hash = ?10,
            edit_password_hash = ?11,
            updated_at = current_timestamp
      where lower(slug) = ?1`
  )
    .bind(
      normalizedSlug,
      input.title,
      input.destination,
      input.startDate,
      input.endDate,
      input.travelerCount,
      normalizeCurrency(input.defaultCurrency),
      input.coverImageUrl || null,
      input.isPrivate ? 1 : 0,
      viewPasswordHash,
      editPasswordHash
    )
    .run();
}

export async function saveTripItemBySlug(slug: string, input: SaveTripItemInput, env?: Env) {
  if (!env?.DB) {
    throw new Error("D1 binding is not available in this environment.");
  }

  const normalizedSlug = normalizeTripSlug(slug);
  const trip = await env.DB.prepare("select id from trips where lower(slug) = ?1 limit 1").bind(normalizedSlug).first<{ id: string }>();
  if (!trip?.id) {
    throw new Error(`Trip ${normalizedSlug} was not found.`);
  }

  const itemId = input.itemId || `item:${normalizedSlug}:${crypto.randomUUID()}`;
  const placeId = input.placeId || `place:${normalizedSlug}:${crypto.randomUUID()}`;
  const detailJson = buildDetailJson(input);

  await env.DB.prepare(
    `insert into places (
       id, maps_url, name, native_name, phone, address, website_url, reservation_url, updated_at
     ) values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, current_timestamp)
     on conflict(id) do update set
       maps_url = excluded.maps_url,
       name = excluded.name,
       native_name = excluded.native_name,
       phone = excluded.phone,
       address = excluded.address,
       website_url = excluded.website_url,
       reservation_url = excluded.reservation_url,
       updated_at = current_timestamp`
  )
    .bind(
      placeId,
      input.mapsUrl || null,
      input.name,
      input.nativeName || null,
      input.phone || null,
      input.address || null,
      input.websiteUrl || null,
      input.reservationUrl || null
    )
    .run();

  await env.DB.prepare(
    `insert into trip_items (
       id, trip_id, place_id, day_date, start_time, end_time, category, subcategory,
       reservation_status, payment_method, card_label, amount, currency, notes, detail_json, updated_at
     ) values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, current_timestamp)
     on conflict(id) do update set
       place_id = excluded.place_id,
       day_date = excluded.day_date,
       start_time = excluded.start_time,
       end_time = excluded.end_time,
       category = excluded.category,
       subcategory = excluded.subcategory,
       reservation_status = excluded.reservation_status,
       payment_method = excluded.payment_method,
       card_label = excluded.card_label,
       amount = excluded.amount,
       currency = excluded.currency,
       notes = excluded.notes,
       detail_json = excluded.detail_json,
       updated_at = current_timestamp`
  )
    .bind(
      itemId,
      trip.id,
      placeId,
      input.dayDate,
      input.startTime || null,
      input.endTime || null,
      input.category,
      input.subcategory || null,
      input.reservationStatus || null,
      input.paymentMethod || null,
      input.cardLabel || null,
      input.amount ?? null,
      normalizeCurrency(input.currency),
      input.notes || null,
      detailJson ? JSON.stringify(detailJson) : null
    )
    .run();

  return { itemId, placeId };
}

export async function deleteTripItemBySlug(slug: string, itemId: string, env?: Env) {
  if (!env?.DB) {
    throw new Error("D1 binding is not available in this environment.");
  }

  const normalizedSlug = normalizeTripSlug(slug);
  const trip = await env.DB.prepare("select id from trips where lower(slug) = ?1 limit 1").bind(normalizedSlug).first<{ id: string }>();
  if (!trip?.id) {
    throw new Error(`Trip ${normalizedSlug} was not found.`);
  }

  await env.DB.prepare("delete from trip_items where id = ?1 and trip_id = ?2").bind(itemId, trip.id).run();
}

function buildDetailJson(input: SaveTripItemInput) {
  const detail = {
    ...(input.detailJson || {})
  } as Record<string, unknown>;

  assignDetail(detail, "roomType", input.roomType);
  assignDetail(detail, "roomInfo", input.roomInfo);
  assignDetail(detail, "meals", input.meals);
  assignDetail(detail, "checkIn", input.checkIn);
  assignDetail(detail, "checkOut", input.checkOut);
  assignDetail(detail, "imageUrl", input.imageUrl);
  for (const [key, value] of Object.entries(input.detailFields || {})) {
    assignDetail(detail, key, value);
  }

  return Object.keys(detail).length ? detail : undefined;
}

function assignDetail(target: Record<string, unknown>, key: string, value?: unknown) {
  if (Array.isArray(value)) {
    if (value.length) {
      target[key] = value;
      return;
    }
    delete target[key];
    return;
  }

  if (typeof value === "string") {
    if (value.trim()) {
      target[key] = value.trim();
      return;
    }
    delete target[key];
    return;
  }

  if (value && typeof value === "object") {
    target[key] = value;
    return;
  }

  delete target[key];
}

function withDefaultCurrency<T extends { defaultCurrency?: string | null }>(trip: T): T & { defaultCurrency: string } {
  return {
    ...trip,
    defaultCurrency: trip.defaultCurrency || defaultCurrencyCode
  };
}
