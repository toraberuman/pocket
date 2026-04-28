import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const config = await readTripConfig(options.slug);
  const csvPath = path.join(rootDir, "data", `${config.slug}.csv`);
  const csvText = await fs.readFile(csvPath, "utf8");
  const rows = parseCsv(csvText).filter((row) => !["大圖", "天氣", "info"].includes(categoryOf(row)));
  const trip = buildTrip(config, rows);
  const chunks = buildImportSqlChunks(trip);

  if (options.printSql) {
    process.stdout.write(chunks.join("\n\n"));
    return;
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `pocket-trip-import-${config.slug}-`));

  try {
    for (let index = 0; index < chunks.length; index += 1) {
      const tempFile = path.join(tempDir, `${String(index + 1).padStart(3, "0")}.sql`);
      await fs.writeFile(tempFile, chunks[index], "utf8");
      runWrangler(options, tempFile);
    }
    process.stdout.write(`Imported ${trip.items.length} items for ${config.slug} into ${options.remote ? "remote" : "local"} D1.\n`);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

function parseArgs(args) {
  const options = {
    slug: "2026korea",
    database: "pocket_trips",
    local: false,
    remote: false,
    printSql: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];

    if (current === "--local") {
      options.local = true;
      continue;
    }
    if (current === "--remote") {
      options.remote = true;
      continue;
    }
    if (current === "--print-sql") {
      options.printSql = true;
      continue;
    }
    if (current === "--db" && args[index + 1]) {
      options.database = args[index + 1];
      index += 1;
      continue;
    }
    if (!current.startsWith("--")) {
      options.slug = current;
    }
  }

  if (!options.local && !options.remote && !options.printSql) {
    options.local = true;
  }

  return options;
}

async function readTripConfig(slug) {
  const configPath = path.join(rootDir, "trips.config.json");
  const raw = JSON.parse(await fs.readFile(configPath, "utf8"));
  const found = raw.find((entry) => entry.slug === slug);
  if (!found) {
    throw new Error(`Trip config not found for slug "${slug}".`);
  }
  return found;
}

function buildTrip(config, rows) {
  const dates = rows
    .map((row) => row["開始日期"])
    .filter(Boolean)
    .sort();

  const tripId = `trip:${config.slug}`;
  const places = [];
  const items = rows.map((row, index) => {
    const placeId = `place:${config.slug}:${index}`;
    const amount = parseMoney(row["花費"]);
    const notes = [row["備註"], row["說明"]].filter(Boolean).join("\n") || undefined;
    const detailJson = toDetailJson(row, notes);

    places.push({
      id: placeId,
      googlePlaceId: null,
      mapsUrl: row["google maps"] || null,
      name: firstLine(row["地點"]) || `Place ${index + 1}`,
      nativeName: row["原文名稱"] || null,
      phone: row["電話"] || null,
      address: row["地址"] || null,
      websiteUrl: row["網站"] || null,
      reservationUrl: null,
      lat: null,
      lng: null,
      rawPayloadJson: JSON.stringify(row)
    });

    return {
      id: `item:${config.slug}:${index}`,
      tripId,
      placeId,
      dayDate: row["開始日期"] || "",
      startTime: row["開始時間"] || null,
      endTime: row["結束時間"] || null,
      category: normalizeCategory(row["類別"]),
      reservationStatus: row["預約"] || null,
      paymentMethod: inferPaymentMethod(row) || null,
      cardLabel: row["刷卡銀行"] || null,
      amount: amount?.value ?? null,
      currency: amount?.currency || inferCurrency(row) || null,
      notes: notes || null,
      detailJson: detailJson ? JSON.stringify(detailJson) : null
    };
  });

  return {
    id: tripId,
    slug: config.slug,
    title: config.title,
    destination: config.destination,
    startDate: dates[0] || "",
    endDate: dates[dates.length - 1] || dates[0] || "",
    travelerCount: config.travelers || 1,
    coverImageUrl:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1600&q=80",
    notesJson: JSON.stringify(["由 CSV 匯入 D1", "可重新執行 import script 覆蓋同步"]),
    places,
    items
  };
}

