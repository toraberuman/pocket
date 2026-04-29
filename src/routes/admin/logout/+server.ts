import { redirect } from "@sveltejs/kit";
import { clearAdminSession } from "$lib/server/auth";

export async function POST({ cookies }) {
  clearAdminSession(cookies);
  throw redirect(303, "/");
}

export async function GET({ cookies }) {
  clearAdminSession(cookies);
  throw redirect(303, "/");
}
