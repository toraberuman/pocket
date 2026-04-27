import { stringify } from "csv-stringify/sync";
import type { TripDetail } from "$lib/types";

export async function exportTripCsvToDrive(trip: TripDetail, env?: Env) {
  if (!env?.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY || !env.GOOGLE_DRIVE_FOLDER_ID) {
    return {
      skipped: true,
      reason: "Drive credentials are not configured.",
      csv: buildTripCsv(trip)
    };
  }

  const accessToken = await getServiceAccountAccessToken(env);
  const csv = buildTripCsv(trip);
  const metadata = {
    name: `${trip.slug}.csv`,
    parents: [env.GOOGLE_DRIVE_FOLDER_ID],
    mimeType: "text/csv"
  };

  const boundary = "pocket-trip-upload";
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    "Content-Type: text/csv",
    "",
    csv,
    `--${boundary}--`
  ].join("\r\n");

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": `multipart/related; boundary=${boundary}`
      },
      body
    }
  );

  if (!response.ok) {
    throw new Error(`Drive export failed: ${response.status}`);
  }

  return {
    skipped: false,
    csv,
    file: await response.json()
  };
}

export function buildTripCsv(trip: TripDetail) {
  const columns = [
    "開始日期",
    "類別",
    "開始時間",
    "結束時間",
    "地點",
    "原文名稱",
    "地址",
    "電話",
    "網站",
    "google maps",
    "預約",
    "刷卡",
    "花費",
    "備註"
  ];

  const rows = trip.items.map((item) => [
    item.dayDate,
    item.category,
    item.startTime || "",
    item.endTime || "",
    item.place.name,
    item.place.nativeName || "",
    item.place.address || "",
    item.place.phone || "",
    item.place.websiteUrl || "",
    item.place.mapsUrl || "",
    item.reservationStatus || "",
    item.paymentMethod || "",
    item.amount ? `${item.currency || ""} ${item.amount}` : "",
    item.notes || ""
  ]);

  return stringify([columns, ...rows]);
}

async function getServiceAccountAccessToken(env: Env) {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: env.GOOGLE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const encoder = new TextEncoder();
  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claimSet))}`;
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(env.GOOGLE_PRIVATE_KEY),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    encoder.encode(unsignedToken)
  );
  const jwt = `${unsignedToken}.${base64Url(signature)}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  if (!response.ok) {
    throw new Error(`Google auth failed: ${response.status}`);
  }

  const json = (await response.json()) as { access_token: string };
  return json.access_token;
}

function base64Url(value: string | ArrayBuffer) {
  const bytes =
    typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToArrayBuffer(pem: string) {
  const cleaned = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}