function buildImportSqlChunks(trip) {
  const prelude = [
    `delete from trip_items where trip_id = ${sqlString(trip.id)};`,
    `delete from places where id like ${sqlString(`place:${trip.slug}:%`)};`,
    `delete from trips where slug = ${sqlString(trip.slug)};`,
    `insert into trips (
      id, slug, title, destination, start_date, end_date, traveler_count, cover_image_url, notes_json
    ) values (
      ${sqlString(trip.id)},
      ${sqlString(trip.slug)},
      ${sqlString(trip.title)},
      ${sqlString(trip.destination)},
      ${sqlString(trip.startDate)},
      ${sqlString(trip.endDate)},
      ${trip.travelerCount},
      ${sqlString(trip.coverImageUrl)},
      ${sqlString(trip.notesJson)}
    );`
  ];

  const placeStatements = [];
  for (const place of trip.places) {
    placeStatements.push(
      `insert into places (
        id, google_place_id, maps_url, name, native_name, phone, address, website_url, reservation_url, lat, lng, raw_payload_json
      ) values (
        ${sqlString(place.id)},
        ${sqlString(place.googlePlaceId)},
        ${sqlString(place.mapsUrl)},
        ${sqlString(place.name)},
        ${sqlString(place.nativeName)},
        ${sqlString(place.phone)},
        ${sqlString(place.address)},
        ${sqlString(place.websiteUrl)},
        ${sqlString(place.reservationUrl)},
        ${sqlNumber(place.lat)},
        ${sqlNumber(place.lng)},
        ${sqlString(place.rawPayloadJson)}
      );`
    );
  }

  const itemStatements = [];
  for (const item of trip.items) {
    itemStatements.push(
      `insert into trip_items (
        id, trip_id, place_id, day_date, start_time, end_time, category, reservation_status, payment_method, card_label, amount, currency, notes, detail_json
      ) values (
        ${sqlString(item.id)},
        ${sqlString(item.tripId)},
        ${sqlString(item.placeId)},
        ${sqlString(item.dayDate)},
        ${sqlString(item.startTime)},
        ${sqlString(item.endTime)},
        ${sqlString(item.category)},
        ${sqlString(item.reservationStatus)},
        ${sqlString(item.paymentMethod)},
        ${sqlString(item.cardLabel)},
        ${sqlNumber(item.amount)},
        ${sqlString(item.currency)},
        ${sqlString(item.notes)},
        ${sqlString(item.detailJson)}
      );`
    );
  }

  return [
    wrapTransaction(prelude),
    ...chunkStatements(placeStatements, 20),
    ...chunkStatements(itemStatements, 20)
  ];
}

function chunkStatements(statements, size) {
  const chunks = [];

  for (let index = 0; index < statements.length; index += size) {
    chunks.push(wrapTransaction(statements.slice(index, index + size)));
  }

  return chunks;
}

function wrapTransaction(statements) {
  return `${["pragma foreign_keys = on;", ...statements].join("\n")}\n`;
}

function runWrangler(options, tempFile) {
  const args = ["wrangler", "d1", "execute", options.database, "--file", tempFile];
  args.push(options.remote ? "--remote" : "--local");

  if (process.platform === "win32") {
    execFileSync("cmd.exe", ["/c", "npx", ...args], {
      cwd: rootDir,
      stdio: "inherit",
      shell: false
    });
    return;
  }

  execFileSync("npx", args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: false
  });
}

function sqlString(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "null";
}

function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (insideQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      insideQuotes = true;
      continue;
    }

    if (char === ",") {
      currentRow.push(value);
      value = "";
      continue;
    }

    if (char === "\n") {
      currentRow.push(value.replace(/\r$/, ""));
      rows.push(currentRow);
      currentRow = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length || currentRow.length) {
    currentRow.push(value.replace(/\r$/, ""));
    rows.push(currentRow);
  }

  const [headers, ...records] = rows;
  return records
    .filter((record) => record.some((cell) => cell.trim()))
    .map((record) =>
      Object.fromEntries(headers.map((header, index) => [header.trim(), (record[index] || "").trim()]))
    );
}

function parseMoney(input) {
  if (!input) return null;
  const currency = input.includes("₩") ? "KRW" : input.includes("¥") ? "JPY" : input.includes("$") ? "TWD" : "";
  const value = Number(input.replace(/[^\d.-]/g, ""));
  if (Number.isNaN(value)) return null;
  return { currency, value };
}

function inferCurrency(row) {
  return parseMoney(row["花費"])?.currency || parseMoney(row["刷卡"])?.currency || parseMoney(row["現金"])?.currency || "KRW";
}

