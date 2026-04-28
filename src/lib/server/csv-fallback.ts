import type { PlaceDraft, TripDetail, TripItemDraft, TripSummary } from "$lib/types";
import korea2026Csv from "../../../data/2026korea.csv?raw";

const fallbackTripMeta: Record<string, Omit<TripSummary, "id" | "slug">> = {
  "2026korea": {
    title: "2026.04 韓國賞櫻",
    destination: "South Korea",
    startDate: "2026-03-31",
    endDate: "2026-04-08",
    travelerCount: 4,
    coverImageUrl:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1600&q=80"
  }
};

export async function listTripsFromCsv(): Promise<TripSummary[]> {
  return Object.entries(fallbackTripMeta).map(([slug, meta]) => ({
    id: `fallback-${slug}`,
    slug,
    ...meta
  }));
}

export async function getTripFromCsv(slug: string): Promise<TripDetail | null> {
  const meta = fallbackTripMeta[slug];
  if (!meta) return null;

  const text = csvTextBySlug[slug];
  if (!text) return null;
  const rows = parseCsv(text);
  const items = rows
    .filter((row) => !["大圖", "天氣", "info"].includes(categoryOf(row)))
    .map((row, index) => rowToItem(row, slug, index));

  return {
    id: `fallback-${slug}`,
    slug,
    ...meta,
    notes: ["目前以現有 CSV 資料為準", "先確認展示正確，再做新增與編修"],
    items
  };
}

const csvTextBySlug: Record<string, string> = {
  "2026korea": korea2026Csv
};

function rowToItem(row: Record<string, string>, slug: string, index: number): TripItemDraft {
  const amount = parseMoney(row["花費"]);
  const notes = [row["備註"], row["說明"]].filter(Boolean).join("\n") || undefined;

  return {
    id: `${slug}-${index}`,
    tripId: `fallback-${slug}`,
    dayDate: row["開始日期"] || "",
    startTime: row["開始時間"] || undefined,
    endTime: row["結束時間"] || undefined,
    category: normalizeCategory(row["類別"]) as TripItemDraft["category"],
    reservationStatus: row["預約"] || undefined,
    paymentMethod: inferPaymentMethod(row),
    cardLabel: row["刷卡銀行"] || undefined,
    amount: amount?.value ?? undefined,
    currency: amount?.currency || inferCurrency(row),
    notes,
    detailJson: toDetailJson(row, notes),
    place: toPlace(row, index)
  };
}

function toPlace(row: Record<string, string>, index: number): PlaceDraft {
  return {
    id: `place-${index}`,
    mapsUrl: row["google maps"] || undefined,
    name: firstLine(row["地點"]) || `Place ${index + 1}`,
    nativeName: row["原文名稱"] || undefined,
    phone: row["電話"] || undefined,
    address: row["地址"] || undefined,
    websiteUrl: row["網站"] || undefined
  };
}

