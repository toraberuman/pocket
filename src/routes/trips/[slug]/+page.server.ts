import { error } from "@sveltejs/kit";
import { getTripBySlug } from "$lib/server/db";

export async function load({ params, platform }) {
  const trip = await getTripBySlug(params.slug, platform?.env);
  if (!trip) {
    throw error(404, "Trip not found");
  }

  return { trip };
}