function inferPaymentMethod(row) {
  if (row["刷卡"]) return "刷卡";
  if (row["現金"]) return "現金";
  if (row["交通卡"]) return "交通卡";
  return undefined;
}

function categoryOf(row) {
  return normalizeCategory(row["類別"]);
}

function normalizeCategory(value) {
  const normalized = (value || "").trim();
  if (normalized === "桜") return "櫻花";
  if (normalized === "紅葉") return "紅葉";
  if (!normalized) return "其他";
  return normalized;
}

function firstLine(value) {
  return (value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
}

function firstNonEmptyField(row, keys) {
  return keys.map((key) => row[key]?.trim()).find(Boolean);
}

function extractRoomField(block, label) {
  const line = (block || "")
    .split(/\r?\n/)
    .find((item) => item.trim().startsWith(`${label}:`));
  return line?.split(":").slice(1).join(":").trim();
}

function toDetailJson(row, notes) {
  const category = categoryOf(row);
  const detail = {};
  const orderItems = parseLineItems(row["說明"]);
  const imageUrl = firstNonEmptyField(row, ["圖片", "image", "Image", "photo", "封面圖", "照片"]);

  if (row["說明"]) {
    detail.description = row["說明"];
  }

  if (imageUrl) {
    detail.imageUrl = imageUrl;
  }

  if (orderItems.length) {
    detail.orderItems = orderItems;
  }

  if (category === "住宿") {
    detail.roomType = extractRoomField(row["房型資訊"], "房型") || row["房型資訊"] || "";
    detail.roomInfo = row["房型資訊"] || "";
    detail.meals = row["住宿餐食"] || "";
    detail.checkIn = "16:00";
    detail.checkOut = "12:00";
  }

  if (category === "交通") {
    Object.assign(detail, parseTransportDetail(row, notes));
  }

  return Object.keys(detail).length ? detail : undefined;
}

function parseTransportDetail(row, notes) {
  const title = row["地點"] || "";
  const noteFields = parseStructuredNotes(notes);
  const lines = title
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const mainLine = lines[0] || "";
  const routeLine =
    lines.find((line) => /\d{1,2}:\d{2}.*(?:-|–|—|→).*\d{1,2}:\d{2}/.test(line)) ||
    lines.find((line) => /(?:-|–|—|→| to )/i.test(line) && line !== mainLine) ||
    lines[1] ||
    "";
  const subtype = normalizeTransportSubtype(row["子類別"]);
  const baseDetail = {
    mode: subtype || inferTransportMode(mainLine, routeLine),
    transportSubtype: subtype || undefined,
    durationText: row["交通時間"] || undefined,
    distanceKm: parseNumber(row["距離(km)"]) ?? undefined
  };

  if (baseDetail.mode === "flight") {
    return {
      ...baseDetail,
      ...parseFlightDetail(mainLine, routeLine, row, noteFields)
    };
  }

  if (baseDetail.mode === "train") {
    return {
      ...baseDetail,
      ...parseTrainDetail(mainLine, routeLine, noteFields)
    };
  }

  if (baseDetail.mode === "taxi") {
    return {
      ...baseDetail,
      ...parseTaxiDetail(lines, noteFields)
    };
  }

  if (baseDetail.mode === "transfer" || baseDetail.mode === "charter") {
    return {
      ...baseDetail,
      ...parseTransferDetail(lines, noteFields)
    };
  }

  if (baseDetail.mode === "metro") {
    return {
      ...baseDetail,
      ...parseMetroDetail(lines)
    };
  }

  return {
    ...baseDetail,
    routeText: routeLine || mainLine
  };
}

function inferTransportMode(mainLine, routeLine) {
  const haystack = `${mainLine}\n${routeLine}`;

  if (/[A-Z]{3}.*\d{1,2}:\d{2}.*[A-Z]{3}/.test(haystack) || /航空|Air/.test(mainLine)) return "flight";
  if (/(KTX|ITX|SRT|火車|列車|車廂)/i.test(haystack)) return "train";
  if (/(Uber|UBER|KAKAO T|Taxi|計程車)/i.test(haystack)) return "taxi";
  if (/包車/.test(haystack)) return "charter";
  if (/接送|接駁/.test(haystack)) return "transfer";
  if (/地鐵|捷運|subway/i.test(haystack)) return "metro";
  return "other";
}

function normalizeTransportSubtype(value) {
  const compact = (value || "").trim().toLowerCase();
  const aliases = {
    航班: "flight",
    飛機: "flight",
    flight: "flight",
    火車: "train",
    高鐵: "train",
    train: "train",
    計程車: "taxi",
    taxi: "taxi",
    uber: "taxi",
    kakao: "taxi",
    開車: "drive",
    drive: "drive",
    包車: "charter",
    charter: "charter",
    接送: "transfer",
    transfer: "transfer",
    步行: "walk",
    walk: "walk",
    地鐵: "metro",
    捷運: "metro",
    metro: "metro"
  };

  return aliases[compact] || aliases[(value || "").trim()] || "";
}

function parseFlightDetail(mainLine, routeLine, row, noteFields) {
  const headerMatch = mainLine.match(/(.+?)\s+([A-Z]{2}\d{2,4})$/);
  const routeMatch =
    routeLine.match(/([A-Z]{3})([^0-9]*?)\s+(\d{1,2}:\d{2})\s*-\s*([A-Z]{3})([^0-9]*?)\s+(\d{1,2}:\d{2})/) ||
    routeLine.match(/([A-Z]{3})(.+?)\s+(\d{1,2}:\d{2})\s*-\s*([A-Z]{3})(.+?)\s+(\d{1,2}:\d{2})/);

  return {
    provider: headerMatch?.[1]?.trim() || mainLine,
    flightNumber: headerMatch?.[2]?.trim() || noteFields.flightNumber,
    fromCode: routeMatch?.[1]?.trim(),
    fromName: routeMatch?.[2]?.trim() || undefined,
    fromTime: routeMatch?.[3]?.trim() || row["開始時間"] || undefined,
    toCode: routeMatch?.[4]?.trim(),
    toName: routeMatch?.[5]?.trim() || row["原文名稱"] || undefined,
    toTime: routeMatch?.[6]?.trim() || row["結束時間"] || undefined,
    fromTerminal: noteFields.originTerminal || noteFields.departureTerminal || noteFields.fromTerminal,
    toTerminal: noteFields.destinationTerminal || noteFields.arrivalTerminal || noteFields.toTerminal
  };
}

function parseTrainDetail(mainLine, routeLine, noteFields) {
  const headerMatch = mainLine.match(/((?:KTX(?:-EUM)?|ITX-[A-Z]+|SRT)\s*\d+)\s*(.*)$/i);
  const routeMatch = routeLine.match(/(.+?)\s+(\d{1,2}:\d{2})\s*-\s*(.+?)\s+(\d{1,2}:\d{2})/);

  return {
    provider: headerMatch?.[1]?.split(/\s+/)[0],
    trainNumber: noteFields.trainNumber || noteFields.trainNo || headerMatch?.[1]?.trim(),
    cabinClass: noteFields.cabinClass || noteFields.class || headerMatch?.[2]?.trim() || undefined,
    fromName: routeMatch?.[1]?.trim(),
    fromTime: routeMatch?.[2]?.trim(),
    toName: routeMatch?.[3]?.trim(),
    toTime: routeMatch?.[4]?.trim(),
    seat: noteFields.seat || noteFields.seats,
    car: noteFields.car || noteFields.coach,
    platform: noteFields.platform
  };
}

function parseTaxiDetail(lines, noteFields) {
  const line = lines.join(" ");
  const providerMatch = line.match(/(KAKAO T|UBER|Uber|Taxi|計程車)/i);
  const routeText = line
    .replace(/^(KAKAO T|UBER|Uber)\s*(Taxi|計程車)?\s*/i, "")
    .replace(/^(請飯店叫計程車)\s*/i, "");
  const route = parseRoutePair(routeText);

  return {
    provider: noteFields.provider || normalizeTaxiProvider(providerMatch?.[1] || "計程車"),
    fromName: noteFields.from || route.from,
    toName: noteFields.to || route.to,
    vehicle: noteFields.vehicle
  };
}

function parseTransferDetail(lines, noteFields) {
  const routeSource = lines.slice(1).join(" ") || lines[0] || "";
  const route = parseRoutePair(routeSource);

  return {
    provider: noteFields.provider || lines[0],
    fromName: noteFields.from || route.from,
    toName: noteFields.to || route.to,
    vehicle: noteFields.vehicle || firstLine(noteFields.carType || noteFields.car || noteFields.vehicleType)
  };
}

function parseMetroDetail(lines) {
  const route = parseRoutePair(lines.join(" "));
  return {
    provider: "地鐵",
    fromName: route.from,
    toName: route.to
  };
}

function parseRoutePair(value) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const match =
    normalized.match(/(.+?)\s*(?:-|–|—|→| to )\s*(.+)/i) ||
    normalized.match(/(.+?)\s*回\s*(.+)/);

  return {
    from: match?.[1]?.replace(/^\*+/g, "").trim() || undefined,
    to: match?.[2]?.trim() || undefined
  };
}