function toDetailJson(row: Record<string, string>, notes?: string) {
  const category = categoryOf(row);
  const detail: Record<string, unknown> = {};
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

function parseCsv(text: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
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

function parseMoney(input?: string) {
  if (!input) return null;
  const currency = input.includes("₩") ? "KRW" : input.includes("¥") ? "JPY" : input.includes("$") ? "TWD" : "";
  const value = Number(input.replace(/[^\d.-]/g, ""));
  if (Number.isNaN(value)) return null;
  return { currency, value };
}

function inferCurrency(row: Record<string, string>) {
  return parseMoney(row["花費"])?.currency || parseMoney(row["刷卡"])?.currency || parseMoney(row["現金"])?.currency || "KRW";
}

function inferPaymentMethod(row: Record<string, string>) {
  if (row["刷卡"]) return "刷卡";
  if (row["現金"]) return "現金";
  if (row["交通卡"]) return "交通卡";
  return undefined;
}

function categoryOf(row: Record<string, string>) {
  return normalizeCategory(row["類別"]);
}

function normalizeCategory(value?: string) {
  const normalized = (value || "").trim();

  if (normalized === "桜") return "櫻花";
  if (normalized === "紅葉") return "紅葉";
  if (!normalized) return "其他";

  return normalized;
}

function firstLine(value?: string) {
  return (value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
}

function firstNonEmptyField(row: Record<string, string>, keys: string[]) {
  return keys.map((key) => row[key]?.trim()).find(Boolean);
}

function extractRoomField(block: string | undefined, label: string) {
  const line = (block || "")
    .split(/\r?\n/)
    .find((item) => item.trim().startsWith(`${label}:`));
  return line?.split(":").slice(1).join(":").trim();
}

function parseTransportDetail(row: Record<string, string>, notes?: string) {
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
  const baseDetail: Record<string, unknown> = {
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

function inferTransportMode(mainLine: string, routeLine: string) {
  const haystack = `${mainLine}\n${routeLine}`;

  if (/[A-Z]{3}.*\d{1,2}:\d{2}.*[A-Z]{3}/.test(haystack) || /航空|Air/.test(mainLine)) {
    return "flight";
  }
  if (/(KTX|ITX|SRT|火車|列車|車廂)/i.test(haystack)) {
    return "train";
  }
  if (/(Uber|UBER|KAKAO T|Taxi|計程車)/i.test(haystack)) {
    return "taxi";
  }
  if (/包車/.test(haystack)) {
    return "charter";
  }
  if (/接送|接駁/.test(haystack)) {
    return "transfer";
  }
  if (/地鐵|捷運|subway/i.test(haystack)) {
    return "metro";
  }

  return "other";
}

function normalizeTransportSubtype(value?: string) {
  const compact = (value || "").trim().toLowerCase();
  const aliases: Record<string, string> = {
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

  return aliases[compact] || aliases[value?.trim() || ""] || "";
}

function parseFlightDetail(
  mainLine: string,
  routeLine: string,
  row: Record<string, string>,
  noteFields: Record<string, string>
) {
  const headerMatch = mainLine.match(/(.+?)\s+([A-Z]{2}\d{2,4})$/);
  const routeMatch =
    routeLine.match(/([A-Z]{3})([^0-9]*?)\s+(\d{1,2}:\d{2})\s*-\s*([A-Z]{3})([^0-9]*?)\s+(\d{1,2}:\d{2})/) ||
    routeLine.match(/([A-Z]{3})(.+?)\s+(\d{1,2}:\d{2})\s*-\s*([A-Z]{3})(.+?)\s+(\d{1,2}:\d{2})/);
  const originTerminal = noteFields.originTerminal || noteFields.departureTerminal || noteFields.fromTerminal;
  const destinationTerminal =
    noteFields.destinationTerminal || noteFields.arrivalTerminal || noteFields.toTerminal;

  return {
    provider: headerMatch?.[1]?.trim() || mainLine,
    flightNumber: headerMatch?.[2]?.trim() || noteFields.flightNumber,
    fromCode: routeMatch?.[1]?.trim(),
    fromName: routeMatch?.[2]?.trim() || undefined,
    fromTime: routeMatch?.[3]?.trim() || row["開始時間"] || undefined,
    toCode: routeMatch?.[4]?.trim(),
    toName: routeMatch?.[5]?.trim() || row["原文名稱"] || undefined,
    toTime: routeMatch?.[6]?.trim() || row["結束時間"] || undefined,
    fromTerminal: originTerminal,
    toTerminal: destinationTerminal
  };
}

function parseTrainDetail(mainLine: string, routeLine: string, noteFields: Record<string, string>) {
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

function parseTaxiDetail(lines: string[], noteFields: Record<string, string>) {
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

function parseTransferDetail(lines: string[], noteFields: Record<string, string>) {
  const routeSource = lines.slice(1).join(" ") || lines[0] || "";
  const route = parseRoutePair(routeSource);

  return {
    provider: noteFields.provider || lines[0],
    fromName: noteFields.from || route.from,
    toName: noteFields.to || route.to,
    vehicle: noteFields.vehicle || firstLine(noteFields.carType || noteFields.car || noteFields.vehicleType)
  };
}

function parseMetroDetail(lines: string[]) {
  const route = parseRoutePair(lines.join(" "));
  return {
    provider: "地鐵",
    fromName: route.from,
    toName: route.to
  };
}

function parseRoutePair(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const match =
    normalized.match(/(.+?)\s*(?:-|–|—|→| to )\s*(.+)/i) ||
    normalized.match(/(.+?)\s*回\s*(.+)/);

  return {
    from: match?.[1]?.replace(/^\*+/g, "").trim() || undefined,
    to: match?.[2]?.trim() || undefined
  };
}

function parseStructuredNotes(notes?: string) {
  const fields: Record<string, string> = {};

  for (const line of (notes || "").split(/\r?\n/)) {
    const match = line.match(/^\s*([^:：]+)\s*[:：]\s*(.+)\s*$/);
    if (!match) continue;
    const key = normalizeNoteKey(match[1]);
    if (!key) continue;
    fields[key] = match[2].trim();
  }

  return fields;
}

function normalizeNoteKey(key: string) {
  const compact = key.trim().toLowerCase().replace(/\s+/g, "");
  const aliases: Record<string, string> = {
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

function normalizeTaxiProvider(value: string) {
  if (/kakao/i.test(value)) return "KAKAO T";
  if (/uber/i.test(value)) return "Uber";
  return value;
}

function parseNumber(value?: string) {
  if (!value) return null;
  const parsed = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isNaN(parsed) ? null : parsed;
}

function parseLineItems(description?: string) {
  if (!description) return [];

  return description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseLineItem)
    .filter((item): item is Record<string, unknown> => Boolean(item));
}

function parseLineItem(line: string) {
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

function splitStructuredLine(line: string) {
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

function hasEnoughCommaFields(line: string) {
  return line.split(/[,，]/).filter(Boolean).length >= 3;
}
