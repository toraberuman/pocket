import { listTrips } from "$lib/server/db";
import { isAdmin } from "$lib/server/auth";

export async function load({ platform, cookies }) {
  return {
    trips: await listTrips(platform?.env),
    isAdmin: await isAdmin(cookies, platform?.env)
  };
}
