<script lang="ts">
  import PocketIcon from "$lib/components/PocketIcon.svelte";
  import type { TimelineActivity } from "$lib/view-models/trip";
  import FlightTimelineCardContent from "$lib/components/trip-cards/FlightTimelineCardContent.svelte";
  import FoodTimelineCardContent from "$lib/components/trip-cards/FoodTimelineCardContent.svelte";
  import GenericTimelineCardContent from "$lib/components/trip-cards/GenericTimelineCardContent.svelte";
  import ShoppingTimelineCardContent from "$lib/components/trip-cards/ShoppingTimelineCardContent.svelte";
  import SightTimelineCardContent from "$lib/components/trip-cards/SightTimelineCardContent.svelte";
  import StayTimelineCardContent from "$lib/components/trip-cards/StayTimelineCardContent.svelte";
  import TrainTimelineCardContent from "$lib/components/trip-cards/TrainTimelineCardContent.svelte";
  import TransportTimelineCardContent from "$lib/components/trip-cards/TransportTimelineCardContent.svelte";

  const cardRegistry = {
    flight: FlightTimelineCardContent,
    train: TrainTimelineCardContent,
    transport: TransportTimelineCardContent,
    stay: StayTimelineCardContent,
    food: FoodTimelineCardContent,
    shopping: ShoppingTimelineCardContent,
    sight: SightTimelineCardContent,
    generic: GenericTimelineCardContent
  };

  let {
    activity,
    selected = false,
    editMode = false,
    editHref,
    onSelect
  }: {
    activity: TimelineActivity;
    selected?: boolean;
    editMode?: boolean;
    editHref?: string;
    onSelect: () => void;
  } = $props();

  function activityTypeClass(activity: TimelineActivity) {
    return `tone-${activity.type}`;
  }

  const CardContent = $derived(cardRegistry[activity.cardKind] ?? GenericTimelineCardContent);
</script>

<article class:selected class={`activity-card ${activityTypeClass(activity)}`}>
  <div class="activity-time">
    <span>{activity.time}</span>
    <em>{activity.label}</em>
  </div>

  <div class="activity-body">
    <span class="activity-icon">
      <PocketIcon name={activity.icon} size={16} />
    </span>
    <div>
      <CardContent {activity} {selected} {editMode} {editHref} />
    </div>
    <button type="button" class="open-card" onclick={onSelect} aria-label={`Open ${activity.title} details`}></button>
  </div>
</article>

<style>
  .activity-card {
    position: relative;
    width: 100%;
    display: grid;
    gap: .7rem;
    opacity: .55;
    transition: opacity 500ms ease;
  }

  .activity-card:hover,
  .activity-card.selected {
    opacity: 1;
  }

  .activity-time {
    display: flex;
    align-items: baseline;
    gap: .75rem;
  }

  .activity-time span {
    color: var(--color-foreground);
    font-size: 1.1rem;
    font-weight: 300;
    font-variant-numeric: tabular-nums;
  }

  .activity-time em,
  .activity-tags span {
    font-family: var(--font-pocket-mono);
    letter-spacing: .22em;
    text-transform: uppercase;
  }

  .activity-time em {
    color: var(--color-muted-foreground);
    font-size: .62rem;
    font-style: normal;
    letter-spacing: .15em;
  }

  .activity-body {
    position: relative;
    width: 100%;
    display: grid;
    grid-template-columns: 2rem minmax(0, 1fr);
    gap: 1rem;
    padding: 1.25rem;
    border-left: 2px solid color-mix(in srgb, var(--color-border) 70%, transparent);
    background: transparent;
    color: inherit;
    text-align: left;
    transition: border-color 500ms ease, background 500ms ease;
  }

  .activity-card.selected .activity-body {
    border-left-color: var(--color-accent);
    background: var(--color-card);
  }

  .activity-icon {
    width: 2rem;
    height: 2rem;
    display: inline-grid;
    place-items: center;
    background: var(--color-muted);
    color: var(--color-muted-foreground);
    font-size: .58rem;
    transition: background 500ms ease, color 500ms ease;
  }

  .activity-card.selected .activity-icon {
    background: var(--color-accent);
    color: var(--color-accent-foreground);
  }

  .activity-card.selected :global(h2) {
    color: var(--color-foreground);
  }

  .open-card {
    position: absolute;
    inset: 0;
    z-index: 1;
    border: 0;
    background: transparent;
    color: transparent;
    cursor: pointer;
  }
</style>
