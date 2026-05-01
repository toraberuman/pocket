import { error } from "@sveltejs/kit";
import { getTripAccessBySlug } from "$lib/server/db";
import { hasTripAccess, isAdmin } from "$lib/server/auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, platform, cookies }) => {
  const trip = await getTripAccessBySlug(params.slug, platform?.env);
  if (!trip) {
    throw error(404, "Trip not found");
  }

  const admin = await isAdmin(cookies, platform?.env);
  const unlocked = admin || !trip.viewPasswordHash || hasTripAccess(cookies, params.slug, "view");
  return { trip, locked: !unlocked };
};