function parseStructuredNotes(notes) {
  const fields = {};

  for (const line of (notes || "").split(/\r?\n/)) {
    const match = line.match(/^\s*([^:：]+)\s*[:：]\s*(.+)\s*$/);
    if (!match) continue;
    const key = normalizeNoteKey(match[1]);
    if (!key) continue;
    fields[key] = match[2].trim();
  }

  return fields;
}

function normalizeNoteKey(key) {
  const compact = key.trim().toLowerCase().replace(/\s+/g, "");
  const aliases = {
    出發航廈: "originTerminal",
    起飛航廈: "originTerminal",
    departureterminal: "originTerminal",
    fromterminal: "fromTerminal",
    抵達航廈: "destinationTerminal",
    到達航廈: "destinationTerminal",
    arrivalterminal: "destinationTerminal",
    toterminal: "toTerminal",
    航班: "flightNumber",
    flightnumber: "flightNumber",
    車次: "trainNumber",
    trainno: "trainNumber",
    trainnumber: "trainNumber",
    座位: "seat",
    seats: "seat",
    seat: "seat",
    車廂: "car",
    car: "car",
    coach: "car",
    月台: "platform",
    platform: "platform",
    車廂等級: "cabinClass",
    艙等: "cabinClass",
    class: "cabinClass",
    叫車平台: "provider",
    平台: "provider",
    provider: "provider",
    出發地: "from",
    起點: "from",
    from: "from",
    目的地: "to",
    終點: "to",
    to: "to",
    車型: "vehicle",
    vehicle: "vehicle",
    車種: "vehicle"
  };

  return aliases[compact] || aliases[key.trim()] || "";
}

