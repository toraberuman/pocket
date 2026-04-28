<script lang="ts">
  import type { PageData } from "./$types";
  import { groupByDay } from "$lib/utils";
  import type { TripItemDraft } from "$lib/types";

  type ParsedLineItem = {
    name?: string;
    nativeName?: string;
    unitPrice?: number;
    currency?: string;
    quantity?: number;
    subtotal?: number;
  };

  type ParsedRoomField = {
    label: string;
    value: string;
  };

  let { data }: { data: PageData } = $props();
  const trip = $derived(data.trip);
  const grouped = $derived(groupByDay(trip.items));
  let selectedDay = $state("");
  let selectedItem = $state<TripItemDraft | null>(null);

  const categoryTone: Record<string, string> = {
    交通: "transport",
    住宿: "stay",
    食: "food",
    景點: "spot",
    購物: "shop",
    體驗: "experience",
    季節: "seasonal",
    櫻花: "seasonal",
    其他: "default"
  };

  const transportLabels: Record<string, string> = {
    flight: "航班",
    train: "火車",
    taxi: "計程車",
    drive: "開車",
    walk: "步行",
    transfer: "接送",
    charter: "包車",
    metro: "地鐵",
    other: "交通"
  };

  function dayItems(date: string) {
    return grouped.find((day) => day.date === date)?.items ?? [];
  }

  function detailOf(item: TripItemDraft) {
    return (item.detailJson ?? {}) as Record<string, unknown>;
  }

  function stringValue(value: unknown) {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  }

  function numberValue(value: unknown) {
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  }

  function detailText(item: TripItemDraft, key: string) {
    return stringValue(detailOf(item)[key]);
  }

  function detailNumber(item: TripItemDraft, key: string) {
    return numberValue(detailOf(item)[key]);
  }

  function imageUrl(item: TripItemDraft) {
    return detailText(item, "imageUrl");
  }

  function isUrl(value?: string) {
    return Boolean(value && /^https?:\/\//i.test(value));
  }

  function categoryClass(item: TripItemDraft) {
    if (isTransport(item)) return "transport";
    if (isStay(item)) return "stay";
    return categoryTone[item.category] || "default";
  }

  function isTransport(item: TripItemDraft) {
    return item.category === "交通";
  }

  function isStay(item: TripItemDraft) {
    return Boolean(
      item.category === "住宿" ||
        detailText(item, "roomInfo") ||
        detailText(item, "roomType") ||
        detailText(item, "checkIn") ||
        detailText(item, "checkOut") ||
        detailText(item, "meals")
    );
  }

  function transportMode(item: TripItemDraft) {
    return detailText(item, "transportSubtype") || detailText(item, "mode") || "other";
  }

  function transportLabel(item: TripItemDraft) {
    return transportLabels[transportMode(item)] || "交通";
  }

  function transportCode(item: TripItemDraft) {
    return detailText(item, "trainNumber") || detailText(item, "flightNumber");
  }

  function mealTags(item: TripItemDraft) {
    const raw = detailText(item, "meals");
    if (!raw) return [];

    return raw
      .split(/[\n,，、/]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  function summaryLine(item: TripItemDraft) {
    if (isTransport(item)) {
      return transportMetaLine(item);
    }

    if (isStay(item)) {
      return roomFields(item)[0]?.value || detailText(item, "roomType") || item.place.nativeName || item.notes || "";
    }

    return item.place.nativeName || item.notes || "";
  }

  function formatMoney(item: TripItemDraft) {
    if (!item.amount) return "";
    return `${currencySymbol(item.currency)}${item.amount.toLocaleString()}`.trim();
  }

  function formatAmount(value?: number, currency?: string) {
    if (typeof value !== "number") return "";
    return `${currencySymbol(currency)}${value.toLocaleString()}`.trim();
  }

  function currencySymbol(currency?: string) {
    switch ((currency || "").toUpperCase()) {
      case "KRW":
        return "₩";
      case "JPY":
        return "¥";
      case "TWD":
        return "$";
      default:
        return currency ? `${currency} ` : "";
    }
  }

  function routeStart(item: TripItemDraft) {
    if (transportMode(item) === "flight") {
      return detailText(item, "fromCode") || detailText(item, "fromName") || item.place.name;
    }

    return (
      detailText(item, "fromName") ||
      item.place.name
    );
  }

  function routeEnd(item: TripItemDraft) {
    if (transportMode(item) === "flight") {
      return detailText(item, "toCode") || detailText(item, "toName");
    }

    return detailText(item, "toName");
  }

  function routeStartDetail(item: TripItemDraft) {
    const name = detailText(item, "fromName");
    const terminal = detailText(item, "fromTerminal");
    return [name, terminal].filter(Boolean).join(" 繚 ");
  }

  function routeEndDetail(item: TripItemDraft) {
    const name = detailText(item, "toName");
    const terminal = detailText(item, "toTerminal");
    return [name, terminal].filter(Boolean).join(" 繚 ");
  }

  function transportMetaLine(item: TripItemDraft) {
    const bits = [
      detailText(item, "provider"),
      detailText(item, "trainNumber"),
      detailText(item, "flightNumber"),
      detailText(item, "cabinClass"),
      detailText(item, "durationText"),
      detailNumber(item, "distanceKm") ? `${detailNumber(item, "distanceKm")} km` : undefined
    ].filter(Boolean);

    return bits.join(" 繚 ");
  }

  function transportRouteText(item: TripItemDraft) {
    const start = routeStart(item);
    const end = routeEnd(item);
    if (start && end) return `${start} ??${end}`;
    return detailText(item, "routeText") || item.place.nativeName || item.place.name;
  }

  function transportFacts(item: TripItemDraft) {
    return [
      detailText(item, "provider"),
      detailText(item, "durationText"),
      detailNumber(item, "distanceKm") ? `${detailNumber(item, "distanceKm")} km` : undefined,
      formatMoney(item) || undefined
    ].filter(Boolean);
  }

  function genericFacts(item: TripItemDraft) {
    return [
      item.place.address,
      item.place.phone,
      item.paymentMethod,
      formatMoney(item) || undefined
    ].filter(Boolean);
  }

  function infoRows(item: TripItemDraft) {
    const roomInfo = detailText(item, "roomInfo");
    const roomType = detailText(item, "roomType");
    const hasParsedRoomFields = roomFields(item).length > 0;
    const rows = [
      { label: "地址", value: item.place.address },
      { label: "電話", value: item.place.phone },
      { label: "官網", value: item.place.websiteUrl, href: item.place.websiteUrl },
      { label: "地圖", value: item.place.mapsUrl ? "Google Maps" : undefined, href: item.place.mapsUrl },
      { label: "房型", value: hasParsedRoomFields ? undefined : roomType },
      { label: "房型資訊", value: hasParsedRoomFields ? undefined : roomInfo && roomInfo !== roomType ? roomInfo : undefined },
      { label: "餐食", value: detailText(item, "meals") },
      { label: "車次", value: detailText(item, "trainNumber") },
      { label: "車廂等級", value: detailText(item, "cabinClass") },
      { label: "座位", value: detailText(item, "seat") },
      { label: "車廂", value: detailText(item, "car") },
      { label: "月台", value: detailText(item, "platform") },
      { label: "車型", value: detailText(item, "vehicle") },
      { label: "備註", value: item.notes }
    ];

    return rows
      .filter((row) => row.value)
      .map((row) => ({
        ...row,
        href: row.href || (isUrl(String(row.value)) ? String(row.value) : undefined)
      }));
  }

  function roomFields(item: TripItemDraft) {
    const roomInfo = detailText(item, "roomInfo") || detailText(item, "roomType") || "";
    return parseRoomFields(roomInfo);
  }

  function orderItems(item: TripItemDraft) {
    const raw = detailOf(item).orderItems;
    return Array.isArray(raw) ? (raw as ParsedLineItem[]) : [];
  }

  function orderTotal(item: TripItemDraft) {
    const total = orderItems(item).reduce((sum, row) => sum + (typeof row.subtotal === "number" ? row.subtotal : 0), 0);
    return total > 0 ? total : item.amount;
  }

  function mapEmbedUrl(item: TripItemDraft) {
    const href = item.place.mapsUrl;

    if (href) {
      try {
        const parsed = new URL(href);
        const atMatch = parsed.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        const destination =
          parsed.searchParams.get("destination") ||
          parsed.searchParams.get("query") ||
          parsed.searchParams.get("q");
        const origin = parsed.searchParams.get("origin");

        if (destination || origin) {
          const routeQuery = [origin, destination].filter(Boolean).join(" to ");
          return `https://www.google.com/maps?q=${encodeURIComponent(routeQuery)}&output=embed`;
        }

        if (atMatch) {
          return `https://www.google.com/maps?q=${encodeURIComponent(`${atMatch[1]},${atMatch[2]}`)}&output=embed`;
        }
      } catch {
        // Fallback below.
      }
    }

    const query =
      (typeof item.place.lat === "number" && typeof item.place.lng === "number"
        ? `${item.place.lat},${item.place.lng}`
        : [item.place.address, item.place.name].filter(Boolean).join(" ")) || "";

    if (!query) return undefined;
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }

  function modalTitle(item: TripItemDraft) {
    if (!isTransport(item)) return item.place.name;
    const provider = detailText(item, "provider") || item.place.name;
    const code = transportCode(item);
    return code ? `${provider} ${code}` : provider;
  }

  function closeDetails() {
    selectedItem = null;
  }

  function onDialogKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      closeDetails();
    }
  }

  function parseRoomFields(raw: string): ParsedRoomField[] {
    if (!raw) return [];

    const normalized = raw.replace(/\s+/g, " ").trim();
    if (!normalized) return [];

    const newlineChunks = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const parsedByLine = newlineChunks
      .map(parseRoomFieldLine)
      .filter((field): field is ParsedRoomField => Boolean(field));

    if (parsedByLine.length >= 2 || (parsedByLine.length === 1 && newlineChunks.length === 1)) {
      return parsedByLine;
    }

    const labelPattern = /(Room\d+|size|房型資訊|餐廳\/設施)\s*[:：]/gi;
    const matches = [...normalized.matchAll(labelPattern)];
    if (!matches.length) return [];

    return matches
      .map((match, index) => {
        const nextIndex = matches[index + 1]?.index ?? normalized.length;
        const label = match[1];
        const value = normalized.slice((match.index ?? 0) + match[0].length, nextIndex).trim();
        return value ? { label, value } : null;
      })
      .filter((field): field is ParsedRoomField => Boolean(field));
  }

  function parseRoomFieldLine(line: string) {
    const match = line.match(/^([^:：]{1,20})\s*[:：]\s*(.+)$/);
    if (!match) return null;
    return {
      label: match[1].trim(),
      value: match[2].trim()
    };
  }

  $effect(() => {
    if (!selectedDay && grouped.length) {
      selectedDay = grouped[0].date;
    }
  });
</script>

<svelte:head>
  <title>{data.trip.title}</title>
</svelte:head>

<main class="trip-shell">
  <section
    class="trip-hero"
    style={`background-image:
      linear-gradient(98deg, rgba(15,20,31,.82), rgba(15,20,31,.34)),
      url('${data.trip.coverImageUrl || ""}')`}
  >
    <div class="trip-hero__copy">
      <div class="trip-hero__meta">
        <p class="eyebrow">Pocket Trips</p>
        <h1>{trip.title}</h1>
        <p>{trip.startDate} - {trip.endDate} · {trip.travelerCount} 人旅程</p>
      </div>

      <div class="trip-hero__actions">
        <a class="ghost" href="/">All trips</a>
        <a class="ghost" href={`/trips/${trip.slug}/edit`}>Open editor</a>
        <button class="ghost ghost--strong" type="button">Export to Drive</button>
      </div>
    </div>
  </section>

  <section class="trip-shell__content">
    <div class="trip-shell__main">
      <nav class="day-tabs">
        {#each grouped as day}
          <button class:selected={selectedDay === day.date} onclick={() => (selectedDay = day.date)}>
            <small>{day.weekday}</small>
            <strong>{day.dayOfMonth}</strong>
          </button>
        {/each}
      </nav>

      <section class="timeline-day">
        <header class="timeline-day__header">
          <h2>{grouped.find((day) => day.date === selectedDay)?.label}</h2>
          <div class="timeline-day__stats">
            <span>{dayItems(selectedDay).length} stops</span>
            <span>{trip.destination}</span>
          </div>
        </header>

        <div class="timeline-list">
          {#each dayItems(selectedDay) as item}
            {#if isTransport(item)}
              <button class="timeline-transport" type="button" onclick={() => (selectedItem = item)}>
                <div class="timeline-item__rail">
                  <span>{item.startTime || "All day"}</span>
                  {#if item.endTime}<small>{item.endTime}</small>{/if}
                </div>

                <div class="timeline-item__dot tone-{categoryClass(item)}"></div>

                <div class="timeline-transport__body">
                  <div class="timeline-transport__head">
                    <div class="timeline-item__chips">
                      <span>{transportLabel(item)}</span>
                      {#if transportCode(item)}<span>{transportCode(item)}</span>{/if}
                    </div>
                  </div>

                  <div class="timeline-transport__route">
                    <span>{routeStart(item)}</span>
                    <i></i>
                    <span>{routeEnd(item) || item.place.nativeName || item.place.name}</span>
                  </div>

                  <div class="timeline-transport__meta">
                    {#each transportFacts(item) as fact}
                      <span>{fact}</span>
                    {/each}
                  </div>
                </div>
              </button>
            {:else}
              <button class={`timeline-item card tone-${categoryClass(item)}`} type="button" onclick={() => (selectedItem = item)}>
                <div class="timeline-item__rail">
                  <span>{item.startTime || "All day"}</span>
                  {#if item.endTime}<small>{item.endTime}</small>{/if}
                </div>

                <div class="timeline-item__dot"></div>

                <div class="timeline-item__summary">
                  <div class="timeline-item__chips">
                    <span>{item.category}</span>
                    {#if item.reservationStatus}<span class="chip-soft">{item.reservationStatus}</span>{/if}
                    {#if isStay(item)}
                      {#each mealTags(item) as meal}
                        <span class="chip-meal">{meal}</span>
                      {/each}
                    {/if}
                  </div>

                  <div class="timeline-item__title">
                    <div class="timeline-item__title-copy">
                      <h3>{item.place.name}</h3>
                      {#if summaryLine(item)}
                        <p>{summaryLine(item)}</p>
                      {/if}
                    </div>
                    {#if imageUrl(item)}
                      <img class="timeline-item__thumb" src={imageUrl(item)} alt={item.place.name} loading="lazy" />
                    {/if}
                  </div>

                  <div class="timeline-item__footer">
                    {#each genericFacts(item) as fact}
                      <span>{fact}</span>
                    {/each}
                    <span class="open" aria-hidden="true">↗</span>
                  </div>
                </div>
              </button>
            {/if}
          {/each}
        </div>
      </section>
    </div>

  </section>

  {#if selectedItem}
    <div class="detail-modal" role="presentation">
      <button class="detail-modal__scrim" type="button" aria-label="Close details" onclick={closeDetails}></button>
      <div
        class={`detail-sheet card tone-${categoryClass(selectedItem)}`}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        onkeydown={onDialogKeydown}
      >
        <button class="detail-sheet__close" type="button" onclick={closeDetails}>?</button>

        <div class="detail-sheet__header">
          <div class="timeline-item__chips">
            <span>{selectedItem.category}</span>
            {#if isTransport(selectedItem)}<span>{transportLabel(selectedItem)}</span>{/if}
            {#if isTransport(selectedItem) && transportCode(selectedItem)}<span>{transportCode(selectedItem)}</span>{/if}
            {#if selectedItem.reservationStatus}<span class="chip-soft">{selectedItem.reservationStatus}</span>{/if}
            {#if isStay(selectedItem)}
              {#each mealTags(selectedItem) as meal}
                <span class="chip-meal">{meal}</span>
              {/each}
            {/if}
          </div>
          <h2>{modalTitle(selectedItem)}</h2>
          {#if selectedItem.place.nativeName}<p>{selectedItem.place.nativeName}</p>{/if}
          <div class="detail-sheet__meta">
            <span>{selectedItem.dayDate}</span>
            {#if selectedItem.startTime}<span>{selectedItem.startTime}{selectedItem.endTime ? ` - ${selectedItem.endTime}` : ""}</span>{/if}
          </div>
        </div>

        {#if imageUrl(selectedItem)}
          <section class="detail-image">
            <img src={imageUrl(selectedItem)} alt={selectedItem.place.name} loading="lazy" />
          </section>
        {/if}

        {#if isTransport(selectedItem) && transportMode(selectedItem) === "flight"}
          <section class="journey-ticket">
            <div class="journey-ticket__top">
              <span>{detailText(selectedItem, "provider") || selectedItem.place.name}</span>
              <strong>{detailText(selectedItem, "flightNumber")}</strong>
            </div>

            <div class="journey-ticket__route">
              <div>
                <small>{selectedItem.dayDate}</small>
                <strong>{routeStart(selectedItem)}</strong>
                {#if routeStartDetail(selectedItem)}<p>{routeStartDetail(selectedItem)}</p>{/if}
                <b>{detailText(selectedItem, "fromTime") || selectedItem.startTime}</b>
              </div>
              <div class="journey-ticket__plane">✈</div>
              <div>
                <small>Arrival</small>
                <strong>{routeEnd(selectedItem)}</strong>
                {#if routeEndDetail(selectedItem)}<p>{routeEndDetail(selectedItem)}</p>{/if}
                <b>{detailText(selectedItem, "toTime") || selectedItem.endTime}</b>
              </div>
            </div>
          </section>
        {:else if isTransport(selectedItem)}
          <section class="journey-panel">
            <div class="journey-panel__route">
              <div>
                <small>From</small>
                <strong>{routeStart(selectedItem)}</strong>
                {#if routeStartDetail(selectedItem)}<p>{routeStartDetail(selectedItem)}</p>{/if}
                {#if detailText(selectedItem, "fromTime") || selectedItem.startTime}
                  <b>{detailText(selectedItem, "fromTime") || selectedItem.startTime}</b>
                {/if}
              </div>
              <div class="journey-panel__divider"></div>
              <div>
                <small>To</small>
                <strong>{routeEnd(selectedItem) || selectedItem.place.nativeName || selectedItem.place.name}</strong>
                {#if routeEndDetail(selectedItem)}<p>{routeEndDetail(selectedItem)}</p>{/if}
                {#if detailText(selectedItem, "toTime") || selectedItem.endTime}
                  <b>{detailText(selectedItem, "toTime") || selectedItem.endTime}</b>
                {/if}
              </div>
            </div>

            <div class="journey-panel__facts">
              {#each transportFacts(selectedItem) as fact}
                <span>{fact}</span>
              {/each}
            </div>
          </section>
        {:else if isStay(selectedItem)}
          <section class="stay-grid">
            <div class="stay-grid__checkin">
              <small>Check-in</small>
              <strong>{detailText(selectedItem, "checkIn") || selectedItem.startTime || "16:00"}</strong>
            </div>
            <div class="stay-grid__checkout">
              <small>Check-out</small>
              <strong>{detailText(selectedItem, "checkOut") || "12:00"}</strong>
            </div>
          </section>
        {/if}

        {#if roomFields(selectedItem).length}
          <section class="room-tags">
            {#each roomFields(selectedItem) as room}
              <div class="room-tags__item">
                <span>{room.label}</span>
                <strong>
                  {#if isUrl(room.value)}
                    <a href={room.value} target="_blank" rel="noreferrer">{room.value}</a>
                  {:else}
                    {room.value}
                  {/if}
                </strong>
              </div>
            {/each}
          </section>
        {/if}

        <div class="detail-sheet__grid">
          {#each infoRows(selectedItem) as row}
            <div class:span-2={row.label === "備註" || row.label === "房型資訊"}>
              <small>{row.label}</small>
              {#if row.href}
                <strong><a href={row.href} target="_blank" rel="noreferrer">{row.value}</a></strong>
              {:else}
                <strong>{row.value}</strong>
              {/if}
            </div>
          {/each}
        </div>

        {#if orderItems(selectedItem).length}
          <section class="order-panel">
            <div class="order-panel__head">
              <div>
                <small>明細</small>
                <strong>點餐 / 購物內容</strong>
              </div>
            </div>

            <div class="order-table">
              <div class="order-table__row order-table__row--head">
                <span>品項</span>
                <span>原文</span>
                <span>單價</span>
                <span>數量</span>
                <span>小計</span>
              </div>
              {#each orderItems(selectedItem) as row}
                <div class="order-table__row">
                  <span>{row.name || "-"}</span>
                  <span>{row.nativeName || "-"}</span>
                  <span>{formatAmount(row.unitPrice, row.currency || selectedItem.currency)}</span>
                  <span>{row.quantity ?? 1}</span>
                  <span>{formatAmount(row.subtotal, row.currency || selectedItem.currency)}</span>
                </div>
              {/each}
            </div>

            <div class="order-panel__total">
              <span>總計</span>
              <strong>{formatAmount(orderTotal(selectedItem), selectedItem.currency)}</strong>
            </div>
          </section>
        {/if}

        {#if mapEmbedUrl(selectedItem)}
          <section class="map-panel">
            <div class="map-panel__head">
              <div>
                <small>地圖預覽</small>
                <strong>{selectedItem.place.name}</strong>
              </div>
              {#if selectedItem.place.mapsUrl}
                <a href={selectedItem.place.mapsUrl} target="_blank" rel="noreferrer">Google Maps</a>
              {/if}
            </div>
            <iframe
              title={`${selectedItem.place.name} map`}
              src={mapEmbedUrl(selectedItem)}
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </section>
        {/if}

        {#if selectedItem.amount}
          <div class="detail-sheet__amount">
            <span>{selectedItem.paymentMethod || "費用"}</span>
            <strong>{formatMoney(selectedItem)}</strong>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</main>

<style>
  .trip-shell { min-height: 100vh; }
  .trip-hero {
    position: relative;
    overflow: hidden;
    min-height: 360px;
    background-size: cover;
    background-position: center;
    color: white;
  }
  .trip-hero::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(9, 12, 18, 0.08), rgba(9, 12, 18, 0.18));
    pointer-events: none;
  }
  .trip-hero__copy {
    position: relative;
    z-index: 1;
    width: min(1120px, calc(100vw - 48px));
    min-height: 360px;
    margin: 0 auto;
    padding: 34px 0 38px;
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 24px;
  }
  .trip-hero__meta h1 {
    margin: 0 0 12px;
    font-family: var(--font-display);
    font-size: clamp(2.65rem, 4vw, 4.35rem);
    font-weight: 700;
    line-height: 0.98;
    max-width: 8ch;
    text-wrap: balance;
  }
  .trip-hero__meta p:last-child {
    margin: 0;
    color: rgba(255,255,255,.8);
    font-size: 0.92rem;
    letter-spacing: 0.01em;
  }
  .trip-hero__actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .ghost {
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(255,255,255,.1);
    color: white;
    padding: 12px 16px;
    border-radius: 999px;
    backdrop-filter: blur(14px);
  }
  .ghost--strong { background: white; color: var(--ink); border-color: transparent; }
  .trip-shell__content {
    width: min(1120px, calc(100vw - 48px));
    margin: 28px auto 56px;
    display: grid;
  }
  .trip-shell__main { display: grid; gap: 18px; }
  .day-tabs {
    position: sticky;
    top: 10px;
    z-index: 5;
    display: flex;
    gap: 10px;
    padding: 10px;
    border-radius: 22px;
    background: rgba(255,255,255,.96);
    border: 1px solid var(--border);
    backdrop-filter: blur(16px);
    box-shadow: 0 10px 28px rgba(17,24,39,.045);
  }
  .day-tabs button {
    width: 66px;
    height: 66px;
    border: 0;
    border-radius: 20px;
    background: transparent;
    color: var(--muted);
    transition: 180ms ease;
  }
  .day-tabs button.selected { background: #1d2433; color: white; box-shadow: 0 12px 24px rgba(29,36,51,.18); }
  .day-tabs small, .day-tabs strong { display: block; text-align: center; }
  .day-tabs small { font-size: 0.8rem; }
  .day-tabs strong { font-size: 1.48rem; line-height: 1; }
  .timeline-day {
    display: grid;
    gap: 18px;
    padding: 20px 22px 24px;
    border-radius: 30px;
    background: #fff;
    border: 1px solid rgba(20,31,49,.06);
    box-shadow: 0 16px 40px rgba(17,24,39,.04);
  }
  .timeline-day__header { display: flex; justify-content: space-between; gap: 18px; align-items: end; }
  .timeline-day__header h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.55rem, 2vw, 2rem);
    font-weight: 700;
    line-height: 1;
  }
  .timeline-day__stats { display: flex; gap: 10px; flex-wrap: wrap; }
  .timeline-day__stats span {
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,.92);
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 0.88rem;
  }
  .timeline-list { position: relative; display: grid; gap: 16px; }
  .timeline-list::before {
    content: "";
    position: absolute;
    left: 111px;
    top: 8px;
    bottom: 8px;
    width: 1px;
    background: rgba(20,31,49,.08);
  }
  .timeline-item,
  .timeline-transport {
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    text-align: left;
    display: grid;
    grid-template-columns: 94px 34px minmax(0, 1fr);
    gap: 16px;
    align-items: start;
  }
  .timeline-item {
    overflow: hidden;
    transition: transform 180ms ease, box-shadow 180ms ease;
    border-radius: 28px;
    background: #fff;
    border: 1px solid rgba(20,31,49,.06);
    box-shadow: 0 12px 34px rgba(17,24,39,.05);
  }
  .timeline-item:hover { transform: translateY(-1px); box-shadow: 0 22px 40px rgba(17,24,39,.08); }
  .timeline-item__rail { padding: 22px 0 0; color: #98a2b5; text-align: right; }
  .timeline-item__rail span { display: block; font-weight: 700; font-size: 0.95rem; font-variant-numeric: tabular-nums; }
  .timeline-item__rail small { color: #c1c8d6; }
  .timeline-item__dot { position: relative; min-height: 100%; }
  .timeline-item__dot::before {
    content: "";
    position: absolute;
    top: 28px;
    left: 7px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--tone, var(--blue));
    box-shadow: 0 0 0 6px white;
  }
  .timeline-item__summary { padding: 20px 22px 18px 0; }
  .timeline-item__chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
  .timeline-item__chips span {
    padding: 6px 11px;
    border-radius: 999px;
    background: rgba(230,80,79,.08);
    color: var(--accent);
    font-size: .8rem;
    font-weight: 700;
  }
  .timeline-item__chips .chip-soft { background: rgba(14,165,108,.1); color: #0d9c67; }
  .timeline-item__chips .chip-meal { background: rgba(255, 175, 42, 0.14); color: #d97706; }
  .timeline-item__title { display: flex; justify-content: space-between; gap: 16px; align-items: start; }
  .timeline-item__title-copy { min-width: 0; flex: 1 1 auto; }
  .timeline-item__title h3 { margin: 0 0 5px; font-size: 1.12rem; letter-spacing: 0; }
  .timeline-item__title p { margin: 0; color: var(--muted); line-height: 1.45; }
  .timeline-item__thumb {
    width: 112px;
    height: 92px;
    flex: 0 0 112px;
    object-fit: cover;
    border-radius: 18px;
    box-shadow: 0 10px 20px rgba(17,24,39,.08);
  }
  .timeline-item__footer {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(20,31,49,.08);
    color: var(--muted);
  }
  .timeline-item__footer .open {
    color: var(--ink);
    font-weight: 700;
    margin-left: auto;
    width: 28px;
    height: 28px;
    display: inline-grid;
    place-items: center;
    border-radius: 999px;
    background: rgba(20,31,49,.04);
  }
  .timeline-transport {
    align-items: center;
    padding: 2px 0;
  }
  .timeline-transport__body {
    padding: 16px 0 16px;
    border-bottom: 1px solid rgba(20,31,49,.08);
    transition: transform 160ms ease;
  }
  .timeline-transport:hover .timeline-transport__body { transform: translateX(2px); }
  .timeline-transport__head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }
  .timeline-transport__head strong { font-size: 0.98rem; }
  .timeline-transport__route {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 56px minmax(0, 1fr);
    gap: 12px;
    align-items: center;
    margin-top: 10px;
    font-weight: 700;
    font-size: 1.02rem;
  }
  .timeline-transport__route span:first-child { text-align: left; }
  .timeline-transport__route span:last-child { text-align: right; }
  .timeline-transport__route i {
    height: 1px;
    background: linear-gradient(90deg, rgba(49,107,255,.2), rgba(49,107,255,.72), rgba(49,107,255,.2));
    position: relative;
  }
  .timeline-transport__route i::after {
    content: "";
    position: absolute;
    top: -3px;
    right: 0;
    border-left: 7px solid rgba(49,107,255,.72);
    border-top: 3.5px solid transparent;
    border-bottom: 3.5px solid transparent;
  }
  .timeline-transport__meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 12px;
    color: var(--muted);
    font-size: 0.92rem;
  }
  .timeline-transport__meta span {
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,.88);
    border: 1px solid rgba(20,31,49,.06);
  }
  .detail-modal {
    position: fixed;
    inset: 0;
    z-index: 30;
    display: grid;
    place-items: center;
    padding: 16px;
  }
  .detail-modal__scrim {
    position: absolute;
    inset: 0;
    border: 0;
    background: rgba(16,24,39,.34);
    backdrop-filter: blur(8px);
  }
  .detail-sheet {
    position: relative;
    width: min(920px, calc(100vw - 24px));
    max-height: calc(100vh - 24px);
    overflow: auto;
    padding: 28px;
    background: #fff;
    border-radius: 30px;
    box-shadow: 0 32px 70px rgba(14, 19, 28, 0.2);
  }
  .detail-sheet__close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 999px;
    background: rgba(20,31,49,.06);
    color: var(--muted);
    font-size: 1.65rem;
  }
  .detail-sheet__header h2 {
    margin: 8px 0 6px;
    font-family: var(--font-display);
    font-size: clamp(1.85rem, 3vw, 2.35rem);
    line-height: 0.98;
    max-width: min(18ch, calc(100% - 56px));
    text-wrap: balance;
  }
  .detail-sheet__header p { margin: 0; color: var(--muted); }
  .detail-sheet__meta { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 14px; color: var(--muted); }
  .journey-ticket,
  .journey-panel,
  .order-panel,
  .stay-grid,
  .map-panel {
    margin-top: 24px;
  }
  .journey-ticket {
    padding: 22px;
    border-radius: 26px;
    background: linear-gradient(135deg, #2951d8 0%, #316bff 48%, #6284ff 100%);
    color: white;
    box-shadow: 0 22px 44px rgba(49,107,255,.24);
  }
  .journey-ticket__top,
  .map-panel__head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }
  .journey-ticket__top span { color: rgba(255,255,255,.8); }
  .journey-ticket__top strong { font-size: 1.7rem; }
  .journey-ticket__route {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 80px minmax(0, 1fr);
    gap: 18px;
    align-items: center;
    margin-top: 22px;
  }
  .journey-ticket__route small,
  .journey-panel__route small,
  .stay-grid small,
  .map-panel small {
    display: block;
    color: var(--muted);
    font-size: 0.78rem;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0;
  }
  .journey-ticket__route small { color: rgba(255,255,255,.7); }
  .journey-ticket__route strong,
  .journey-panel__route strong {
    display: block;
    margin-top: 4px;
    font-size: 2.5rem;
    line-height: 1;
  }
  .journey-ticket__route p,
  .journey-panel__route p { margin: 8px 0 0; color: rgba(255,255,255,.78); }
  .journey-panel__route p { color: var(--muted); }
  .journey-ticket__route b,
  .journey-panel__route b {
    display: block;
    margin-top: 14px;
    font-size: 1.55rem;
    line-height: 1;
  }
  .journey-ticket__plane {
    text-align: center;
    font-size: 1.6rem;
    opacity: 0.85;
  }
  .journey-panel {
    padding: 20px;
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(49,107,255,.06), rgba(49,107,255,.015));
    border: 1px solid rgba(49,107,255,.1);
  }
  .journey-panel__route {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 60px minmax(0, 1fr);
    gap: 16px;
    align-items: center;
  }
  .journey-panel__divider {
    height: 1px;
    background: linear-gradient(90deg, rgba(20,31,49,.1), rgba(49,107,255,.42), rgba(20,31,49,.1));
    position: relative;
  }
  .journey-panel__divider::after {
    content: "";
    position: absolute;
    top: -4px;
    right: 0;
    border-left: 8px solid rgba(49,107,255,.7);
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
  }
  .journey-panel__facts {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  .journey-panel__facts span,
  .stay-grid div {
    padding: 12px 14px;
    border-radius: 18px;
    background: rgba(255,255,255,.78);
    border: 1px solid rgba(20,31,49,.06);
  }
  .stay-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .stay-grid strong { display: block; margin-top: 8px; font-size: 2rem; }
  .stay-grid__checkin {
    background: linear-gradient(180deg, rgba(255, 188, 92, 0.28), rgba(255, 188, 92, 0.12)) !important;
    border-color: rgba(255, 175, 42, 0.18) !important;
  }
  .stay-grid__checkout {
    background: linear-gradient(180deg, rgba(29, 36, 51, 0.08), rgba(29, 36, 51, 0.03)) !important;
    border-color: rgba(29, 36, 51, 0.08) !important;
  }
  .room-tags {
    display: grid;
    gap: 10px;
    margin-top: 20px;
  }
  .room-tags__item {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: start;
    padding: 12px 14px;
    border-radius: 18px;
    background: rgba(255, 175, 42, 0.08);
    border: 1px solid rgba(255, 175, 42, 0.14);
  }
  .room-tags__item span {
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,.72);
    color: #d97706;
    font-size: 0.78rem;
    font-weight: 700;
  }
  .room-tags__item strong {
    font-size: 0.98rem;
    line-height: 1.4;
    flex: 1 1 260px;
  }
  .room-tags__item a {
    color: #316bff;
    word-break: break-word;
  }
  .detail-image {
    margin-top: 24px;
  }
  .detail-image img {
    width: 100%;
    max-height: 320px;
    object-fit: cover;
    border-radius: 24px;
    display: block;
    background: rgba(20,31,49,.04);
  }
  .detail-sheet__grid {
    margin-top: 24px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .detail-sheet__grid div {
    display: grid;
    gap: 8px;
    padding: 16px;
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(20,31,49,.025), rgba(20,31,49,.04));
  }
  .detail-sheet__grid small { color: var(--muted); font-size: .78rem; text-transform: uppercase; font-weight: 700; }
  .detail-sheet__grid strong { font-size: 1rem; line-height: 1.55; }
  .detail-sheet__grid a,
  .map-panel__head a { color: #316bff; word-break: break-word; }
  .span-2 { grid-column: span 2; }
  .order-panel {
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  .order-panel__head strong {
    display: block;
    margin-top: 4px;
    font-size: 1rem;
  }
  .order-table {
    margin-top: 14px;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(20,31,49,.08);
    background: rgba(255,255,255,.9);
  }
  .order-table__row {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) 120px 80px 120px;
    gap: 12px;
    padding: 14px 16px;
    align-items: center;
  }
  .order-table__row span:last-child,
  .order-table__row span:nth-last-child(2) {
    text-align: right;
  }
  .order-table__row + .order-table__row {
    border-top: 1px solid rgba(20,31,49,.06);
  }
  .order-table__row--head {
    background: rgba(20,31,49,.04);
    color: var(--muted);
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
  }
  .order-panel__total {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    margin-top: 14px;
    padding: 14px 2px 0;
    color: var(--muted);
  }
  .order-panel__total strong {
    color: var(--ink);
    font-size: 1.3rem;
  }
  .map-panel {
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  .map-panel__head strong { display: block; margin-top: 4px; font-size: 1rem; }
  .map-panel iframe {
    width: 100%;
    height: 280px;
    margin-top: 14px;
    border: 0;
    border-radius: 22px;
    background: rgba(20,31,49,.04);
  }
  .detail-sheet__amount {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: end;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .detail-sheet__amount span { color: var(--muted); }
  .detail-sheet__amount strong { font-size: 2rem; line-height: 1; }
  .tone-transport { --tone: #316bff; }
  .tone-stay { --tone: #ffaf2a; }
  .tone-food { --tone: #ff5679; }
  .tone-spot { --tone: #7092dd; }
  .tone-shop { --tone: #11a36c; }
  .tone-experience,
  .tone-seasonal { --tone: #7f6cff; }
  @media (max-width: 1080px) {
    .trip-shell__content { width: min(100vw - 20px, 1120px); }
  }
  @media (max-width: 780px) {
    .trip-hero__copy,
    .trip-shell__content { width: min(100vw - 20px, 1120px); }
    .trip-hero__copy,
    .timeline-day__header,
    .timeline-item__title,
    .journey-ticket__top,
    .map-panel__head { display: grid; gap: 10px; }
    .trip-hero__actions { justify-content: start; }
    .day-tabs { overflow: auto; justify-content: start; }
    .day-tabs button { flex: 0 0 auto; }
    .timeline-list::before { left: 16px; }
    .timeline-item,
    .timeline-transport { grid-template-columns: 1fr; }
    .timeline-item__rail { padding: 16px 20px 0; text-align: left; }
    .timeline-item__dot { height: 0; }
    .timeline-item__dot::before { left: 9px; top: -10px; }
    .timeline-item__summary,
    .timeline-transport__body { padding: 0 20px 18px; }
    .timeline-item__title { display: grid; }
    .timeline-item__thumb { width: 100%; height: 190px; flex-basis: auto; }
    .timeline-transport__route,
    .journey-ticket__route,
    .journey-panel__route,
    .stay-grid,
    .detail-sheet__grid,
    .order-table__row,
    .form-grid { grid-template-columns: 1fr; }
    .span-2 { grid-column: span 1; }
    .order-table__row span:last-child,
    .order-table__row span:nth-last-child(2) { text-align: left; }
  }
</style>


