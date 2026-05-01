<script lang="ts">
  import { onMount } from "svelte";
  import PocketIcon from "$lib/components/PocketIcon.svelte";
  import type { PageData } from "./$types";
  import type { TripItemDraft } from "$lib/types";
  import "../section.css";

  type MapMarker = {
    id: string;
    dayDate: string;
    time: string;
    title: string;
    location: string;
    category: string;
    subcategory?: string;
    mapsUrl?: string;
    lat: number;
    lng: number;
  };

  let { data }: { data: PageData } = $props();
  const trip = $derived(data.trip);
  const items = $derived(!data.locked && "items" in trip ? trip.items : []);
  const days = $derived([...new Set(items.map((item) => item.dayDate))].sort());
  const markers = $derived(buildMarkers(items));
  let selectedDay = $state("all");
  let selectedMarkerId = $state("");
  let mapHost = $state<HTMLDivElement>();
  let leaflet: any;
  let map: any;
  let markerGroup: any;

  const filteredMarkers = $derived(
    selectedDay === "all" ? markers : markers.filter((marker) => marker.dayDate === selectedDay)
  );
  const selectedMarker = $derived(filteredMarkers.find((marker) => marker.id === selectedMarkerId));

  onMount(() => {
    let disposed = false;

    loadLeaflet().then((library) => {
      if (disposed || !mapHost) return;
      leaflet = library;
      map = leaflet.map(mapHost, {
        zoomControl: true,
        attributionControl: true
      });

      leaflet
        .tileLayer("https://tile.openstreetmap.jp/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors, tiles by <a href="https://openstreetmap.jp/" target="_blank" rel="noreferrer">OpenStreetMap Japan</a>',
          maxZoom: 18
        })
        .addTo(map);

      markerGroup = leaflet.layerGroup().addTo(map);
      renderMarkers(filteredMarkers);
    });

    return () => {
      disposed = true;
      if (map) {
        map.remove();
        map = null;
      }
    };
  });

  $effect(() => {
    selectedDay;
    if (!map || !leaflet) return;
    renderMarkers(filteredMarkers);
  });

  function selectDay(day: string) {
    selectedDay = day;
    selectedMarkerId = "";
    if (map && leaflet) {
      const nextMarkers = day === "all" ? markers : markers.filter((marker) => marker.dayDate === day);
      renderMarkers(nextMarkers);
    }
  }

  function buildMarkers(items: TripItemDraft[]) {
    return items
      .map((item) => {
        const coordinate = coordinateFromItem(item);
        if (!coordinate) return null;
        return {
          id: item.id,
          dayDate: item.dayDate,
          time: item.startTime || "All day",
          title: item.place.name,
          location: item.place.nativeName || item.place.address || item.place.name,
          category: item.category,
          subcategory: item.subcategory,
          mapsUrl: item.place.mapsUrl,
          lat: coordinate.lat,
          lng: coordinate.lng
        };
      })
      .filter((marker): marker is MapMarker => Boolean(marker));
  }

  function coordinateFromItem(item: TripItemDraft) {
    if (typeof item.place.lat === "number" && typeof item.place.lng === "number") {
      return { lat: item.place.lat, lng: item.place.lng };
    }

    return coordinateFromMapsUrl(item.place.mapsUrl);
  }

  function coordinateFromMapsUrl(value: string | undefined) {
    if (!value) return null;
    const decoded = decodeURIComponent(value);
    const patterns = [
      /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
      /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
      /[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/
    ];

    for (const pattern of patterns) {
      const match = decoded.match(pattern);
      if (!match) continue;
      const lat = Number(match[1]);
      const lng = Number(match[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }

    return null;
  }

  async function loadLeaflet() {
    const win = window as typeof window & { L?: any };
    if (win.L) return win.L;

    if (!document.querySelector("link[data-leaflet]")) {
      const link = document.createElement("link");
      link.dataset.leaflet = "true";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>("script[data-leaflet]");
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Leaflet failed to load.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.dataset.leaflet = "true";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Leaflet failed to load."));
      document.body.appendChild(script);
    });

    return win.L;
  }

  function renderMarkers(activeMarkers: MapMarker[]) {
    if (!markerGroup) return;
    markerGroup.clearLayers();

    if (!activeMarkers.length) {
      map.setView([35.6812, 139.7671], 7);
      return;
    }

    for (const [index, marker] of activeMarkers.entries()) {
      const layer = leaflet
        .marker([marker.lat, marker.lng], {
          icon: leaflet.divIcon({
            className: "",
            html: `<span class="leaflet-pocket-pin ${markerTone(marker.category)}"><i>${index + 1}</i></span>`,
            iconSize: [34, 44],
            iconAnchor: [17, 42]
          })
        })
        .addTo(markerGroup);

      layer.on("click", () => {
        selectedMarkerId = marker.id;
      });
    }

    if (activeMarkers.length === 1) {
      map.setView([activeMarkers[0].lat, activeMarkers[0].lng], 13, { animate: true });
      return;
    }

    const bounds = leaflet.latLngBounds(activeMarkers.map((marker) => [marker.lat, marker.lng]));
    map.fitBounds(bounds, { padding: [72, 72], maxZoom: 13, animate: true });
  }

  function markerTone(category: string) {
    switch (category) {
      case "transport":
        return "tone-transport";
      case "restaurant":
        return "tone-food";
      case "stay":
        return "tone-stay";
      case "shopping":
        return "tone-shopping";
      case "sight":
      case "experience":
        return "tone-sight";
      default:
        return "tone-other";
    }
  }

  function categoryLabel(category: string) {
    switch (category) {
      case "transport":
        return "Transport";
      case "restaurant":
        return "Food";
      case "stay":
        return "Accommodation";
      case "shopping":
        return "Shopping";
      case "sight":
      case "experience":
        return "Sightseeing";
      default:
        return "Other";
    }
  }

  function shortDay(date: string) {
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return date;
    return new Intl.DateTimeFormat("en", { month: "2-digit", day: "2-digit" }).format(parsed).replace("/", ".");
  }
</script>

<svelte:head>
  <title>{trip.title} · Map</title>
</svelte:head>

{#if data.locked}
  <main class="locked-shell">
    <section class="empty-map">
      <p class="eyebrow">Protected</p>
      <h1>The route.</h1>
      <p>This trip is protected. Open the plan page and enter the trip password first.</p>
      <a href={`/trips/${trip.slug}`}>Back to plan</a>
    </section>
  </main>
{:else}
  <main class="map-shell">
    <div class="leaflet-host" bind:this={mapHost}></div>

    <div class="map-controls map-controls--left">
      <a href={`/trips/${trip.slug}`} aria-label="Back to plan">
        <PocketIcon name="chevron-left" size={18} />
        <span>Back</span>
      </a>
    </div>

    <div class="day-filter" aria-label="Filter map markers by date">
      <button type="button" class:active={selectedDay === "all"} onclick={() => selectDay("all")}>All</button>
      {#each days as day}
        <button type="button" class:active={selectedDay === day} onclick={() => selectDay(day)}>{shortDay(day)}</button>
      {/each}
    </div>

    <a class="edit-link" href={`/trips/${trip.slug}/edit`}>
      <PocketIcon name="edit-3" size={18} />
      <span>Edit</span>
    </a>

    <aside class="legend" aria-label="Marker legend">
      {#each ["transport", "restaurant", "sight", "stay"] as category}
        <span class={markerTone(category)}>
          <i></i>
          {categoryLabel(category)}
        </span>
      {/each}
    </aside>

    {#if selectedMarker}
      <article class="map-card">
        <button type="button" class="close-card" aria-label="Close selected place" onclick={() => (selectedMarkerId = "")}>
          <PocketIcon name="x" size={17} />
        </button>
        <div class={`card-icon ${markerTone(selectedMarker.category)}`}>
          <span></span>
        </div>
        <div>
          <p>{selectedMarker.time} <em>Day {Math.max(1, days.indexOf(selectedMarker.dayDate) + 1)}</em></p>
          <h2>{selectedMarker.title}</h2>
          <small>
            <PocketIcon name="map-pin" size={14} />
            {selectedMarker.location}
          </small>
        </div>
        {#if selectedMarker.mapsUrl}
          <a href={selectedMarker.mapsUrl} target="_blank" rel="noreferrer" aria-label="Open in Google Maps">
            <PocketIcon name="external-link" size={18} />
          </a>
        {/if}
      </article>
    {:else if !filteredMarkers.length}
      <article class="map-card map-card--empty">
        <div>
          <p>No mapped places</p>
          <h2>此日期沒有可釘選的地點</h2>
          <small>需要 lat/lng，或 Google Maps URL 內含座標。</small>
        </div>
      </article>
    {/if}

    <nav class="map-tabbar" aria-label="Trip sections">
      <a href={`/trips/${trip.slug}`}>
        <PocketIcon name="chevron-left" size={22} />
        <small>Back</small>
      </a>
      <a href={`/trips/${trip.slug}`}>
        <PocketIcon name="calendar" size={22} />
        <small>Plan</small>
      </a>
      <a href={`/trips/${trip.slug}/expense`}>
        <PocketIcon name="receipt" size={22} />
        <small>Expense</small>
      </a>
      <a href={`/trips/${trip.slug}/package`}>
        <PocketIcon name="briefcase" size={22} />
        <small>Package</small>
      </a>
      <a href={`/trips/${trip.slug}/cart`}>
        <PocketIcon name="cart" size={22} />
        <small>Cart</small>
      </a>
    </nav>
  </main>
{/if}

<style>
  :global(body) {
    overflow: hidden;
  }

  .map-shell {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: #dfe7e8;
  }

  .leaflet-host {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .map-controls,
  .day-filter,
  .edit-link,
  .legend,
  .map-card,
  .map-tabbar {
    position: absolute;
    z-index: 500;
  }

  .map-controls--left {
    top: 28px;
    left: 58px;
  }

  .map-controls a,
  .edit-link {
    height: 3.15rem;
    display: inline-flex;
    align-items: center;
    gap: .7rem;
    padding: 0 1.35rem;
    border: 1px solid rgba(22, 21, 19, .08);
    background: rgba(251, 250, 246, .94);
    color: var(--p-ink);
    box-shadow: 0 8px 24px rgba(22, 21, 19, .08);
    font-family: var(--font-pocket-mono);
    font-size: .72rem;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .day-filter {
    top: 32px;
    left: 50%;
    display: flex;
    max-width: calc(100vw - 260px);
    overflow-x: auto;
    border: 1px solid rgba(22, 21, 19, .08);
    background: rgba(251, 250, 246, .94);
    box-shadow: 0 8px 24px rgba(22, 21, 19, .08);
    transform: translateX(-50%);
  }

  .day-filter button {
    min-width: 5.1rem;
    height: 3rem;
    border: 0;
    border-right: 1px solid rgba(22, 21, 19, .08);
    background: transparent;
    color: var(--p-ink-2);
    font-family: var(--font-pocket-mono);
    font-size: .72rem;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .day-filter button.active {
    background: #a94f3a;
    color: white;
  }

  .edit-link {
    top: 36px;
    right: 30px;
  }

  .legend {
    left: 24px;
    bottom: 95px;
    display: grid;
    gap: .2rem;
    min-width: 11rem;
    padding: .75rem;
    background: rgba(251, 250, 246, .94);
    box-shadow: 0 8px 24px rgba(22, 21, 19, .08);
  }

  .legend span {
    display: flex;
    align-items: center;
    gap: .7rem;
    color: var(--p-ink-2);
    font-family: var(--font-pocket-mono);
    font-size: .68rem;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .legend i {
    width: 1.7rem;
    height: 1.7rem;
    display: block;
    background: var(--marker-color);
  }

  .map-card {
    left: 50%;
    bottom: 76px;
    width: min(36rem, calc(100vw - 2rem));
    display: grid;
    grid-template-columns: 3.2rem minmax(0, 1fr) 2.4rem;
    gap: 1rem;
    align-items: center;
    padding: 1.5rem 4rem 1.5rem 1.5rem;
    border: 1px solid rgba(22, 21, 19, .08);
    background: rgba(251, 250, 246, .97);
    box-shadow: 0 18px 50px rgba(22, 21, 19, .16);
    transform: translateX(-50%);
  }

  .map-card--empty {
    grid-template-columns: 1fr;
    padding-right: 1.5rem;
  }

  .card-icon {
    width: 3.2rem;
    height: 3.2rem;
    display: grid;
    place-items: center;
    background: var(--marker-color);
  }

  .card-icon span {
    width: .75rem;
    height: .75rem;
    border: 2px solid white;
    border-radius: 999px;
  }

  .map-card p {
    margin: 0;
    color: var(--p-ink-3);
    font-family: var(--font-pocket-mono);
    font-size: .78rem;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .map-card em {
    margin-left: .4rem;
    color: #a94f3a;
    font-style: normal;
  }

  .map-card h2 {
    margin: .45rem 0 .55rem;
    overflow: hidden;
    color: var(--p-ink);
    font-size: 1.18rem;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .map-card small {
    display: flex;
    align-items: center;
    gap: .35rem;
    overflow: hidden;
    color: var(--p-ink-2);
    font-size: .86rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .map-card > a {
    width: 2.4rem;
    height: 2.4rem;
    display: grid;
    place-items: center;
    color: var(--p-ink);
  }

  .close-card {
    position: absolute;
    top: 1.2rem;
    right: 1.2rem;
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    border: 0;
    background: transparent;
    color: var(--p-ink-2);
  }

  .map-tabbar {
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    min-height: 4.8rem;
    border-top: 1px solid rgba(22, 21, 19, .08);
    background: rgba(251, 250, 246, .96);
    backdrop-filter: blur(14px);
  }

  .map-tabbar a {
    display: grid;
    place-items: center;
    align-content: center;
    gap: .3rem;
    color: var(--p-ink-2);
  }

  .map-tabbar small {
    font-family: var(--font-pocket-mono);
    font-size: .62rem;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .locked-shell {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 2rem;
  }

  .empty-map {
    max-width: 36rem;
    padding: 2rem;
    background: var(--p-paper);
  }

  .empty-map h1 {
    margin: 0 0 1rem;
  }

  .empty-map a {
    display: inline-flex;
    margin-top: 1rem;
    color: var(--p-accent);
  }

  :global(.leaflet-pocket-pin) {
    --marker-color: #6f6a60;
    position: relative;
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border: 3px solid #fbfaf6;
    border-radius: 999px 999px 999px 0;
    background: var(--marker-color);
    color: white;
    box-shadow: 0 12px 22px rgba(22, 21, 19, .28);
    transform: rotate(-45deg);
  }

  :global(.leaflet-pocket-pin i) {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    font-family: var(--font-pocket-mono);
    font-size: 12px;
    font-style: normal;
    transform: rotate(45deg);
  }

  :global(.tone-transport) { --marker-color: #2d7ff9; }
  :global(.tone-food) { --marker-color: #ef5b2a; }
  :global(.tone-stay) { --marker-color: #1fa56a; }
  :global(.tone-shopping) { --marker-color: #7d4d7a; }
  :global(.tone-sight) { --marker-color: #c25a38; }
  :global(.tone-other) { --marker-color: #6f6a60; }

  @media (max-width: 720px) {
    .map-controls--left {
      top: 14px;
      left: 14px;
    }

    .map-controls span,
    .edit-link span {
      display: none;
    }

    .map-controls a,
    .edit-link {
      width: 3rem;
      padding: 0;
      justify-content: center;
    }

    .day-filter {
      top: 70px;
      max-width: calc(100vw - 28px);
    }

    .edit-link {
      top: 14px;
      right: 14px;
    }

    .legend {
      display: none;
    }

    .map-card {
      bottom: 82px;
    }
  }
</style>
