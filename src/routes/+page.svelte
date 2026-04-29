<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Pocket Trips</title>
</svelte:head>

<main class="shell home">
  <section class="home-hero">
    <div class="home-hero__copy">
      <p class="eyebrow">Pocket Trips</p>
      <h1>Travel plans, but actually usable.</h1>
      <p>
        A trip viewer and editor built for real itineraries. Use preview mode for travelers, and switch into
        admin mode when you need to create trips, manage passwords, and update D1-backed data.
      </p>
    </div>

    <div class="home-hero__panel card">
      <span>Stack</span>
      <strong>SvelteKit + TypeScript</strong>
      <strong>Cloudflare Workers + D1</strong>
      <strong>Places resolve + trip access control</strong>
      {#if data.isAdmin}
        <div class="hero-actions">
          <a class="hero-action" href="/admin/trips/new">Create new trip</a>
          <form method="POST" action="/admin/logout">
            <button class="hero-action hero-action--secondary" type="submit">Log out</button>
          </form>
        </div>
      {:else}
        <a class="hero-action" href="/admin/login">Admin login</a>
      {/if}
    </div>
  </section>

  <section class="trip-grid">
    {#each data.trips as trip}
      <a class="trip-card card" href={`/trips/${trip.slug}`}>
        <div
          class="trip-card__cover"
          style={`background-image: linear-gradient(180deg, rgba(11,16,25,.08), rgba(11,16,25,.62)), url('${trip.coverImageUrl || ""}')`}
        >
          <div class="trip-card__overlay">
            <span>{trip.destination}</span>
            <strong>{trip.startDate} - {trip.endDate}</strong>
          </div>
        </div>
        <div class="trip-card__body">
          <div class="trip-card__title">
            <h2>{trip.title}</h2>
            {#if trip.isPrivate}<span class="trip-lock">Private</span>{/if}
          </div>
          <p>{trip.travelerCount} people</p>
        </div>
      </a>
    {/each}

    {#if data.isAdmin}
      <a class="trip-card trip-card--new card" href="/admin/trips/new">
        <div class="trip-card__body">
          <p class="eyebrow">Admin mode</p>
          <h2>Create a new trip</h2>
          <p>Set title, slug, dates, cover image, and separate view/edit passwords.</p>
        </div>
      </a>
    {/if}
  </section>
</main>

<style>
  .home {
    padding: 28px 0 64px;
  }

  .home-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 22px;
    align-items: end;
    padding: 20px 0 28px;
  }

  .home-hero__copy h1 {
    margin: 0 0 14px;
    font-size: clamp(2.9rem, 6vw, 5.2rem);
    line-height: 0.96;
    letter-spacing: 0;
    max-width: 10ch;
    text-wrap: pretty;
  }

  .home-hero__copy p:last-child {
    width: min(760px, 100%);
    margin: 0;
    color: var(--muted);
    font-size: 1.08rem;
  }

  .home-hero__panel {
    display: grid;
    gap: 10px;
    padding: 22px;
    background: #fff;
  }

  .home-hero__panel span {
    color: var(--muted);
    text-transform: uppercase;
    font-size: 0.82rem;
    font-weight: 700;
  }

  .home-hero__panel strong {
    font-size: 1.1rem;
    line-height: 1.3;
  }

  .hero-actions {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .hero-actions :global(form) {
    margin: 0;
  }

  .hero-action {
    margin-top: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    padding: 12px 16px;
    border-radius: 999px;
    background: #1d2433;
    color: white;
    border: 0;
    font: inherit;
    cursor: pointer;
  }

  .hero-actions .hero-action {
    margin-top: 0;
  }

  .hero-action--secondary {
    background: #eef1f5;
    color: #1d2433;
  }

  .eyebrow {
    margin: 0 0 12px;
    color: var(--muted);
    text-transform: uppercase;
    font-size: 0.82rem;
    font-weight: 700;
  }

  .trip-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 18px;
  }

  .trip-card {
    overflow: hidden;
  }

  .trip-card__cover {
    aspect-ratio: 1.18;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: end;
  }

  .trip-card__overlay {
    width: 100%;
    padding: 18px;
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 12px;
    color: white;
  }

  .trip-card__overlay span,
  .trip-card__overlay strong {
    display: block;
  }

  .trip-card__overlay span {
    font-size: 0.92rem;
    color: rgba(255,255,255,.75);
  }

  .trip-card__body {
    padding: 18px;
  }

  .trip-card__title {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: start;
  }

  .trip-card__body h2 {
    margin: 0 0 6px;
    font-size: 1.3rem;
  }

  .trip-card__body p {
    margin: 0;
    color: var(--muted);
  }

  .trip-lock {
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(20, 31, 49, 0.06);
    color: var(--muted);
    font-size: 0.76rem;
    font-weight: 700;
  }

  .trip-card--new {
    min-height: 360px;
    display: grid;
    align-items: end;
    border-style: dashed;
    background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,.88));
  }

  @media (max-width: 920px) {
    .home-hero {
      grid-template-columns: 1fr;
    }
  }
</style>
