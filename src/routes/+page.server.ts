import { listTrips } from "$lib/server/db";

export async function load({ platform }) {
  return {
    trips: await listTrips(platform?.env)
  };
}
