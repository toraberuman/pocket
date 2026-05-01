export type ResolveFlightInput = {
  flightNumber?: unknown;
  flightDate?: unknown;
};

export type ResolvedFlight = {
  detail: Record<string, string>;
  startTime?: string;
  endTime?: string;
  placeName?: string;
  nativeName?: string;
};

type AeroDataBoxFlight = {
  airline?: {
    name?: string;
    iata?: string;
    icao?: string;
  };
  flight?: {
    number?: string;
    iataNumber?: string;
    icaoNumber?: string;
  };
  departure?: {
    airport?: {
      name?: string;
      iata?: string;
      icao?: string;
      shortName?: string;
    };
    scheduledTime?: {
      local?: string;
      utc?: string;
    };
    revisedTime?: {
      local?: string;
      utc?: string;
    };
    terminal?: string;
    gate?: string;
  };
  arrival?: {
    airport?: {
      name?: string;
      iata?: string;
      icao?: string;
      shortName?: string;
    };
    scheduledTime?: {
      local?: string;
      utc?: string;
    };
    revisedTime?: {
      local?: string;
      utc?: string;
    };
    terminal?: string;
    gate?: string;
  };
  status?: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeFlightNumber(value: unknown) {
  return text(value).toUpperCase().replace(/\s+/g, "");
}

function normalizeDate(value: unknown) {
  const date = text(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

function timeFromLocal(value: string | undefined) {
  if (!value) return undefined;
  const match = value.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : undefined;
}

function assign(target: Record<string, string>, key: string, value: unknown) {
  const normalized = text(value);
  if (normalized) target[key] = normalized;
}

function pickFlight(flights: AeroDataBoxFlight[], flightNumber: string) {
  return (
    flights.find((flight) => flight.flight?.iataNumber?.toUpperCase() === flightNumber) ||
    flights.find((flight) => flight.flight?.number?.toUpperCase() === flightNumber.replace(/^[A-Z]{2}/, "")) ||
    flights[0]
  );
}

export async function resolveFlight(input: ResolveFlightInput, env?: Env): Promise<ResolvedFlight> {
  const flightNumber = normalizeFlightNumber(input.flightNumber);
  const flightDate = normalizeDate(input.flightDate);

  if (!flightNumber || !flightDate) {
    throw new Error("Flight date and flight number are required.");
  }

  const apiKey = env?.AERODATABOX_API_KEY;
  if (!apiKey) {
    throw new Error("AERODATABOX_API_KEY is not configured.");
  }

  const apiHost = env?.AERODATABOX_API_HOST || "aerodatabox.p.rapidapi.com";
  const apiKeyHeader = env?.AERODATABOX_API_KEY_HEADER || "X-RapidAPI-Key";
  const apiHostHeader = env?.AERODATABOX_API_HOST_HEADER ?? "X-RapidAPI-Host";
  const baseUrl = (env?.AERODATABOX_API_BASE_URL || `https://${apiHost}`).replace(/\/$/, "");
  const url = new URL(`/flights/number/${encodeURIComponent(flightNumber)}/${flightDate}`, baseUrl);
  url.searchParams.set("dateLocalRole", "Departure");

  const headers = new Headers();
  headers.set(apiKeyHeader, apiKey);
  if (apiHostHeader) {
    headers.set(apiHostHeader, apiHost);
  }

  const response = await fetch(url, {
    headers
  });

  if (!response.ok) {
    const body = await response.text();
    const hint =
      response.status === 401 || response.status === 403
        ? " Check API key, marketplace subscription, host, and key header settings."
        : "";
    throw new Error(`Flight API returned ${response.status}.${hint}${body ? ` ${body.slice(0, 240)}` : ""}`);
  }

  const payload = (await response.json()) as AeroDataBoxFlight[] | { items?: AeroDataBoxFlight[] };
  const flights = Array.isArray(payload) ? payload : payload.items || [];
  const flight = pickFlight(flights, flightNumber);

  if (!flight) {
    throw new Error(`Flight ${flightNumber} was not found on ${flightDate}.`);
  }

  const detail: Record<string, string> = {};
  assign(detail, "flightNumber", flight.flight?.iataNumber || flightNumber);
  assign(detail, "airline", flight.airline?.name);
  assign(detail, "carrierCode", flight.airline?.iata || flight.airline?.icao);
  assign(detail, "fromAirportCode", flight.departure?.airport?.iata || flight.departure?.airport?.icao);
  assign(detail, "fromAirportNameEn", flight.departure?.airport?.name || flight.departure?.airport?.shortName);
  assign(detail, "fromAirportName", flight.departure?.airport?.name || flight.departure?.airport?.shortName);
  assign(detail, "fromTerminal", flight.departure?.terminal);
  assign(detail, "gate", flight.departure?.gate);
  assign(detail, "toAirportCode", flight.arrival?.airport?.iata || flight.arrival?.airport?.icao);
  assign(detail, "toAirportNameEn", flight.arrival?.airport?.name || flight.arrival?.airport?.shortName);
  assign(detail, "toAirportName", flight.arrival?.airport?.name || flight.arrival?.airport?.shortName);
  assign(detail, "toTerminal", flight.arrival?.terminal);
  assign(detail, "arrivalTerminal", flight.arrival?.terminal);
  assign(detail, "arrivalGate", flight.arrival?.gate);
  assign(detail, "scheduledDeparture", flight.departure?.scheduledTime?.local || flight.departure?.scheduledTime?.utc);
  assign(detail, "scheduledArrival", flight.arrival?.scheduledTime?.local || flight.arrival?.scheduledTime?.utc);
  assign(detail, "estimatedDeparture", flight.departure?.revisedTime?.local || flight.departure?.revisedTime?.utc);
  assign(detail, "estimatedArrival", flight.arrival?.revisedTime?.local || flight.arrival?.revisedTime?.utc);
  assign(detail, "status", flight.status);
  assign(detail, "lastSyncedAt", new Date().toISOString());

  const placeName = [detail.airline, detail.flightNumber].filter(Boolean).join(" ");

  return {
    detail,
    startTime: timeFromLocal(detail.scheduledDeparture),
    endTime: timeFromLocal(detail.scheduledArrival),
    placeName: placeName || detail.flightNumber,
    nativeName: detail.airline
  };
}
