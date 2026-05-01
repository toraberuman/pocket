import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { resolveFlight } from "$lib/server/flight-resolver";

export const POST: RequestHandler = async ({ request, platform }) => {
  const payload = await request.json();

  try {
    const flight = await resolveFlight(payload, platform?.env);
    return json(flight);
  } catch (error) {
    return json(
      {
        message: error instanceof Error ? error.message : "Unable to resolve flight."
      },
      { status: 400 }
    );
  }
};
