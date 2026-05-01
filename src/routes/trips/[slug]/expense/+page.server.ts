import { error } from "@sveltejs/kit";
import { hasTripAccess, isAdmin } from "$lib/server/auth";
import { getTripAccessBySlug, getTripBySlug } from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, platform, cookies }) => {
  const access = await getTripAccessBySlug(params.slug, platform?.env);
  if (!access) {
    throw error(404, "Trip not found");
  }

  const admin = await isAdmin(cookies, platform?.env);
  const unlocked = admin || !access.viewPasswordHash || hasTripAccess(cookies, params.slug, "view");
  if (!unlocked) {
    return { trip: access, locked: true };
  }

  return {
    trip: (await getTripBySlug(params.slug, platform?.env)) ?? access,
    locked: false
  };
};
