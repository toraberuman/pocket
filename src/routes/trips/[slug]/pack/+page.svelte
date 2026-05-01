<script lang="ts">
  import type { PageData } from "./$types";
  import "../section.css";

  let { data }: { data: PageData } = $props();
  const trip = $derived(data.trip);
</script>

<svelte:head>
  <title>{trip.title} · Pack</title>
</svelte:head>

<main class="section-shell">
  <section class="section-phone">
    <header class="section-topbar">
      <a href={`/trips/${trip.slug}`} aria-label="Back to plan">‹</a>
      <span>Pack</span>
      <a href={`/trips/${trip.slug}/edit`} aria-label="Open editor">ED</a>
    </header>

    <p class="eyebrow">Packing list · Preview</p>
    <h1>The bag.</h1>
    <p class="lede">
      {#if data.locked}
        This trip is protected. Open the plan page and enter the trip password first.
      {:else}
        Packing checklist will be added here after the itinerary viewer settles.
      {/if}
    </p>

    <nav class="trip-tabbar" aria-label="Trip sections">
      <a href="/"><span>TR</span><small>Trips</small></a>
      <a href={`/trips/${trip.slug}`}><span>PL</span><small>Plan</small></a>
      <a href={`/trips/${trip.slug}/map`}><span>MP</span><small>Map</small></a>
      <a href={`/trips/${trip.slug}/budget`}><span>BD</span><small>Budget</small></a>
      <a class="active" href={`/trips/${trip.slug}/pack`} aria-current="page"><span>PK</span><small>Pack</small></a>
    </nav>
  </section>
</main>
