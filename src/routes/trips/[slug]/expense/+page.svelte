<script lang="ts">
  import TripBottomNav from "$lib/components/TripBottomNav.svelte";
  import PocketIcon from "$lib/components/PocketIcon.svelte";
  import { categoryLabel } from "$lib/i18n/labels";
  import { formatCurrencyAmount } from "$lib/currencies";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const trip = $derived(data.trip);
  const items = $derived("items" in trip ? trip.items : []);
  const paidItems = $derived(items.filter((item) => item.amount));
  const total = $derived(paidItems.reduce((sum, item) => sum + (item.amount ?? 0), 0));
  const rows = $derived.by(() => {
    const buckets = new Map<string, number>();
    for (const item of paidItems) {
      buckets.set(item.category, (buckets.get(item.category) ?? 0) + (item.amount ?? 0));
    }
    return [...buckets.entries()].map(([category, amount]) => ({ category, amount }));
  });

  function money(value: number) {
    return formatCurrencyAmount(Math.round(value), trip.defaultCurrency);
  }
</script>

<svelte:head>
  <title>{trip.title} · Expense</title>
</svelte:head>

<main class="section-page">
  <section class="section-shell">
    <header class="topbar">
      <a href={`/trips/${trip.slug}`} aria-label="Back to plan"><PocketIcon name="chevron-left" size={20} /></a>
      <span>Trip Ledger</span>
      <a href={`/trips/${trip.slug}/edit`} aria-label="Open editor"><PocketIcon name="pencil" size={18} /></a>
    </header>

    <p class="eyebrow">Expense · Preview</p>
    <h1>The budget.</h1>

    {#if data.locked}
      <p class="lede">Open the plan page and enter the trip password first.</p>
    {:else}
      <section class="hero-metric">
        <small>Recorded spend</small>
        <strong>{money(total)}</strong>
        <span>{paidItems.length} entries</span>
      </section>

      <section class="rows" aria-label="Expense categories">
        {#each rows as row}
          <article>
            <span>{categoryLabel(row.category)}</span>
            <strong>{money(row.amount)}</strong>
          </article>
        {/each}
      </section>
    {/if}
  </section>

  <TripBottomNav slug={trip.slug} active="expense" />
</main>

<style>
  .section-page {
    min-height: 100vh;
    padding: 2rem 1.25rem 6.5rem;
    background: var(--color-background);
    color: var(--color-foreground);
  }

  .section-shell {
    width: min(var(--content-pocket-sm), 100%);
    margin: 0 auto;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4rem;
  }

  .topbar a {
    width: 2.75rem;
    height: 2.75rem;
    display: grid;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--color-border) 70%, transparent);
    color: var(--color-foreground);
  }

  .topbar span,
  .eyebrow,
  .hero-metric small,
  .hero-metric span {
    font-family: var(--font-pocket-mono);
    letter-spacing: .18em;
    text-transform: uppercase;
  }

  .topbar span,
  .eyebrow {
    color: var(--color-muted-foreground);
    font-size: .7rem;
  }

  h1 {
    margin: 0 0 2.2rem;
    font-size: clamp(3.6rem, 15vw, 6.4rem);
    font-weight: 300;
    line-height: .86;
    letter-spacing: 0;
  }

  .lede {
    color: var(--color-muted-foreground);
    line-height: 1.8;
  }

  .hero-metric {
    display: grid;
    gap: .75rem;
    padding: 1.5rem 0;
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
  }

  .hero-metric small,
  .hero-metric span {
    color: var(--color-muted-foreground);
    font-size: .66rem;
  }

  .hero-metric strong {
    font-size: clamp(3.3rem, 14vw, 6rem);
    font-weight: 300;
    line-height: .9;
  }

  .rows {
    display: grid;
    margin-top: 2rem;
    border-top: 1px solid var(--color-border);
  }

  .rows article {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  .rows span {
    color: var(--color-foreground);
  }

  .rows strong {
    font-weight: 400;
  }
</style>
