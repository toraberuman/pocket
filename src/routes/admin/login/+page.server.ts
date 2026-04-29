import { fail, redirect } from "@sveltejs/kit";
import { isAdmin, setAdminSession } from "$lib/server/auth";

export async function load({ cookies, platform }) {
  return {
    isAdmin: await isAdmin(cookies, platform?.env)
  };
}

export const actions = {
  login: async ({ request, cookies, platform }) => {
    const password = String((await request.formData()).get("password") || "");

    if (!platform?.env?.ADMIN_PASSWORD) {
      return fail(503, { message: "ADMIN_PASSWORD is not configured." });
    }

    if (password !== platform.env.ADMIN_PASSWORD) {
      return fail(401, { message: "Incorrect admin password." });
    }

    await setAdminSession(cookies, platform.env);
    throw redirect(303, "/");
  }
};
