<script lang="ts">
  import type { PageData } from "./$types";
  import PocketIcon from "$lib/components/PocketIcon.svelte";
  import { toTripListCard } from "$lib/view-models/trip";

  let { data }: { data: PageData } = $props();

  const tripCards = $derived((data.trips ?? []).map((trip) => toTripListCard(trip)));

  const statusLabels = {
    upcoming: "Upcoming",
    ongoing: "In Progress",
    completed: "Completed"
  };
</script>

<svelte:head>
  <title>Pocket Trips</title>
</svelte:head>

<main class="pocket-page">
  <div class="trip-list-shell">
    <header class="trip-list-header">
      <p>Pocket</p>
      <h1>Your Trips</h1>
    </header>

    <section class="trip-list" aria-label="Trips">
      {#each tripCards as trip}
        <a class="trip-row" href={`/trips/${trip.slug}`}>
          <div class="trip-row__content">
            <span class="trip-status">{trip.isPrivate ? "Private" : statusLabels[trip.status]}</span>
            <h2>{trip.title}</h2>
            <div class="trip-meta">
              <span aria-hidden="true"><PocketIcon name="map-pin" size={12} /></span>
              <p>{trip.destination}</p>
              <span aria-hidden="true"><PocketIcon name="calendar" size={12} /></span>
              <p>{trip.dateRange}</p>
            </div>
          </div>
          <span class="trip-row__arrow" aria-hidden="true">›</span>
        </a>
      {/each}

      {#if !tripCards.length}
        <div class="empty-state">
          <p>No trips yet.</p>
          <a href="/admin/trips/new">Create your first trip</a>
        </div>
      {/if}
    </section>

    <footer class="trip-list-footer">
      {#if data.isAdmin}
        <a href="/admin/trips/new">+ New Trip</a>
        <form method="POST" action="/admin/logout">
          <button type="submit">Log out</button>
        </form>
      {:else}
        <a href="/admin/login">Admin Login</a>
      {/if}
    </footer>
  </div>
</main>

<style>
  .pocket-page {
    min-height: 100vh;
    padding: var(--space-pocket-page-y) var(--space-pocket-page-x);
    background: var(--color-background);
    color: var(--color-foreground);
  }

  .trip-list-shell {
    width: min(var(--content-pocket-sm), 100%);
    margin: 0 auto;
  }

  .trip-list-header {
    margin-bottom: 4rem;
    text-align: center;
  }

  .trip-list-header p,
  .trip-status,
  .trip-meta,
  .trip-list-footer,
  .empty-state {
    font-family: var(--font-pocket-mono);
    letter-spacing: .24em;
    text-transform: uppercase;
  }

  .trip-list-header p {
    margin: 0 0 1rem;
    color: var(--color-muted-foreground);
    font-size: .62rem;
  }

  .trip-list-header h1 {
    margin: 0;
    color: var(--color-foreground);
    font-size: clamp(1.5rem, 5vw, 1.9rem);
    font-weight: 300;
    letter-spacing: 0;
  }

  .trip-list {
    display: grid;
    gap: 1rem;
  }

  .trip-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1.5rem;
    align-items: start;
    padding: 1.5rem;
    border: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
    background: var(--color-card);
    transition:
      border-color 500ms ease,
      color 500ms ease,
      transform 500ms ease;
  }

  .trip-row:hover {
    border-color: color-mix(in srgb, var(--color-accent) 35%, transparent);
    transform: translateY(-1px);
  }

  .trip-status {
    display: inline-block;
    margin-bottom: .75rem;
    padding: .18rem .5rem;
    background: var(--color-muted);
    color: var(--color-muted-foreground);
    font-size: .56rem;
    letter-spacing: .08em;
  }

  .trip-row h2 {
    margin: 0 0 .55rem;
    color: var(--color-foreground);
    font-size: 1.06rem;
    font-weight: 400;
    line-height: 1.25;
    letter-spacing: 0;
    transition: color 500ms ease;
  }

  .trip-row:hover h2 {
    color: var(--color-accent);
  }

  .trip-meta {
    display: flex;
    flex-wrap: wrap;
    gap: .45rem .9rem;
    align-items: center;
    color: var(--color-muted-foreground);
    font-size: .72rem;
    letter-spacing: 0;
    text-transform: none;
  }

  .trip-meta span {
    color: color-mix(in srgb, var(--color-muted-foreground) 78%, transparent);
    font-size: .58rem;
    letter-spacing: .1em;
  }

  .trip-meta p {
    margin: 0;
  }

  .trip-row__arrow {
    margin-top: .2rem;
    color: var(--color-muted-foreground);
    font-size: 1.45rem;
    line-height: 1;
    transition: color 500ms ease;
  }

  .trip-row:hover .trip-row__arrow {
    color: var(--color-accent);
  }

  .trip-list-footer {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
    color: var(--color-muted-foreground);
    font-size: .68rem;
    letter-spacing: .08em;
  }

  .trip-list-footer form {
    margin: 0;
  }

  .trip-list-footer a,
  .trip-list-footer button,
  .empty-state a {
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-transform: uppercase;
    transition: color 300ms ease;
  }

  .trip-list-footer a:hover,
  .trip-list-footer button:hover,
  .empty-state a:hover {
    color: var(--color-accent);
  }

  .empty-state {
    padding: 2rem 1rem;
    border: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
    color: var(--color-muted-foreground);
    text-align: center;
    font-size: .72rem;
    letter-spacing: .08em;
  }

  .empty-state p {
    margin: 0 0 1rem;
  }
</style>
