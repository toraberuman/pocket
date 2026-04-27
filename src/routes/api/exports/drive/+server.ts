import { json } from "@sveltejs/kit";
import { getTripBySlug } from "$lib/server/db";
import { exportTripCsvToDrive } from "$lib/server/drive-export";

export async function POST({ request, platform }) {
  const body = (await request.json()) as { slug?: string };
  if (!body.slug) {
    return json({ error: "Missing slug" }, { status: 400 });
  }

  const trip = await getTripBySlug(body.slug, platform?.env);
  if (!trip) {
    return json({ error: "Trip not found" }, { status: 404 });
  }

  const result = await exportTripCsvToDrive(trip, platform?.env);
  return json(result);
}
