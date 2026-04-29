import { error, fail, redirect } from "@sveltejs/kit";
import { getTripAccessBySlug, getTripBySlug } from "$lib/server/db";
import { hasTripAccess, isAdmin, setTripAccess, verifyPassword } from "$lib/server/auth";

export async function load({ params, platform, cookies }) {
  const access = await getTripAccessBySlug(params.slug, platform?.env);
  if (!access) {
    throw error(404, "Trip not found");
  }

  const admin = await isAdmin(cookies, platform?.env);
  const unlocked = admin || !access.viewPasswordHash || hasTripAccess(cookies, params.slug, "view");

  if (!unlocked) {
    return {
      trip: {
        ...access,
        notes: [],
        items: []
      },
      locked: true
    };
  }

  const trip = await getTripBySlug(params.slug, platform?.env);
  if (!trip) {
    throw error(404, "Trip not found");
  }

  return { trip, locked: false };
}

export const actions = {
  unlock: async ({ request, params, platform, cookies }) => {
    const access = await getTripAccessBySlug(params.slug, platform?.env);
    if (!access) {
      throw error(404, "Trip not found");
    }

    const password = String((await request.formData()).get("password") || "");
    if (!(await verifyPassword(password, access.viewPasswordHash))) {
      return fail(401, { message: "Incorrect trip password." });
    }

    setTripAccess(cookies, params.slug, "view");
    throw redirect(303, `/trips/${params.slug}`);
  }
};
