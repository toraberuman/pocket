<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import PocketIcon from "$lib/components/PocketIcon.svelte";
  import TripBottomNav from "$lib/components/TripBottomNav.svelte";
  import TripTimeline from "$lib/components/TripTimeline.svelte";
  import { toTripPlanView } from "$lib/view-models/trip";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const plan = $derived(data.locked ? null : toTripPlanView(data.trip));
  const slug = $derived(data.trip.slug);
  const canEdit = $derived(Boolean(data.canEdit));
  let currentDayIndex = $state(0);

  const currentDay = $derived(plan?.days[currentDayIndex]);

  function selectDay(index: number) {
    currentDayIndex = index;
  }

  function previousDay() {
    if (currentDayIndex > 0) selectDay(currentDayIndex - 1);
  }

  function nextDay() {
    if (plan && currentDayIndex < plan.days.length - 1) selectDay(currentDayIndex + 1);
  }

</script>

<svelte:head>
  <title>{data.trip.title} · Plan</title>
</svelte:head>

<main class="trip-layout">
  {#if data.locked}
    <section class="locked-card">
      <p>Protected Trip</p>
      <h1>{data.trip.title}</h1>
      <span>Enter the trip password to view this itinerary.</span>
      {#if form?.message}<strong>{form.message}</strong>{/if}
      <form method="post">
        <input type="password" name="password" placeholder="Trip password" required />
        <button type="submit" formaction="?/unlock">Unlock</button>
      </form>
    </section>
  {:else if plan}
    <section class="plan-shell">
      <header class="plan-header">
        <p>Itinerary</p>
        <div class="title-row">
          <h1>{plan.title}</h1>
        </div>
        <span>{plan.dateRange}</span>
      </header>

      <nav class="day-carousel" aria-label="Trip days">
        <button type="button" onclick={previousDay} disabled={currentDayIndex === 0} aria-label="Previous day">
          <PocketIcon name="chevron-left" size={20} />
        </button>
        <div>
          {#each plan.days as day, index}
            <button
              type="button"
              class:active={index === currentDayIndex}
              onclick={() => selectDay(index)}
            >
              <span>{day.dayLabel}</span>
              <small>{day.shortDate}</small>
            </button>
          {/each}
        </div>
        <button
          type="button"
          onclick={nextDay}
          disabled={currentDayIndex >= plan.days.length - 1}
          aria-label="Next day"
        >
          <PocketIcon name="chevron-right" size={20} />
        </button>
      </nav>

      <div class="map-link-row">
        <a href={`/trips/${slug}/map`}>
          <PocketIcon name="map" size={16} />
          <small>View on Map</small>
        </a>
      </div>

      {#if currentDay}
        <TripTimeline day={currentDay} {slug} editMode={canEdit} />
      {/if}

      <div class="day-progress" aria-label="Day progress">
        {#each plan.days as day, index}
          <button
            type="button"
            class:active={index === currentDayIndex}
            onclick={() => selectDay(index)}
            aria-label={`Go to ${day.dayLabel}`}
          ></button>
        {/each}
      </div>
    </section>

    <TripBottomNav {slug} active="plan" />
    {#if canEdit}
      <a class="floating-add" href={`/trips/${slug}/edit?day=${encodeURIComponent(currentDay?.date || "")}`} aria-label="Add trip item">
        <PocketIcon name="calendar-plus" size={22} />
      </a>
    {/if}
  {/if}
</main>

<style>
  .trip-layout {
    min-height: 100vh;
    padding: 3rem 1.5rem 6.5rem;
    background: var(--color-background);
    color: var(--color-foreground);
  }

  .plan-shell,
  .locked-card {
    width: min(var(--content-pocket-sm), 100%);
    margin: 0 auto;
  }

  .plan-header {
    margin-bottom: 4rem;
    text-align: center;
  }

  .plan-header p,
  .plan-header span,
  .day-carousel span,
  .map-link-row small,
  .locked-card p {
    font-family: var(--font-pocket-mono);
    letter-spacing: .22em;
    text-transform: uppercase;
  }

  .plan-header p {
    margin: 0 0 1rem;
    color: var(--color-muted-foreground);
    font-size: .62rem;
  }

  .plan-header h1 {
    margin: 0;
    font-size: clamp(1.5rem, 5vw, 1.9rem);
    font-weight: 300;
    letter-spacing: 0;
  }

  .title-row {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .7rem;
    max-width: 100%;
  }

  .plan-header span {
    display: block;
    margin-top: .75rem;
    color: var(--color-muted-foreground);
    font-size: .8rem;
    letter-spacing: 0;
    text-transform: none;
  }

  .day-carousel {
    display: grid;
    grid-template-columns: 2.5rem minmax(0, 1fr) 2.5rem;
    gap: .75rem;
    align-items: center;
    margin-bottom: 2.5rem;
  }

  .day-carousel > button,
  .day-carousel div button {
    border: 0;
    background: transparent;
    color: var(--color-foreground);
  }

  .day-carousel > button {
    height: 2.5rem;
    color: var(--color-foreground);
    font-size: 1.6rem;
  }

  .day-carousel > button:disabled {
    color: var(--color-border);
  }

  .day-carousel div {
    display: flex;
    justify-content: space-between;
    gap: .35rem;
    overflow: visible;
  }

  .day-carousel div button {
    flex: 1 1 0;
    min-width: 0;
    opacity: .42;
    transition: opacity 500ms ease, color 500ms ease;
  }

  .day-carousel div button.active,
  .day-carousel div button:hover {
    opacity: 1;
  }

  .day-carousel span,
  .day-carousel small {
    display: block;
  }

  .day-carousel span {
    color: var(--color-muted-foreground);
    font-size: clamp(.5rem, 1.8vw, .62rem);
    white-space: nowrap;
  }

  .day-carousel button.active span {
    color: var(--color-accent);
  }

  .day-carousel small {
    margin-top: .25rem;
    color: var(--color-muted-foreground);
    font-size: clamp(.64rem, 2.4vw, .75rem);
    font-weight: 300;
  }

  .map-link-row {
    display: flex;
    justify-content: center;
    margin-bottom: 2.5rem;
  }

  .map-link-row a {
    display: inline-flex;
    align-items: center;
    gap: .55rem;
    padding: .62rem 1rem;
    border: 1px solid color-mix(in srgb, var(--color-border) 65%, transparent);
    color: var(--color-muted-foreground);
    transition: border-color 300ms ease, color 300ms ease;
  }

  .map-link-row a:hover {
    border-color: color-mix(in srgb, var(--color-accent) 45%, transparent);
    color: var(--color-foreground);
  }

  .day-progress {
    display: flex;
    justify-content: center;
    gap: .45rem;
    margin-top: 3rem;
  }

  .day-progress button {
    width: .5rem;
    height: .12rem;
    border: 0;
    background: var(--color-border);
    transition: width 500ms ease, background 500ms ease;
  }

  .day-progress button.active {
    width: 2rem;
    background: var(--color-accent);
  }

  .floating-add {
    position: fixed;
    right: max(1rem, calc((100vw - var(--content-pocket-sm)) / 2 + 1rem));
    bottom: 5.2rem;
    z-index: 60;
    width: 3.4rem;
    height: 3.4rem;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: var(--color-accent);
    color: var(--color-accent-foreground);
    box-shadow: 0 18px 42px color-mix(in srgb, var(--color-accent) 28%, transparent);
  }

  .locked-card {
    margin-top: 18vh;
    padding: 1.5rem;
    border: 1px solid color-mix(in srgb, var(--color-border) 65%, transparent);
    background: var(--color-card);
  }

  .locked-card p {
    margin: 0 0 .75rem;
    color: var(--color-muted-foreground);
    font-size: .62rem;
  }

  .locked-card h1 {
    margin: 0 0 1rem;
    font-size: 1.5rem;
    font-weight: 300;
  }

  .locked-card span {
    display: block;
    margin-bottom: 1.25rem;
    color: var(--color-foreground);
  }

  .locked-card strong {
    display: block;
    margin-bottom: .75rem;
    color: var(--color-accent);
  }

  .locked-card form {
    display: flex;
    gap: .75rem;
  }

  .locked-card input {
    min-width: 0;
    flex: 1;
    border: 1px solid var(--color-border);
    background: transparent;
    padding: .8rem .9rem;
  }

  .locked-card button {
    border: 1px solid var(--color-foreground);
    background: transparent;
    color: var(--color-foreground);
    padding: .8rem 1rem;
  }

  @media (min-width: 900px) {
    .trip-layout {
      padding-top: 4rem;
    }
  }
</style>
