import { z } from "zod";
import type { ResolvePlaceResult } from "$lib/types";

const placesRequestSchema = z.object({
  mapsUrl: z.string().url()
});

export async function resolvePlaceFromMapsUrl(
  payload: unknown,
  env?: Env
): Promise<ResolvePlaceResult> {
  const { mapsUrl } = placesRequestSchema.parse(payload);
  const parsed = new URL(mapsUrl);

  if (!env?.MAPS_API_KEY) {
    return {
      mapsUrl,
      name: guessPlaceNameFromUrl(parsed),
      nativeName: guessPlaceNameFromUrl(parsed)
    };
  }

  const placeId = extractPlaceId(parsed);
  if (placeId) {
    return fetchPlaceDetails(placeId, mapsUrl, env.MAPS_API_KEY);
  }

  const textQuery = decodeURIComponent(parsed.pathname.split("/place/")[1] || parsed.searchParams.get("q") || "");
  if (!textQuery) {
    return { mapsUrl, name: guessPlaceNameFromUrl(parsed) };
  }

  const search = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": env.MAPS_API_KEY,
      "x-goog-fieldmask":
        "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.googleMapsUri,places.location"
    },
    body: JSON.stringify({
      textQuery
    })
  });

  if (!search.ok) {
    throw new Error(`Places text search failed: ${search.status}`);
  }

  const json = (await search.json()) as {
    places?: Array<{
      id: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      nationalPhoneNumber?: string;
      websiteUri?: string;
      googleMapsUri?: string;
      location?: { latitude?: number; longitude?: number };
    }>;
  };

  const match = json.places?.[0];
  if (!match) {
    return { mapsUrl, name: textQuery };
  }

  return {
    mapsUrl,
    googlePlaceId: match.id,
    name: match.displayName?.text || textQuery,
    nativeName: match.displayName?.text || textQuery,
    phone: match.nationalPhoneNumber,
    address: match.formattedAddress,
    websiteUrl: match.websiteUri,
    lat: match.location?.latitude,
    lng: match.location?.longitude,
    raw: json
  };
}

function extractPlaceId(url: URL): string | undefined {
  return (
    url.searchParams.get("query_place_id") ||
    url.searchParams.get("place_id") ||
    undefined
  );
}

function guessPlaceNameFromUrl(url: URL): string {
  const raw = url.pathname.split("/place/")[1] || url.searchParams.get("q") || "New place";
  return raw.replace(/\+/g, " ").replace(/\/.*$/, "").trim();
}

async function fetchPlaceDetails(
  placeId: string,
  mapsUrl: string,
  apiKey: string
): Promise<ResolvePlaceResult> {
  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "x-goog-api-key": apiKey,
      "x-goog-fieldmask":
        "id,displayName,formattedAddress,nationalPhoneNumber,websiteUri,googleMapsUri,location"
    }
  });

  if (!response.ok) {
    throw new Error(`Place details failed: ${response.status}`);
  }

  const json = (await response.json()) as {
    id: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    googleMapsUri?: string;
    location?: { latitude?: number; longitude?: number };
  };

  return {
    mapsUrl,
    googlePlaceId: json.id,
    name: json.displayName?.text || "Resolved place",
    nativeName: json.displayName?.text || "Resolved place",
    phone: json.nationalPhoneNumber,
    address: json.formattedAddress,
    websiteUrl: json.websiteUri,
    lat: json.location?.latitude,
    lng: json.location?.longitude,
    raw: json
  };
}
