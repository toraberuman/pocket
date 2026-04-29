import { error, fail, redirect } from "@sveltejs/kit";
import { getTripAccessBySlug, getTripBySlug, saveTripItemBySlug } from "$lib/server/db";
import { hasTripAccess, isAdmin, setTripAccess, verifyPassword } from "$lib/server/auth";

function normalizeNumber(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  if (!text) return undefined;
  const number = Number(text);
  return Number.isFinite(number) ? number : undefined;
}

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || undefined;
}

function parseDetailJson(value: FormDataEntryValue | null) {
  const text = normalizeText(value);
  if (!text) return undefined;

  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

export async function load({ params, platform, url, cookies }) {
  const access = await getTripAccessBySlug(params.slug, platform?.env);
  if (!access) {
    throw error(404, "Trip not found");
  }

  const admin = await isAdmin(cookies, platform?.env);
  const unlocked = admin || !access.editPasswordHash || hasTripAccess(cookies, params.slug, "edit");

  if (!unlocked) {
    return {
      trip: {
        ...access,
        notes: [],
        items: []
      },
      selectedDay: "",
      selectedItemId: "",
      selectedItem: null,
      locked: true
    };
  }

  const trip = await getTripBySlug(params.slug, platform?.env);
  if (!trip) throw error(404, "Trip not found");

  const selectedDay = url.searchParams.get("day") || trip.items[0]?.dayDate || "";
  const selectedItemId = url.searchParams.get("item") || "";
  const selectedItem = trip.items.find((item) => item.id === selectedItemId) || null;

  return { trip, selectedDay, selectedItemId, selectedItem, locked: false };
}

export const actions = {
  unlock: async ({ request, params, platform, cookies }) => {
    const access = await getTripAccessBySlug(params.slug, platform?.env);
    if (!access) throw error(404, "Trip not found");

    if (await isAdmin(cookies, platform?.env)) {
      throw redirect(303, `/trips/${params.slug}/edit`);
    }

    const password = String((await request.formData()).get("password") || "");
    if (!(await verifyPassword(password, access.editPasswordHash))) {
      return fail(401, { message: "Incorrect edit password." });
    }

    setTripAccess(cookies, params.slug, "edit");
    throw redirect(303, `/trips/${params.slug}/edit`);
  },
  save: async ({ request, params, platform, cookies }) => {
    if (!platform?.env?.DB) {
      return fail(503, {
        message: "This editor needs a D1 binding. Use the deployed app or a Wrangler-backed local environment."
      });
    }

    const access = await getTripAccessBySlug(params.slug, platform?.env);
    if (!access) {
      throw error(404, "Trip not found");
    }

    const admin = await isAdmin(cookies, platform?.env);
    const unlocked = admin || !access.editPasswordHash || hasTripAccess(cookies, params.slug, "edit");
    if (!unlocked) {
      return fail(403, {
        message: "Edit access is locked for this trip."
      });
    }

    const form = await request.formData();
    const dayDate = normalizeText(form.get("dayDate"));
    const name = normalizeText(form.get("name"));
    const category = normalizeText(form.get("category"));

    if (!dayDate || !name || !category) {
      return fail(400, {
        message: "Day, place name, and category are required."
      });
    }

    const result = await saveTripItemBySlug(
      params.slug,
      {
        itemId: normalizeText(form.get("itemId")),
        placeId: normalizeText(form.get("placeId")),
        dayDate,
        startTime: normalizeText(form.get("startTime")),
        endTime: normalizeText(form.get("endTime")),
        category,
        reservationStatus: normalizeText(form.get("reservationStatus")),
        paymentMethod: normalizeText(form.get("paymentMethod")),
        cardLabel: normalizeText(form.get("cardLabel")),
        amount: normalizeNumber(form.get("amount")),
        currency: normalizeText(form.get("currency")),
        notes: normalizeText(form.get("notes")),
        name,
        nativeName: normalizeText(form.get("nativeName")),
        mapsUrl: normalizeText(form.get("mapsUrl")),
        address: normalizeText(form.get("address")),
        phone: normalizeText(form.get("phone")),
        websiteUrl: normalizeText(form.get("websiteUrl")),
        reservationUrl: normalizeText(form.get("reservationUrl")),
        roomType: normalizeText(form.get("roomType")),
        roomInfo: normalizeText(form.get("roomInfo")),
        meals: normalizeText(form.get("meals")),
        checkIn: normalizeText(form.get("checkIn")),
        checkOut: normalizeText(form.get("checkOut")),
        imageUrl: normalizeText(form.get("imageUrl")),
        detailJson: parseDetailJson(form.get("detailJson"))
      },
      platform.env
    );

    throw redirect(303, `/trips/${params.slug}/edit?day=${encodeURIComponent(dayDate)}&item=${encodeURIComponent(result.itemId)}&saved=1`);
  }
};
