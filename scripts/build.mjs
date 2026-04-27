import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(rootDir, "trips.config.json");
const distDir = path.join(rootDir, "dist");
const assetsDir = path.join(distDir, "assets");
const dataDir = path.join(rootDir, "data");

const currencySymbols = {
  KRW: "₩",
  TWD: "$",
  USD: "$",
  JPY: "¥",
  EUR: "€"
};

const categoryMeta = {
  "交通": { tone: "transport", label: "Transport" },
  "住宿": { tone: "stay", label: "Stay" },
  "食": { tone: "food", label: "Food" },
  "餐廳": { tone: "food", label: "Food" },
  "桜": { tone: "seasonal", label: "Sakura" },
  "櫻花": { tone: "seasonal", label: "Sakura" },
  "紅葉": { tone: "seasonal", label: "Foliage" },
  "景點": { tone: "spot", label: "Spot" },
  "買物": { tone: "shop", label: "Shopping" },
  "體驗": { tone: "experience", label: "Experience" },
  "天氣": { tone: "weather", label: "Weather" },
  "大圖": { tone: "hero", label: "Cover" },
  "info": { tone: "info", label: "Info" }
};

const fieldAliases = {
  startDate: ["開始日期"],
  endDate: ["結束日期"],
  weekday: ["曜日"],
  category: ["類別"],
  startTime: ["開始時間"],
  endTime: ["結束時間"],
  reservation: ["預約"],
  location: ["地點"],
  note: ["備註", "說明", "Note"],
  originalName: ["原文名稱"],
  roomInfo: ["房型資訊"],
  stayMeals: ["住宿餐食"],
  address: ["地址"],
  phone: ["電話"],
  website: ["網站"],
  maps: ["google maps", "Google Maps"],
  card: ["刷卡"],
  cardBank: ["刷卡銀行"],
  twdReference: ["台幣換算"],
  cash: ["現金"],
  transitCard: ["交通卡"],
  personal: ["個人"],
  totalCost: ["花費"],
  cancelBy: ["免費取消日"],
  transitDuration: ["交通時間"],
  distanceKm: ["距離(km)"],
  detail: ["detail", "明細"],
  subtype: ["子類別"]
};

async function build() {
  const config = JSON.parse(await fs.readFile(configPath, "utf8"));
  await fs.mkdir(assetsDir, { recursive: true });
  await fs.mkdir(dataDir, { recursive: true });
  await writeAssets();

  const trips = [];
  for (const tripConfig of config) {
    const csvText = await fetchCsv(tripConfig);
    const rows = parseCsv(csvText);
    const trip = createTripModel(tripConfig, rows);
    trips.push(trip);
    await writeTripPage(trip);
  }

  await fs.writeFile(path.join(distDir, "index.html"), renderIndexPage(trips), "utf8");
}

async function writeAssets() {
  await fs.writeFile(path.join(assetsDir, "styles.css"), styles, "utf8");
  await fs.writeFile(path.join(assetsDir, "app.js"), appJs, "utf8");
}

