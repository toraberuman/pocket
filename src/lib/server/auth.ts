import type { Cookies } from "@sveltejs/kit";

const ADMIN_COOKIE = "pocket_admin";

function tripCookie(kind: "view" | "edit", slug: string) {
  return `trip_${kind}_${slug}`;
}

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassword(password: string) {
  return sha256(password.trim());
}

export async function verifyPassword(password: string, hashed?: string | null) {
  if (!hashed) return !password.trim();
  return (await sha256(password)) === hashed;
}

export async function adminToken(secret: string) {
  return sha256(`admin:${secret}`);
}

export async function isAdmin(cookies: Cookies, env?: Env) {
  if (!env?.ADMIN_PASSWORD) return false;
  const current = cookies.get(ADMIN_COOKIE);
  return current === (await adminToken(env.ADMIN_PASSWORD));
}

export async function setAdminSession(cookies: Cookies, env: Env) {
  if (!env.ADMIN_PASSWORD) throw new Error("ADMIN_PASSWORD is not configured.");
  cookies.set(ADMIN_COOKIE, await adminToken(env.ADMIN_PASSWORD), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 12
  });
}

export function clearAdminSession(cookies: Cookies) {
  cookies.delete(ADMIN_COOKIE, { path: "/" });
}

export function hasTripAccess(cookies: Cookies, slug: string, kind: "view" | "edit") {
  return cookies.get(tripCookie(kind, slug)) === "1";
}

export function setTripAccess(cookies: Cookies, slug: string, kind: "view" | "edit") {
  cookies.set(tripCookie(kind, slug), "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 12
  });
}

export function clearTripAccess(cookies: Cookies, slug: string, kind?: "view" | "edit") {
  if (kind) {
    cookies.delete(tripCookie(kind, slug), { path: "/" });
    return;
  }

  cookies.delete(tripCookie("view", slug), { path: "/" });
  cookies.delete(tripCookie("edit", slug), { path: "/" });
}
