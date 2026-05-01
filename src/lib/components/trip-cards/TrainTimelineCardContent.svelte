<script lang="ts">
  import type { TimelineActivity } from "$lib/view-models/trip";
  import CardTags from "$lib/components/trip-cards/CardTags.svelte";
  import CardTitleRow from "$lib/components/trip-cards/CardTitleRow.svelte";
  import { detailOf, durationText, firstText, passengerRows } from "$lib/components/trip-tickets/ticket-utils";

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

  const detail = $derived(detailOf(activity));
  const passengers = $derived(passengerRows(activity));
  const fromName = $derived(firstText(detail.fromStation, detail.fromName, activity.raw.place.name));
  const toName = $derived(firstText(detail.toStation, detail.toName, activity.raw.place.nativeName));
  const departTime = $derived(activity.time);
  const arriveTime = $derived(activity.raw.endTime || firstText(detail.arrivalTime));
  const trainDuration = $derived(durationText(activity) || durationBetween(departTime, arriveTime));
  const carriageClass = $derived(firstText(detail.carriageClass, detail.cabinClass, detail.class, passengers[0]?.className));
  const trainTags = $derived([carriageClass, trainDuration].filter(Boolean));

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
{#if fromName || toName}
  <div class="train-route">
    <div>
      <strong>{fromName || activity.location}</strong>
      {#if departTime}<span>{departTime}</span>{/if}
    </div>
    <i></i>
    <div>
      <strong>{toName || "Arrival"}</strong>
      {#if arriveTime}<span>{arriveTime}</span>{/if}
    </div>
  </div>
{:else}
  <p>{activity.location}</p>
{/if}
<CardTags tags={trainTags} />

<style>
  p {
    margin: .4rem 0 0;
    color: var(--color-muted-foreground);
    font-size: .76rem;
  }

  .train-route {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 3.5rem minmax(0, 1fr);
    gap: .75rem;
    align-items: center;
    margin-top: .55rem;
  }

  .train-route div:last-child {
    text-align: right;
  }

  strong {
    display: block;
    color: var(--color-foreground);
    font-size: .92rem;
    font-weight: 400;
    line-height: 1.25;
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