function normalizeTaxiProvider(value) {
  if (/kakao/i.test(value)) return "KAKAO T";
  if (/uber/i.test(value)) return "Uber";
  return value;
}

function parseNumber(value) {
  if (!value) return null;
  const parsed = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isNaN(parsed) ? null : parsed;
}

function parseLineItems(description) {
  if (!description) return [];

  return description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseLineItem)
    .filter(Boolean);
}

function parseLineItem(line) {
  const byPipe = splitStructuredLine(line);
  if (byPipe) return byPipe;

  const priceMatch = line.match(/(₩|¥|\$)\s*[\d,]+(?:\.\d+)?/);
  const quantityMatch = line.match(/(?:x|X|＊|\*)\s*(\d+(?:\.\d+)?)/);
  if (!priceMatch) return null;

  const unitPrice = parseMoney(priceMatch[0]);
  const quantity = quantityMatch ? Number(quantityMatch[1]) : 1;
  const subtotal = unitPrice ? unitPrice.value * quantity : undefined;
  const label = line
    .replace(priceMatch[0], "")
    .replace(quantityMatch?.[0] || "", "")
    .replace(/[()（）]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!label) return null;

  return {
    name: label,
    unitPrice: unitPrice?.value,
    currency: unitPrice?.currency,
    quantity,
    subtotal
  };
}

function splitStructuredLine(line) {
  const delimiter = line.includes("|") ? "|" : line.includes("\t") ? "\t" : hasEnoughCommaFields(line) ? "," : "";
  if (!delimiter) return null;

  const parts = line
    .split(delimiter === "," ? /[,，]/ : delimiter)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 3) return null;

  const quantityText = parts[3] || parts[parts.length - 1];
  const priceText = parts[2] || "";
  const quantity = Number((quantityText.match(/(\d+(?:\.\d+)?)/)?.[1] || "1"));
  const unitPrice = parseMoney(priceText);
  if (!unitPrice) return null;

  return {
    name: parts[0],
    nativeName: parts[1] || undefined,
    unitPrice: unitPrice.value,
    currency: unitPrice.currency,
    quantity,
    subtotal: unitPrice.value * quantity
  };
}

function hasEnoughCommaFields(line) {
  return line.split(/[,，]/).filter(Boolean).length >= 3;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
