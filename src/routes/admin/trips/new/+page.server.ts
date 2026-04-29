import { fail, redirect } from "@sveltejs/kit";
import { createTrip } from "$lib/server/db";
import { isAdmin } from "$lib/server/auth";

function text(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

export async function load({ cookies, platform }) {
  if (!(await isAdmin(cookies, platform?.env))) {
    throw redirect(303, "/admin/login");
  }

  return {};
}

export const actions = {
  create: async ({ request, cookies, platform }) => {
    if (!(await isAdmin(cookies, platform?.env))) {
      throw redirect(303, "/admin/login");
    }

    const form = await request.formData();
    const slug = text(form, "slug");
    const title = text(form, "title");
    const destination = text(form, "destination");
    const startDate = text(form, "startDate");
    const endDate = text(form, "endDate");
    const travelerCount = Number(text(form, "travelerCount") || "1");

    if (!slug || !title || !destination || !startDate || !endDate) {
      return fail(400, { message: "Please fill in slug, title, destination, and dates." });
    }

    await createTrip(
      {
        slug,
        title,
        destination,
        startDate,
        endDate,
        travelerCount: Number.isFinite(travelerCount) ? travelerCount : 1,
        coverImageUrl: text(form, "coverImageUrl") || undefined,
        isPrivate: form.get("isPrivate") === "on",
        viewPassword: text(form, "viewPassword") || undefined,
        editPassword: text(form, "editPassword") || undefined
      },
      platform?.env
    );

    throw redirect(303, `/trips/${slug}/edit`);
  }
};
