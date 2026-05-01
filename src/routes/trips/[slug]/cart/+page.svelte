<script lang="ts">
  import TripBottomNav from "$lib/components/TripBottomNav.svelte";
  import PocketIcon from "$lib/components/PocketIcon.svelte";
  import { categoryLabel } from "$lib/i18n/labels";
  import { formatCurrencyAmount } from "$lib/currencies";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const trip = $derived(data.trip);
  const items = $derived("items" in trip ? trip.items : []);
  const shoppingItems = $derived(items.filter((item) => item.category === "shopping"));

  function money(amount?: number, currency = "KRW") {
    if (!amount) return "";
    return formatCurrencyAmount(Math.round(amount), currency);
  }
</script>

<svelte:head>
  <title>{trip.title} · Cart</title>
</svelte:head>

<main class="section-page">
  <section class="section-shell">
    <header class="topbar">
      <a href={`/trips/${trip.slug}`} aria-label="Back to plan"><PocketIcon name="chevron-left" size={20} /></a>
      <span>Wish List</span>
      <a href={`/trips/${trip.slug}/edit`} aria-label="Open editor"><PocketIcon name="pencil" size={18} /></a>
    </header>

    <p class="eyebrow">Cart · Preview</p>
    <h1>The cart.</h1>

    {#if data.locked}
      <p class="lede">Open the plan page and enter the trip password first.</p>
    {:else if shoppingItems.length}
      <section class="cart-list" aria-label="Shopping items">
        {#each shoppingItems as item, index}
          <article>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>{item.place.name}</h2>
              <p>{categoryLabel(item.category)} · {item.paymentMethod || "未設定付款"}</p>
            </div>
            <strong>{money(item.amount, item.currency)}</strong>
          </article>
        {/each}
      </section>
    {:else}
      <p class="lede">Shopping and wishlist items will appear here.</p>
    {/if}
  </section>

  <TripBottomNav slug={trip.slug} active="cart" />
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
  .cart-list > article > span {
    font-family: var(--font-pocket-mono);
    letter-spacing: .18em;
    text-transform: uppercase;
  }

  .topbar span,
  .eyebrow,
  .cart-list p,
  .cart-list > article > span {
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

  .cart-list {
    display: grid;
    border-top: 1px solid var(--color-border);
  }

  article {
    display: grid;
    grid-template-columns: 2.4rem minmax(0, 1fr) auto;
    gap: 1rem;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: 1.1rem;
    font-weight: 400;
  }

  p {
    margin-top: .25rem;
  }

  strong {
    font-weight: 400;
    white-space: nowrap;
  }
</style>