async function fetchCsv(config) {
  const cachePath = path.join(dataDir, `${config.slug}.csv`);

  try {
    const response = await fetch(config.sheetUrl, {
      headers: {
        "user-agent": "trip-planner-pages/0.1"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    await fs.writeFile(cachePath, text, "utf8");
    return text;
  } catch (error) {
    try {
      return await fs.readFile(cachePath, "utf8");
    } catch {
      throw error;
    }
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        value += '"';
        i += 1;
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
      row.push(value);
      value = "";
      continue;
    }

    if (char === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...records] = rows;
  const normalizedHeaders = headers.map((header) => normalizeHeader(header));
  return records
    .filter((record) => record.some((cell) => cell && cell.trim()))
    .map((record) => {
      const rowObject = {};
      for (let index = 0; index < normalizedHeaders.length; index += 1) {
        rowObject[normalizedHeaders[index]] = (record[index] || "").trim();
      }
      return rowObject;
    });
}

function createTripModel(config, rows) {
  const infoRow = rows.find((row) => normalizeCategory(getField(row, "category")) === "info");
  const coverRow = rows.find((row) => normalizeCategory(getField(row, "category")) === "大圖");
  const weatherRows = rows.filter((row) => normalizeCategory(getField(row, "category")) === "天氣");
  const eventRows = rows.filter((row) => !["info", "大圖", "天氣"].includes(normalizeCategory(getField(row, "category"))));

  const events = eventRows.map((row, index) => createEvent(row, index, config.currency));
  const days = groupDays(events, weatherRows);
  const totals = summarizeTotals(events, config.currency);
  const travelers = parseTravelerCount(getField(infoRow, "note")) || config.travelers || 1;
  const coverImage = getField(coverRow, "website") || pickCoverImage(days);
  const title = getField(infoRow, "location") || config.title;
  const notes = parsePipeList(getField(infoRow, "note"));

  return {
    ...config,
    title,
    coverImage,
    notes,
    travelers,
    totals,
    days,
    events,
    weatherRows
  };
}

function createEvent(row, index, defaultCurrency) {
  const category = getField(row, "category") || "其他";
  const subtype = getField(row, "subtype") || "";
  const note = getField(row, "note") || "";
  const money = collectMoney(row, defaultCurrency);
  const detailLines = parseDetail(getField(row, "detail") || "");
  const roomBlocks = parseRoomInfo(getField(row, "roomInfo") || "");
  const title = firstMeaningfulLine(getField(row, "location")) || firstMeaningfulLine(getField(row, "originalName")) || category;
  const rawLocation = getField(row, "location") || "";
  const tags = createTags(row, category, money);

  return {
    id: `${getField(row, "startDate")}-${index}`,
    category,
    subtype,
    tone: categoryMeta[category]?.tone || "default",
    label: categoryMeta[category]?.label || category,
    startDate: getField(row, "startDate"),
    endDate: getField(row, "endDate") || getField(row, "startDate"),
    weekday: getField(row, "weekday"),
    startTime: getField(row, "startTime"),
    endTime: getField(row, "endTime"),
    reservation: getField(row, "reservation"),
    title,
    rawLocation,
    note,
    originalName: getField(row, "originalName"),
    stayMeals: getField(row, "stayMeals"),
    address: getField(row, "address"),
    phone: getField(row, "phone"),
    website: getField(row, "website"),
    maps: getField(row, "maps"),
    cancelBy: getField(row, "cancelBy"),
    transitDuration: getField(row, "transitDuration"),
    distanceKm: getField(row, "distanceKm"),
    roomBlocks,
    detailLines,
    money,
    tags
  };
}

function groupDays(events, weatherRows) {
  const dayMap = new Map();
  for (const event of events) {
    if (!dayMap.has(event.startDate)) {
      dayMap.set(event.startDate, []);
    }
    dayMap.get(event.startDate).push(event);
  }

  return [...dayMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayEvents]) => {
      const sortedEvents = dayEvents.sort(compareEvents);
      const weather = weatherRows.find((row) => getField(row, "startDate") === date);
      const dayTotals = summarizeTotals(sortedEvents, "KRW");
      return {
        date,
        label: formatDateLabel(date, sortedEvents[0]?.weekday),
        weather,
        totals: dayTotals,
        events: sortedEvents
      };
    });
}

function summarizeTotals(events, defaultCurrency) {
  const summary = {
    byPayment: new Map(),
    byCategory: new Map(),
    grand: new Map(),
    reference: new Map()
  };

  for (const event of events) {
    const totalAmount = event.money.find((amount) => amount.type === "Total") || null;
    const paymentAmounts = event.money.filter((amount) =>
      ["Card", "Cash", "Transit", "Personal"].includes(amount.type)
    );
    const referenceAmounts = event.money.filter((amount) => amount.type === "TWD");

    if (totalAmount) {
      increment(summary.grand, totalAmount.currency, totalAmount.value);
      increment(summary.byCategory, `${event.category}|${totalAmount.currency}`, totalAmount.value);
    } else {
      for (const amount of paymentAmounts) {
        increment(summary.grand, amount.currency, amount.value);
        increment(summary.byCategory, `${event.category}|${amount.currency}`, amount.value);
      }
    }

    for (const amount of paymentAmounts) {
      increment(summary.byPayment, `${amount.label}|${amount.currency}`, amount.value);
    }

    for (const amount of referenceAmounts) {
      increment(summary.reference, amount.currency, amount.value);
    }
  }

  return {
    grand: mapToCurrencyList(summary.grand),
    reference: mapToCurrencyList(summary.reference),
    byPayment: mapToDimensionList(summary.byPayment),
    byCategory: mapToDimensionList(summary.byCategory),
    defaultCurrency
  };
}

function collectMoney(row, defaultCurrency) {
  const entries = [
    ["card", "Card", getField(row, "cardBank") ? `Card • ${getField(row, "cardBank")}` : "Card"],
    ["cash", "Cash", "Cash"],
    ["transitCard", "Transit", "Transit card"],
    ["personal", "Personal", "Personal"],
    ["totalCost", "Total", "Total"],
    ["twdReference", "TWD", "TWD"]
  ];

  return entries
    .map(([fieldKey, type, label]) => {
      const parsed = parseMoney(getField(row, fieldKey), defaultCurrency);
      if (!parsed) {
        return null;
      }
      return {
        field: fieldKey,
        type,
        label,
        ...parsed
      };
    })
    .filter(Boolean);
}

function parseMoney(input, defaultCurrency) {
  if (!input) {
    return null;
  }
  const cleaned = input.replace(/\s/g, "");
  const currency = detectCurrency(cleaned) || defaultCurrency;
  const digits = cleaned.replace(/[^\d.-]/g, "");
  if (!digits) {
    return null;
  }
  return {
    currency,
    symbol: currencySymbols[currency] || "",
    value: Number(digits),
    raw: input
  };
}

function detectCurrency(value) {
  if (value.includes("₩")) return "KRW";
  if (value.includes("¥")) return "JPY";
  if (value.includes("€")) return "EUR";
  if (value.includes("$")) return "TWD";
  return null;
}

function parseTravelerCount(note) {
  const match = (note || "").match(/同行人數[:：]\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

function parsePipeList(value) {
  return (value || "")
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseDetail(value) {
  return (value || "")
    .split("|")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(",").map((part) => part.trim()).filter(Boolean));
}

function parseRoomInfo(value) {
  return splitLines(value)
    .reduce((blocks, line) => {
      if (!line.includes(":")) {
        blocks.push({ label: "", value: line });
        return blocks;
      }
      const [label, ...rest] = line.split(":");
      blocks.push({ label: label.trim(), value: rest.join(":").trim() });
      return blocks;
    }, [])
    .filter((entry) => entry.value);
}

function createTags(row, category, money) {
  const tags = [];
  if (getField(row, "reservation")) tags.push(getField(row, "reservation"));
  if ((category === "住宿" || category === "飯店") && getField(row, "stayMeals")) tags.push(getField(row, "stayMeals"));
  if (category === "交通" && getField(row, "transitDuration")) tags.push(getField(row, "transitDuration"));
  const total = money.find((entry) => entry.type === "Total");
  if (total) tags.push(`${total.symbol}${formatNumber(total.value)}`);
  return [...new Set(tags)];
}

function renderIndexPage(trips) {
  return pageTemplate({
    title: "Pocket Trips",
    bodyClass: "landing-page",
    content: `
      <main class="landing-shell">
        <section class="landing-hero">
          <p class="eyebrow">Cloudflare Pages itinerary viewer</p>
          <h1>Pocket Trips</h1>
          <p class="hero-copy">Daily plans, payment notes, hotel details, and transport stitched into a calmer timeline.</p>
        </section>
        <section class="trip-grid">
          ${trips.map((trip) => `
            <a class="trip-card" href="/${trip.slug}/">
              <div class="trip-card-art" style="${backgroundStyle(trip.coverImage)}"></div>
              <div class="trip-card-copy">
                <h2>${escapeHtml(trip.title)}</h2>
                <p>${escapeHtml(trip.destination || "")}</p>
                <span>${trip.days.length} days</span>
              </div>
            </a>
          `).join("")}
        </section>
      </main>
    `
  });
}

async function writeTripPage(trip) {
  const tripDir = path.join(distDir, trip.slug);
  const budgetDir = path.join(tripDir, "budget");
  await fs.mkdir(tripDir, { recursive: true });
  await fs.mkdir(budgetDir, { recursive: true });
  await fs.writeFile(path.join(tripDir, "index.html"), renderTimelinePage(trip), "utf8");
  await fs.writeFile(path.join(budgetDir, "index.html"), renderBudgetPage(trip), "utf8");
}

function renderTimelinePage(trip) {
  const tripRange = `${trip.days[0]?.label || ""} - ${trip.days.at(-1)?.label || ""}`;
  const heroMeta = [
    trip.days[0]?.date || "",
    `${trip.days.length} day itinerary`
  ].filter(Boolean).join("  ·  ");

  return pageTemplate({
    title: trip.title,
    bodyClass: "timeline-page",
    content: `
      <main class="timeline-shell">
        <section class="trip-hero" style="${backgroundStyle(trip.coverImage)}">
          <div class="trip-hero__overlay">
            <div class="trip-hero__topline">
              <div>
                <p class="eyebrow">Travel itinerary</p>
                <h1>${escapeHtml(trip.title)}</h1>
                <p class="trip-hero__meta">${escapeHtml(heroMeta)}</p>
              </div>
              <a class="ghost-link" href="/${trip.slug}/budget/">Budget view</a>
            </div>
            <div class="trip-hero__footer">
              <p>${escapeHtml(tripRange)}</p>
              <div class="chip-row">
                ${trip.notes.slice(0, 3).map((note) => `<span class="chip chip-dark">${escapeHtml(note)}</span>`).join("")}
              </div>
            </div>
          </div>
        </section>

        <section class="day-switcher" data-day-tabs>
          ${trip.days.map((day, index) => renderDayTab(day, index)).join("")}
        </section>

        <section class="timeline-stack">
          ${trip.days.map((day, index) => renderTimelineDay(day, trip, index)).join("")}
        </section>
      </main>

      <section class="modal-layer">
        ${trip.days.flatMap((day) => day.events).map(renderEventModal).join("")}
      </section>
    `
  });
}

function renderBudgetPage(trip) {
  const tripRange = `${trip.days[0]?.label || ""} - ${trip.days.at(-1)?.label || ""}`;
  const summaryChips = [
    `${trip.days.length} days`,
    `${trip.travelers} travelers`,
    ...trip.totals.grand.map((entry) => `${entry.currency} ${entry.formatted}`),
    ...trip.totals.reference.map((entry) => `${entry.currency} ${entry.formatted} ref`)
  ];

  return pageTemplate({
    title: trip.title,
    bodyClass: "budget-page",
    content: `
      <div class="page-shell">
        <aside class="side-rail">
          <a class="brand" href="/${trip.slug}/">Back to itinerary</a>
          <div class="rail-card trip-brief">
            <p class="eyebrow">Trip overview</p>
            <h1>${escapeHtml(trip.title)}</h1>
            <p>${escapeHtml(tripRange)}</p>
            <div class="chip-row">
              ${summaryChips.map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`).join("")}
            </div>
          </div>
          <div class="rail-card">
            <p class="section-title">Trip notes</p>
            <ul class="plain-list">
              ${trip.notes.length ? trip.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("") : "<li>No extra notes</li>"}
            </ul>
          </div>
          <div class="rail-card">
            <p class="section-title">Spend snapshot</p>
            <div class="metric-stack">
              ${trip.totals.grand.map(renderMetric).join("")}
            </div>
          </div>
          <nav class="rail-card day-nav">
            <p class="section-title">Days</p>
            ${trip.days.map((day, index) => `<a href="#day-${index + 1}">${escapeHtml(day.label)}</a>`).join("")}
          </nav>
        </aside>
        <main class="content-pane">
          <section class="hero-panel" style="${backgroundStyle(trip.coverImage)}">
            <div class="hero-overlay">
              <p class="eyebrow">Route /${trip.slug}</p>
              <h2>${escapeHtml(trip.destination || trip.title)}</h2>
              <p>${escapeHtml(tripRange)}</p>
            </div>
          </section>
          <section class="stats-panel">
            <div class="toolbar">
              <div class="filter-group" data-filter-group="category">
                <button class="filter-pill is-active" data-filter="all">All</button>
                ${renderCategoryPills(trip.events)}
              </div>
            </div>
            <div class="stats-grid">
              <article class="stat-card">
                <p class="section-title">Payment mix</p>
                <div class="metric-stack">
                  ${trip.totals.byPayment.map(renderDimensionMetric).join("")}
                </div>
              </article>
              <article class="stat-card">
                <p class="section-title">By category</p>
                <div class="metric-stack">
                  ${trip.totals.byCategory.map(renderDimensionMetric).join("")}
                </div>
              </article>
            </div>
          </section>
          ${trip.days.map(renderDaySection).join("")}
        </main>
      </div>
    `
  });
}

function renderDayTab(day, index) {
  const parsed = new Date(`${day.date}T00:00:00`);
  const dateNumber = Number.isNaN(parsed.getTime()) ? day.date : String(parsed.getDate());
  const weekday = splitDayLabel(day.label).weekday;
  return `
    <button class="day-pill ${index === 0 ? "is-active" : ""}" data-day-tab="${escapeAttr(day.date)}">
      <small>${escapeHtml(shortWeekday(weekday))}</small>
      <strong>${escapeHtml(dateNumber)}</strong>
    </button>
  `;
}

function renderTimelineDay(day, trip, index) {
  return `
    <section class="timeline-day ${index === 0 ? "is-active" : ""}" data-day-pane="${escapeAttr(day.date)}" ${index === 0 ? "" : "hidden"}>
      <div class="timeline-day__header">
        <div>
          <p class="eyebrow">Day ${index + 1}</p>
          <h2>${escapeHtml(day.label)}</h2>
        </div>
        <div class="timeline-day__actions">
          ${day.weather ? `<span class="weather-inline">${escapeHtml(getField(day.weather, "location") || "")}</span>` : ""}
          <a class="ghost-link ghost-link--light" href="/${trip.slug}/budget/#day-${index + 1}">Open budget details</a>
        </div>
      </div>
      <div class="timeline-rail">
        ${day.events.map(renderTimelineEvent).join("")}
      </div>
    </section>
  `;
}

function renderTimelineEvent(event) {
  const amount = findDisplayAmount(event);
  const summary = summarizeEvent(event);
  return `
    <article class="timeline-item tone-${escapeAttr(event.tone)}" data-category="${escapeAttr(event.category)}">
      <div class="timeline-item__time">
        <span>${escapeHtml(event.startTime || "All day")}</span>
        ${event.endTime ? `<small>${escapeHtml(event.endTime)}</small>` : ""}
      </div>
      <div class="timeline-item__dot"></div>
      <button class="timeline-card" type="button" data-modal-open="${escapeAttr(event.id)}">
        <div class="timeline-card__head">
          <div class="chip-row">
            <span class="chip chip-soft">${escapeHtml(event.category)}</span>
            ${event.reservation ? `<span class="chip chip-soft chip-reserve">${escapeHtml(event.reservation)}</span>` : ""}
          </div>
          ${amount ? `<div class="timeline-card__price">${escapeHtml(amount.symbol)}${escapeHtml(formatNumber(amount.value))}${amount.currency === "TWD" ? "" : ""}</div>` : ""}
        </div>
        <div class="timeline-card__body">
          <h3>${escapeHtml(summary.title)}</h3>
          ${summary.subtitle ? `<p class="timeline-card__subtitle">${escapeHtml(summary.subtitle)}</p>` : ""}
          ${summary.lines.map((line) => `<p>${renderInlineMarkup(line)}</p>`).join("")}
        </div>
        <div class="timeline-card__footer">
          ${event.website ? `<span>Website</span>` : ""}
          ${event.maps ? `<span>Maps</span>` : ""}
          ${event.phone ? `<span>Call</span>` : ""}
          <span class="timeline-card__open">Details</span>
        </div>
      </button>
    </article>
  `;
}

function renderEventModal(event) {
  const amount = findDisplayAmount(event);
  const titleColorClass = `tone-${escapeAttr(event.tone)}`;
  const rows = buildModalRows(event);
  return `
    <div class="event-modal" data-modal="${escapeAttr(event.id)}" hidden>
      <div class="event-modal__scrim" data-modal-close></div>
      <div class="event-modal__panel ${titleColorClass}">
        <button class="event-modal__close" type="button" data-modal-close aria-label="Close">×</button>
        <div class="event-modal__header">
          <div class="chip-row">
            <span class="chip chip-soft">${escapeHtml(event.category)}</span>
            ${event.reservation ? `<span class="chip chip-soft chip-reserve">${escapeHtml(event.reservation)}</span>` : ""}
          </div>
          <h2>${escapeHtml(event.title)}</h2>
          ${event.originalName ? `<p class="event-modal__sub">${escapeHtml(event.originalName)}</p>` : ""}
          <p class="event-modal__meta">${escapeHtml(event.startDate)}  ${escapeHtml(event.weekday || "")}  ${escapeHtml(formatTimeRange(event.startTime, event.endTime))}</p>
        </div>
        ${renderModalFeature(event)}
        <div class="event-modal__content">
          ${rows.length ? `<div class="detail-list">${rows.map(renderModalRow).join("")}</div>` : ""}
          ${event.detailLines.length ? `<div class="modal-block"><h3>Details</h3><div class="detail-table">${event.detailLines.map((columns) => `<div>${columns.map((column) => `<span>${escapeHtml(column)}</span>`).join("")}</div>`).join("")}</div></div>` : ""}
          ${event.note ? `<div class="modal-block"><h3>Notes</h3><p>${renderLineBreaks(event.note)}</p></div>` : ""}
          ${amount ? `<div class="modal-cost"><span>${escapeHtml(amount.label)}</span><strong>${escapeHtml(amount.symbol)}${escapeHtml(formatNumber(amount.value))}</strong></div>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderModalFeature(event) {
  if (event.tone === "transport") {
    const route = flightRoute(event);
    if (route) {
      return `
        <div class="flight-board">
          <div>
            <small>${escapeHtml(route.leftLabel || "From")}</small>
            <strong>${escapeHtml(route.leftCode)}</strong>
            <span>${escapeHtml(route.leftTime || event.startTime || "")}</span>
          </div>
          <div class="flight-board__line">✈</div>
          <div>
            <small>${escapeHtml(route.rightLabel || "To")}</small>
            <strong>${escapeHtml(route.rightCode)}</strong>
            <span>${escapeHtml(route.rightTime || event.endTime || "")}</span>
          </div>
        </div>
      `;
    }
  }

  if (event.tone === "stay") {
    return `
      <div class="stay-strip">
        <div>
          <small>Check-in</small>
          <strong>16:00</strong>
        </div>
        <div>
          <small>Check-out</small>
          <strong>12:00</strong>
        </div>
      </div>
    `;
  }

  return "";
}

function renderModalRow(row) {
  return `
    <div class="detail-list__row">
      <span>${escapeHtml(row.label)}</span>
      <strong>${row.href ? `<a href="${escapeAttr(row.href)}" target="_blank" rel="noreferrer">${escapeHtml(row.value)}</a>` : renderInlineMarkup(row.value)}</strong>
    </div>
  `;
}

function renderDaySection(day, index) {
  return `
    <section class="day-section" id="day-${index + 1}">
      <div class="day-header">
        <div>
          <p class="eyebrow">Day ${index + 1}</p>
          <h3>${escapeHtml(day.label)}</h3>
        </div>
        <div class="day-summary">
          ${day.totals.grand.map((entry) => `<span>${entry.currency} ${entry.formatted}</span>`).join("")}
        </div>
      </div>
      ${day.weather ? `<div class="weather-card"><strong>Weather spot</strong><span>${escapeHtml(getField(day.weather, "location") || "Not set")}</span></div>` : ""}
      <div class="timeline">
        ${day.events.map(renderEventCard).join("")}
      </div>
    </section>
  `;
}

function renderEventCard(event) {
  const links = [
    event.website ? `<a href="${escapeAttr(event.website)}" target="_blank" rel="noreferrer">Website</a>` : "",
    event.maps ? `<a href="${escapeAttr(event.maps)}" target="_blank" rel="noreferrer">Maps</a>` : "",
    event.phone ? `<a href="tel:${escapeAttr(event.phone)}">${escapeHtml(event.phone)}</a>` : ""
  ].filter(Boolean);

  return `
    <article class="event-card tone-${escapeAttr(event.tone)}" data-category="${escapeAttr(event.category)}">
      <div class="event-time">
        <span>${escapeHtml(formatTimeRange(event.startTime, event.endTime))}</span>
        <small>${escapeHtml(event.label)}</small>
      </div>
      <div class="event-body">
        <div class="event-head">
          <div>
            <h4>${escapeHtml(event.title)}</h4>
            ${event.originalName ? `<p class="subtle">${escapeHtml(event.originalName)}</p>` : ""}
          </div>
          <div class="chip-row">
            ${event.tags.map((tag) => `<span class="chip chip-strong">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </div>
        ${event.rawLocation && event.rawLocation !== event.title ? `<p class="note-block">${renderLineBreaks(event.rawLocation)}</p>` : ""}
        ${event.note ? `<p class="note-block">${renderLineBreaks(event.note)}</p>` : ""}
        ${event.roomBlocks.length ? `
          <div class="detail-grid">
            ${event.roomBlocks.map((block) => `
              <div class="detail-row">
                <span>${escapeHtml(block.label || "Info")}</span>
                <strong>${renderPossibleLink(block.value)}</strong>
              </div>
            `).join("")}
          </div>
        ` : ""}
        ${event.detailLines.length ? `
          <div class="detail-table">
            ${event.detailLines.map((columns) => `<div>${columns.map((column) => `<span>${escapeHtml(column)}</span>`).join("")}</div>`).join("")}
          </div>
        ` : ""}
        ${(event.address || links.length || event.money.length) ? `
          <div class="event-footer">
            <div class="meta-stack">
              ${event.address ? `<p>${escapeHtml(event.address)}</p>` : ""}
              ${links.length ? `<p class="link-row">${links.join("")}</p>` : ""}
            </div>
            <div class="price-stack">
              ${event.money.map((amount) => `<span title="${escapeAttr(amount.label)}">${escapeHtml(amount.label)} ${amount.currency} ${formatNumber(amount.value)}</span>`).join("")}
            </div>
          </div>
        ` : ""}
      </div>
    </article>
  `;
}

function summarizeEvent(event) {
  const lines = [];
  const roomName = event.roomBlocks[0]?.value || "";
  const detailPreview = event.detailLines[0]?.slice(0, 2).join(" · ") || "";
  const locationLines = splitLines(event.rawLocation);
  const noteLines = splitLines(event.note);

  if (event.tone === "transport") {
    const route = flightRoute(event);
    if (route) {
      lines.push(`${route.leftCode} → ${route.rightCode}`);
    } else if (locationLines[1]) {
      lines.push(locationLines[1]);
    } else if (noteLines[0]) {
      lines.push(noteLines[0]);
    }
  } else if (event.tone === "stay") {
    if (roomName) lines.push(roomName);
    if (event.originalName) lines.push(event.originalName);
    if (event.stayMeals) lines.push(event.stayMeals);
  } else if (event.tone === "food") {
    if (event.originalName) lines.push(event.originalName);
    if (locationLines[1]) lines.push(locationLines[1]);
    if (detailPreview) lines.push(detailPreview);
  } else if (event.tone === "shop") {
    if (event.originalName) lines.push(event.originalName);
    if (noteLines[0]) lines.push(noteLines[0]);
  } else {
    if (event.originalName) lines.push(event.originalName);
    if (noteLines[0]) lines.push(noteLines[0]);
    if (locationLines[1]) lines.push(locationLines[1]);
  }

  return {
    title: cleanSummaryTitle(event),
    subtitle: lines.shift() || "",
    lines: [...new Set(lines)].slice(0, 2)
  };
}

function cleanSummaryTitle(event) {
  if (event.tone === "transport") {
    const transportLine = splitLines(event.rawLocation)[0];
    if (transportLine) return transportLine;
  }
  return event.title;
}

function buildModalRows(event) {
  const rows = [];
  const pushRow = (label, value, href = "") => {
    if (!value) return;
    rows.push({ label, value, href });
  };

  pushRow("Address", event.address, event.maps || "");
  pushRow("Phone", event.phone, event.phone ? `tel:${event.phone}` : "");
  pushRow("Website", event.website, event.website);
  pushRow("Google Maps", event.maps, event.maps);
  pushRow("Stay meals", event.stayMeals);
  pushRow("Transit time", event.transitDuration);
  pushRow("Distance", event.distanceKm ? `${event.distanceKm} km` : "");
  pushRow("Cancel by", event.cancelBy);

  for (const block of event.roomBlocks) {
    pushRow(block.label || "Info", block.value, asExternalHref(block.value));
  }

  for (const amount of event.money) {
    pushRow(amount.label, `${amount.symbol}${formatNumber(amount.value)}`);
  }

  return rows;
}

function findDisplayAmount(event) {
  return event.money.find((amount) => amount.type === "Total")
    || event.money.find((amount) => amount.type === "Card")
    || event.money.find((amount) => amount.type === "Cash")
    || event.money[0]
    || null;
}

function flightRoute(event) {
  const lines = [...splitLines(event.rawLocation), ...splitLines(event.note)];
  for (const line of lines) {
    const match = line.match(/([A-Z]{3})[^\d]*(\d{1,2}:\d{2})?\s*[-→]\s*([A-Z]{3})[^\d]*(\d{1,2}:\d{2})?/);
    if (match) {
      return {
        leftCode: match[1],
        leftTime: match[2] || event.startTime || "",
        rightCode: match[3],
        rightTime: match[4] || event.endTime || "",
        leftLabel: splitAirportLabel(line, match[1]),
        rightLabel: splitAirportLabel(line, match[3])
      };
    }
  }
  return null;
}

function splitAirportLabel(line, code) {
  const index = line.indexOf(code);
  if (index === -1) return code;
  return line.slice(index, index + 6).replace(code, "").trim() || code;
}

function splitDayLabel(label) {
  const [datePart, weekday = ""] = String(label).split(" · ");
  return { datePart, weekday };
}

function shortWeekday(label) {
  return String(label || "").slice(0, 3);
}

function asExternalHref(value) {
  return /^https?:\/\//.test(value || "") ? value : "";
}

function renderInlineMarkup(value) {
  if (/^https?:\/\//.test(value || "")) {
    return `<a href="${escapeAttr(value)}" target="_blank" rel="noreferrer">${escapeHtml(value)}</a>`;
  }
  return escapeHtml(value);
}

function renderCategoryPills(events) {
  const seen = new Set();
  const items = [];
  for (const event of events) {
    if (seen.has(event.category)) continue;
    seen.add(event.category);
    items.push(`<button class="filter-pill" data-filter="${escapeAttr(event.category)}">${escapeHtml(event.category)}</button>`);
  }
  return items.join("");
}

function renderMetric(entry) {
  return `
    <div class="metric">
      <span>${entry.currency}</span>
      <strong>${entry.formatted}</strong>
    </div>
  `;
}

function renderDimensionMetric(entry) {
  return `
    <div class="metric metric-inline">
      <span>${escapeHtml(entry.key)}</span>
      <strong>${entry.currency} ${entry.formatted}</strong>
    </div>
  `;
}

function mapToCurrencyList(map) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([currency, value]) => ({
      currency,
      value,
      formatted: formatNumber(value)
    }));
}

function mapToDimensionList(map) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([compoundKey, value]) => {
      const [key, currency] = compoundKey.split("|");
      return {
        key,
        currency,
        value,
        formatted: formatNumber(value)
      };
    });
}

function increment(map, key, amount) {
  map.set(key, (map.get(key) || 0) + amount);
}

function compareEvents(a, b) {
  const timeA = (a.startTime || "99:99").replace(":", "");
  const timeB = (b.startTime || "99:99").replace(":", "");
  if (timeA !== timeB) return timeA.localeCompare(timeB);
  return a.title.localeCompare(b.title);
}

function normalizeCategory(value) {
  return (value || "").trim();
}

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase();
}

function getField(row, fieldKey) {
  if (!row) {
    return "";
  }
  const aliases = fieldAliases[fieldKey] || [fieldKey];
  for (const alias of aliases) {
    const value = row[normalizeHeader(alias)];
    if (value !== undefined && value !== "") {
      return value;
    }
  }
  return "";
}

function firstMeaningfulLine(value) {
  return splitLines(value)[0] || "";
}

function splitLines(value) {
  return (value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatDateLabel(date, weekday) {
  const parsed = new Date(`${date}T00:00:00`);
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  });
  const label = Number.isNaN(parsed.getTime()) ? date : formatter.format(parsed);
  return weekday ? `${label} · ${weekday}` : label;
}

function formatTimeRange(start, end) {
  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  return "Flexible";
}

function pickCoverImage(days) {
  const match = days
    .flatMap((day) => day.events)
    .find((event) => event.website && /\.(png|jpe?g|webp|avif)$/i.test(event.website));
  return match?.website || "";
}

function backgroundStyle(imageUrl) {
  const overlay = "linear-gradient(135deg, rgba(8,19,24,0.82), rgba(12,46,60,0.36))";
  return imageUrl
    ? `background-image:${overlay}, url('${escapeCss(imageUrl)}');`
    : "background: linear-gradient(135deg, #16323f 0%, #264f63 48%, #f0a86c 100%);";
}

function renderPossibleLink(value) {
  if (/^https?:\/\//.test(value)) {
    return `<a href="${escapeAttr(value)}" target="_blank" rel="noreferrer">${escapeHtml(value)}</a>`;
  }
  return escapeHtml(value);
}

function renderLineBreaks(value) {
  return splitLines(value).map((line) => escapeHtml(line)).join("<br>");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function pageTemplate({ title, content, bodyClass }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/styles.css">
  </head>
  <body class="${bodyClass}">
    ${content}
    <script src="/assets/app.js"></script>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function escapeCss(value) {
  return String(value || "").replace(/'/g, "\\'");
}

const appJs = `
const dayTabs = document.querySelector('[data-day-tabs]');
if (dayTabs) {
  dayTabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-day-tab]');
    if (!button) return;
    const day = button.dataset.dayTab;
    dayTabs.querySelectorAll('[data-day-tab]').forEach((item) => item.classList.toggle('is-active', item === button));
    document.querySelectorAll('[data-day-pane]').forEach((pane) => {
      const show = pane.dataset.dayPane === day;
      pane.hidden = !show;
      pane.classList.toggle('is-active', show);
    });
  });
}

const closeModal = (modal) => {
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('modal-open');
};

document.addEventListener('click', (event) => {
  const openButton = event.target.closest('[data-modal-open]');
  if (openButton) {
    const modal = document.querySelector('[data-modal="' + openButton.dataset.modalOpen + '"]');
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    return;
  }

  const closeButton = event.target.closest('[data-modal-close]');
  if (closeButton) {
    closeModal(closeButton.closest('[data-modal]'));
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('[data-modal]').forEach((modal) => {
    if (!modal.hidden) closeModal(modal);
  });
});
`;

const styles = `
:root {
  --ink: #172033;
  --muted: #8a94ab;
  --line: rgba(24, 35, 55, 0.08);
  --paper: rgba(255, 255, 255, 0.94);
  --paper-strong: #ffffff;
  --shadow: 0 18px 45px rgba(27, 36, 51, 0.1);
  --shadow-soft: 0 10px 24px rgba(27, 36, 51, 0.06);
  --radius: 24px;
  --transport: #2f6bff;
  --stay: #ffaf2a;
  --food: #ff5474;
  --seasonal: #7b70ff;
  --shop: #10a86d;
  --spot: #6f8dca;
  --experience: #8757f4;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Manrope", sans-serif;
  background: linear-gradient(180deg, #fbfbf8 0%, #f4f4f1 100%);
  color: var(--ink);
}
body.modal-open { overflow: hidden; }
a { color: inherit; text-decoration: none; }

.landing-shell,
.page-shell {
  width: min(1440px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 24px 0 40px;
}

.landing-hero {
  min-height: 36vh;
  display: flex;
  flex-direction: column;
  justify-content: end;
  padding: 28px 0 18px;
}

.landing-hero h1,
.hero-overlay h2,
.trip-brief h1,
.trip-hero h1,
.timeline-day__header h2 {
  margin: 0;
  font-family: "Fraunces", serif;
  line-height: 0.96;
}

.landing-hero h1 { font-size: clamp(3.4rem, 8vw, 6.8rem); }
.hero-overlay h2 { font-size: clamp(2.4rem, 5vw, 4.6rem); max-width: 10ch; }
.trip-brief h1 { font-size: 2rem; }
.trip-hero h1 { font-size: clamp(2.6rem, 5vw, 4.2rem); }
.timeline-day__header h2 { font-size: 2rem; }

.hero-copy,
.hero-overlay p,
.trip-brief p,
.subtle,
.note-block,
.detail-row span,
.detail-row strong,
.metric span,
.plain-list,
.event-footer,
.weather-card,
.filter-pill,
.chip,
.timeline-card p,
.event-modal__sub,
.event-modal__meta,
.modal-block p {
  line-height: 1.5;
}

.trip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.trip-card,
.rail-card,
.stat-card,
.event-card,
.weather-card,
.timeline-card,
.event-modal__panel {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.trip-card { overflow: hidden; }
.trip-card-art {
  aspect-ratio: 4 / 3;
  background-size: cover;
  background-position: center;
}
.trip-card-copy { padding: 16px; }
.trip-card-copy h2 { margin: 0 0 8px; font-size: 1.3rem; }
.trip-card-copy p,
.trip-card-copy span { margin: 0; color: var(--muted); }

.timeline-shell { min-height: 100vh; }

.trip-hero {
  min-height: 420px;
  background-size: cover;
  background-position: center;
}

.trip-hero__overlay {
  min-height: 420px;
  padding: 28px 26px 34px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  background: linear-gradient(90deg, rgba(12, 16, 28, 0.72) 0%, rgba(12, 16, 28, 0.38) 45%, rgba(12, 16, 28, 0.18) 100%);
}

.trip-hero__topline,
.timeline-day__header,
.timeline-item,
.timeline-card__head,
.timeline-card__footer,
.detail-list__row,
.modal-cost,
.event-footer,
.event-head,
.day-header,
.weather-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.trip-hero__meta,
.trip-hero__footer p,
.timeline-card__body p,
.timeline-card__subtitle {
  color: rgba(255, 255, 255, 0.82);
  margin: 6px 0 0;
}

.trip-hero__footer p,
.timeline-card__body p,
.timeline-card__subtitle {
  color: var(--muted);
}

.ghost-link {
  align-self: start;
  padding: 12px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(12px);
  color: #fff;
}

.ghost-link--light {
  background: #fff;
  color: var(--ink);
}

.day-switcher {
  position: sticky;
  top: 0;
  z-index: 8;
  display: flex;
  justify-content: center;
  gap: 14px;
  padding: 12px 18px;
  background: rgba(250, 250, 246, 0.92);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(18px);
}

.day-pill {
  width: 74px;
  height: 74px;
  border: 0;
  border-radius: 22px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  cursor: pointer;
}

.day-pill small,
.day-pill strong {
  display: block;
  text-align: center;
}

.day-pill strong {
  font-size: 1.9rem;
  line-height: 1;
}

.day-pill.is-active {
  background: #182136;
  color: #fff;
  box-shadow: var(--shadow-soft);
}

.timeline-stack {
  width: min(1080px, calc(100vw - 40px));
  margin: 28px auto 60px;
}

.timeline-day {
  display: grid;
  gap: 20px;
}

.timeline-day__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.weather-inline {
  padding: 10px 14px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--line);
  color: var(--muted);
}

.timeline-rail {
  position: relative;
  display: grid;
  gap: 18px;
}

.timeline-rail::before {
  content: "";
  position: absolute;
  left: 103px;
  top: 6px;
  bottom: 6px;
  width: 1px;
  background: var(--line);
}

.timeline-item { align-items: flex-start; }

.timeline-item__time {
  width: 84px;
  padding-top: 18px;
  text-align: right;
  color: #94a0b7;
  flex: 0 0 auto;
}

.timeline-item__time span {
  display: block;
  font-weight: 700;
  font-size: 1.05rem;
}

.timeline-item__dot {
  position: relative;
  width: 36px;
  flex: 0 0 36px;
}

.timeline-item__dot::before {
  content: "";
  position: absolute;
  top: 22px;
  left: 11px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--tone, var(--spot));
  box-shadow: 0 0 0 6px #fff;
}

.timeline-card {
  width: 100%;
  padding: 18px 22px 16px;
  text-align: left;
  cursor: pointer;
}

.timeline-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 42px rgba(27, 36, 51, 0.13);
}

.timeline-card__body h3 {
  margin: 10px 0 4px;
  font-size: 1.2rem;
}

.timeline-card__subtitle {
  color: #697892;
  font-weight: 700;
}

.timeline-card__body p {
  margin: 0;
  color: var(--muted);
}

.timeline-card__price {
  font-size: 1.15rem;
  font-weight: 800;
}

.timeline-card__footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
  color: #97a2b8;
  font-size: 0.92rem;
  flex-wrap: wrap;
}

.timeline-card__open {
  margin-left: auto;
  color: var(--ink);
  font-weight: 700;
}

.chip-row,
.day-summary,
.link-row,
.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip,
.filter-pill {
  border-radius: 999px;
  border: 1px solid var(--line);
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--ink);
  font: inherit;
}

.chip-soft {
  padding: 6px 12px;
  font-size: 0.92rem;
}

.chip-dark {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.18);
}

.chip-reserve {
  background: rgba(17, 163, 108, 0.12);
  color: #0f8f5f;
}

.event-modal {
  position: fixed;
  inset: 0;
  z-index: 30;
}

.event-modal__scrim {
  position: absolute;
  inset: 0;
  background: rgba(22, 28, 40, 0.46);
  backdrop-filter: blur(4px);
}

.event-modal__panel {
  position: relative;
  width: min(860px, calc(100vw - 24px));
  max-height: calc(100vh - 30px);
  margin: 15px auto;
  overflow: auto;
  padding: 26px 34px 30px;
  background: var(--paper-strong);
}

.event-modal__panel::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  border-radius: 24px 24px 0 0;
  background: var(--tone, var(--spot));
}

.event-modal__close {
  position: sticky;
  top: 0;
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 50%;
  background: #f1f3f7;
  color: #67728a;
  font-size: 2rem;
}

.event-modal__header h2 {
  margin: 14px 0 4px;
  font-size: clamp(2rem, 4vw, 2.7rem);
}

.event-modal__sub {
  margin: 0;
  color: #96a0b5;
  font-size: 1.25rem;
}

.event-modal__meta {
  margin: 18px 0 0;
  color: #96a0b5;
}

.flight-board,
.stay-strip {
  display: grid;
  gap: 14px;
  margin: 28px 0 18px;
}

.flight-board {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stay-strip {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.flight-board > div,
.stay-strip > div {
  padding: 20px 24px;
  border-radius: 22px;
  background: #f6f8fc;
  text-align: center;
}

.flight-board strong,
.stay-strip strong {
  display: block;
  margin-top: 6px;
  font-size: clamp(2rem, 5vw, 3rem);
}

.flight-board__line {
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(180deg, #3066ff 0%, #294fd3 100%);
}

.event-modal__content,
.detail-grid,
.detail-table,
.event-body,
.metric-stack,
.content-pane,
.stats-panel,
.day-section,
.timeline {
  display: grid;
  gap: 14px;
}

.detail-list {
  display: grid;
  gap: 14px;
}

.detail-list__row {
  align-items: start;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}

.detail-list__row span {
  flex: 0 0 140px;
  display: inline-block;
  padding: 8px 12px;
  border-radius: 12px;
  background: #f4f6f9;
  color: #5f6d89;
  font-weight: 700;
}

.detail-list__row strong {
  flex: 1 1 auto;
  padding-top: 8px;
  color: #3f4c65;
  font-size: 1.05rem;
  font-weight: 500;
}

.detail-list__row a,
.modal-block a,
.link-row a {
  color: #2f6bff;
}

.modal-block h3,
.eyebrow,
.section-title {
  margin: 0 0 10px;
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.modal-block p { margin: 0; color: #4b5871; }

.modal-cost {
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid var(--line);
}

.modal-cost strong { font-size: 2rem; }

.page-shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.side-rail {
  position: sticky;
  top: 18px;
  display: grid;
  gap: 16px;
}

.brand {
  padding: 0 8px;
  font-weight: 800;
}

.rail-card,
.stat-card,
.event-card,
.weather-card {
  padding: 18px;
}

.hero-panel {
  min-height: 290px;
  border-radius: 26px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  box-shadow: var(--shadow);
}

.hero-overlay {
  min-height: 290px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: end;
  color: #fff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.filter-pill.is-active,
.chip-strong {
  background: rgba(47, 107, 255, 0.12);
  border-color: rgba(47, 107, 255, 0.22);
}

.plain-list {
  margin: 0;
  padding-left: 18px;
  color: var(--muted);
}

.metric {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.metric strong { font-size: 1.08rem; }

.day-nav a {
  display: block;
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
}

.day-nav a:last-child { border-bottom: 0; }

.day-header h3 {
  margin: 0;
  font-size: 1.9rem;
  font-family: "Fraunces", serif;
}

.event-card {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 16px;
}

.event-time span {
  display: block;
  font-weight: 800;
  font-size: 1.1rem;
}

.event-time small { color: var(--muted); }

.event-head h4 {
  margin: 0 0 4px;
  font-size: 1.25rem;
}

.subtle,
.note-block,
.event-footer,
.detail-row,
.detail-table {
  color: var(--muted);
}

.detail-row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}

.detail-table > div {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.76);
  border-radius: 12px;
}

.meta-stack,
.price-stack {
  display: grid;
  gap: 8px;
}

.price-stack span { white-space: nowrap; }

.tone-transport { --tone: var(--transport); border-left: 4px solid var(--transport); }
.tone-stay { --tone: var(--stay); border-left: 4px solid var(--stay); }
.tone-food { --tone: var(--food); border-left: 4px solid var(--food); }
.tone-seasonal { --tone: var(--seasonal); border-left: 4px solid var(--seasonal); }
.tone-shop { --tone: var(--shop); border-left: 4px solid var(--shop); }
.tone-spot { --tone: var(--spot); border-left: 4px solid var(--spot); }
.tone-experience { --tone: var(--experience); border-left: 4px solid var(--experience); }

@media (max-width: 1080px) {
  .page-shell {
    grid-template-columns: 1fr;
  }

  .side-rail {
    position: static;
  }

  .timeline-stack {
    width: min(100vw - 28px, 1080px);
  }
}

@media (max-width: 780px) {
  .landing-shell,
  .page-shell {
    width: min(100vw - 20px, 1440px);
    padding-top: 14px;
  }

  .trip-hero,
  .trip-hero__overlay,
  .hero-overlay,
  .hero-panel {
    min-height: 230px;
  }

  .trip-hero__topline,
  .timeline-day__header,
  .timeline-item,
  .event-footer,
  .event-head,
  .day-header,
  .weather-card,
  .detail-list__row,
  .flight-board,
  .stay-strip {
    display: grid;
    grid-template-columns: 1fr;
  }

  .day-switcher {
    justify-content: start;
    overflow: auto;
  }

  .day-pill {
    width: 64px;
    height: 64px;
    flex: 0 0 auto;
  }

  .timeline-rail::before {
    left: 21px;
  }

  .timeline-item__time {
    width: auto;
    padding-top: 0;
    text-align: left;
  }

  .timeline-item__dot {
    width: 24px;
    flex-basis: 24px;
  }

  .timeline-item__dot::before {
    left: 0;
  }

  .event-card {
    gap: 10px;
  }

  .stats-grid,
  .event-card {
    grid-template-columns: 1fr;
  }

  .event-modal__panel {
    width: min(100vw - 12px, 860px);
    padding: 22px 20px 24px;
  }
}
`;

await build();
