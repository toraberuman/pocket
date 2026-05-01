<script lang="ts">
  import type { TimelineActivity } from "$lib/view-models/trip";
  import CardTags from "$lib/components/trip-cards/CardTags.svelte";
  import CardTitleRow from "$lib/components/trip-cards/CardTitleRow.svelte";
  import { firstText, durationText } from "$lib/components/trip-tickets/ticket-utils";

  let {
    activity,
    editMode = false,
    editHref
  }: {
    activity: TimelineActivity;
    selected?: boolean;
    editMode?: boolean;
    editHref?: string;
  } = $props();

  const detail = $derived(activity.raw.detailJson || {});
  const fromCode = $derived(code(detail.fromAirportCode) || code(detail.fromCode) || "");
  const toCode = $derived(code(detail.toAirportCode) || code(detail.toCode) || "");
  const fromTerminal = $derived(terminal(firstText(detail.fromTerminal, detail.departureTerminal)));
  const toTerminal = $derived(terminal(firstText(detail.arrivalTerminal, detail.toTerminal)));
  const departTime = $derived(activity.time || firstText(detail.departureTime));
  const arriveTime = $derived(activity.raw.endTime || firstText(detail.arrivalTime));
  const flightDuration = $derived(durationText(activity) || durationBetween(departTime, arriveTime));
  const cabinClass = $derived(firstText(detail.cabinClass, detail.class));
  const flightTags = $derived([flightDuration, cabinClass].filter(Boolean));

  function code(value: unknown) {
    if (typeof value !== "string") return "";
    return value.match(/[A-Z]{3}/)?.[0] || "";
  }

  function terminal(value: string) {
    if (!value) return "";
    const normalized = value.replace(/^terminal\s*/i, "").replace(/^T\s*/i, "").trim();
    return normalized ? `T${normalized}` : "";
  }

  function durationBetween(start: string, end: string) {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    if (startMinutes === null || endMinutes === null) return "";
    const adjustedEnd = endMinutes < startMinutes ? endMinutes + 24 * 60 : endMinutes;
    const minutes = adjustedEnd - startMinutes;
    if (minutes <= 0) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours ? `${hours}h ${mins}m` : `${mins}m`;
  }

  function timeToMinutes(value: string) {
    const match = value.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    return hours * 60 + minutes;
  }
</script>

<CardTitleRow title={activity.title} {editMode} {editHref} />
{#if fromCode || toCode}
  <div class="flight-route">
    <div>
      <strong>{fromCode || activity.location}</strong>
      <span>{[fromTerminal, departTime].filter(Boolean).join(" · ")}</span>
    </div>
    <i></i>
    <div>
      <strong>{toCode || "Arrival"}</strong>
      <span>{[toTerminal, arriveTime].filter(Boolean).join(" · ")}</span>
    </div>
  </div>
{:else}
  <p>{activity.location}</p>
{/if}
<CardTags tags={flightTags} />

<style>
  p {
    margin: .4rem 0 0;
    color: var(--color-muted-foreground);
    font-size: .76rem;
  }

  .flight-route {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 3.5rem minmax(0, 1fr);
    gap: .75rem;
    align-items: center;
    margin-top: .55rem;
  }

  .flight-route div:last-child {
    text-align: right;
  }

  strong {
    display: block;
    font-size: 1.15rem;
    font-weight: 400;
  }

  span {
    display: block;
    margin-top: .25rem;
    color: var(--color-muted-foreground);
    font-family: var(--font-pocket-mono);
    font-size: .62rem;
    letter-spacing: .04em;
  }

  i {
    height: 1px;
    background: var(--color-border);
  }
</style>
