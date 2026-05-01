<script lang="ts">
  import TripBottomNav from "$lib/components/TripBottomNav.svelte";
  import PocketIcon from "$lib/components/PocketIcon.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const trip = $derived(data.trip);
  const checklist = [
    { section: "Documents", items: ["Passport", "Hotel bookings", "Travel insurance"] },
    { section: "Daily", items: ["Charger", "Medicine", "Umbrella"] },
    { section: "Travel", items: ["Transit card", "SIM / eSIM", "Cash"] }
  ];
</script>

<svelte:head>
  <title>{trip.title} · Package</title>
</svelte:head>

<main class="section-page">
  <section class="section-shell">
    <header class="topbar">
      <a href={`/trips/${trip.slug}`} aria-label="Back to plan"><PocketIcon name="chevron-left" size={20} /></a>
      <span>Packing List</span>
      <a href={`/trips/${trip.slug}/edit`} aria-label="Open editor"><PocketIcon name="pencil" size={18} /></a>
    </header>

    <p class="eyebrow">5 of 9 packed</p>
    <h1>The bag.</h1>

    {#if data.locked}
      <p class="lede">Open the plan page and enter the trip password first.</p>
    {:else}
      <section class="progress" aria-label="Packing progress"><span></span></section>

      <div class="checklist">
        {#each checklist as group}
          <section>
            <header>
              <h2>{group.section}</h2>
              <small>{group.items.length}</small>
            </header>
            {#each group.items as item, index}
              <label>
                <input type="checkbox" checked={index === 0} />
                <span>{item}</span>
              </label>
            {/each}
          </section>
        {/each}
      </div>
    {/if}
  </section>

  <TripBottomNav slug={trip.slug} active="package" />
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
  header small {
    font-family: var(--font-pocket-mono);
    letter-spacing: .18em;
    text-transform: uppercase;
  }

  .topbar span,
  .eyebrow,
  header small {
    color: var(--color-muted-foreground);
    font-size: .7rem;
  }

  h1 {
    margin: 0 0 1rem;
    font-size: clamp(3.6rem, 15vw, 6.4rem);
    font-weight: 300;
    line-height: .86;
    letter-spacing: 0;
  }

  .lede {
    color: var(--color-muted-foreground);
    line-height: 1.8;
  }

  .progress {
    height: .32rem;
    margin: 1.8rem 0 2.5rem;
    background: var(--color-muted);
  }

  .progress span {
    display: block;
    width: 56%;
    height: 100%;
    background: var(--color-foreground);
  }

  .checklist {
    display: grid;
    gap: 2rem;
  }

  .checklist section {
    border-top: 1px solid var(--color-border);
  }

  .checklist header,
  label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  h2 {
    margin: 1rem 0;
    font-size: 1.35rem;
    font-weight: 300;
  }

  label {
    justify-content: flex-start;
    padding: .8rem 0;
    border-top: 1px solid color-mix(in srgb, var(--color-border) 55%, transparent);
    color: var(--color-muted-foreground);
  }

  input {
    width: 1.05rem;
    height: 1.05rem;
    accent-color: var(--color-foreground);
  }

  input:checked + span {
    color: color-mix(in srgb, var(--color-muted-foreground) 70%, transparent);
    text-decoration: line-through;
  }
</style>
