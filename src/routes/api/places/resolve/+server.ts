import { json } from "@sveltejs/kit";
import { resolvePlaceFromMapsUrl } from "$lib/server/google-places";

export async function POST({ request, platform }) {
  const contentType = request.headers.get("content-type") || "";
  const payload =
    contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());

  const place = await resolvePlaceFromMapsUrl(payload, platform?.env);
  return json(place);
}
