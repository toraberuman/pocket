<script lang="ts">
  import type { PageData } from "./$types";
  import { formatCurrencyAmount } from "$lib/currencies";
  import "../section.css";

  let { data }: { data: PageData } = $props();
  const trip = $derived(data.trip);
  const items = $derived("items" in trip ? trip.items : []);
  const total = $derived(items.reduce((sum, item) => sum + (item.amount ?? 0), 0));
</script>

<svelte:head>
  <title>{trip.title} Budget</title>
</svelte:head>

<main class="section-shell">
  <section class="section-phone">
    <header class="section-topbar">
      <a href={`/trips/${trip.slug}`} aria-label="Back to plan">←</a>
      <span>Budget</span>
      <a href={`/trips/${trip.slug}/edit`} aria-label="Open editor">ED</a>
    </header>

    <p class="eyebrow">Trip ledger / Preview</p>
    <h1>The budget.</h1>
    {#if data.locked}
      <p class="lede">This trip is protected. Open the plan page and enter the trip password first.</p>
    {:else}
      <section class="budget-hero">
        <small>Recorded spend</small>
        <strong>{formatCurrencyAmount(Math.round(total), trip.defaultCurrency)}</strong>
        <span>{items.filter((item) => item.amount).length} entries</span>
      </section>
      <p class="lede">Detailed split bills and card reconciliation will be added here next.</p>
    {/if}

    <nav class="trip-tabbar" aria-label="Trip sections">
      <a href="/"><span>TR</span><small>Trips</small></a>
      <a href={`/trips/${trip.slug}`}><span>PL</span><small>Plan</small></a>
      <a href={`/trips/${trip.slug}/map`}><span>MP</span><small>Map</small></a>
      <a class="active" href={`/trips/${trip.slug}/budget`} aria-current="page"><span>BD</span><small>Budget</small></a>
      <a href={`/trips/${trip.slug}/pack`}><span>PK</span><small>Pack</small></a>
    </nav>
  </section>
</main>
