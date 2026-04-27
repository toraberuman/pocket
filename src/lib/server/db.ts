import { getTripFromCsv, listTripsFromCsv } from "$lib/server/csv-fallback";
import type { TripDetail, TripSummary } from "$lib/types";

export async function listTrips(env?: Env): Promise<TripSummary[]> {
  if (!env?.DB) {
    return listTripsFromCsv();
  }

  try {
    const result = await env.DB.prepare(
      `select id, slug, title, destination, start_date as startDate, end_date as endDate,
              traveler_count as travelerCount, cover_image_url as coverImageUrl
         from trips
        order by start_date desc`
    ).all<TripSummary>();

    return result.results.length ? result.results : listTripsFromCsv();
  } catch {
    return listTripsFromCsv();
  }
}

export async function getTripBySlug(slug: string, env?: Env): Promise<TripDetail | null> {
  if (!env?.DB) {
    return getTripFromCsv(slug);
  }

  try {
    const trip = await env.DB.prepare(
      `select id, slug, title, destination, start_date as startDate, end_date as endDate,
              traveler_count as travelerCount, cover_image_url as coverImageUrl, notes_json
         from trips
        where slug = ?1
        limit 1`
    )
      .bind(slug)
      .first<TripSummary & { notes_json?: string }>();

    if (!trip) return getTripFromCsv(slug);

    const itemRows = await env.DB.prepare(
      `select
          ti.id,
          ti.trip_id as tripId,
          ti.day_date as dayDate,
          ti.start_time as startTime,
          ti.end_time as endTime,
          ti.category,
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

    const hydrated = {
      ...trip,
      notes: trip.notes_json ? JSON.parse(trip.notes_json) : [],
      items: itemRows.results.map((row) => ({
        id: String(row.id),
        tripId: String(row.tripId),
        dayDate: String(row.dayDate),
        startTime: row.startTime ? String(row.startTime) : undefined,
        endTime: row.endTime ? String(row.endTime) : undefined,
        category: String(row.category) as TripDetail["items"][number]["category"],
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

    return hydrated.items.length ? hydrated : getTripFromCsv(slug);
  } catch {
    return getTripFromCsv(slug);
  }
}
