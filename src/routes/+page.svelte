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
      <h1>把旅遊行程變成真的 app，不只是 CSV 的包裝頁。</h1>
      <p>
        這個版本先專注把現有行程資料完整展示在新 app 裡，確認欄位、時間軸、分類摘要都正確，
        再接著做新增、刪除、編輯與 Google Drive 匯出。
      </p>
    </div>
    <div class="home-hero__panel card">
      <span>Stack</span>
      <strong>SvelteKit + TypeScript</strong>
      <strong>Cloudflare Workers + D1</strong>
      <strong>Places resolve + Drive export</strong>
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
          <h2>{trip.title}</h2>
          <p>{trip.travelerCount} 人旅程 · itinerary viewer</p>
        </div>
      </a>
    {/each}

    <article class="trip-card trip-card--new card">
      <div class="trip-card__body">
        <p class="eyebrow">Next step</p>
        <h2>下一階段會加入新建旅程</h2>
        <p>先把 viewer 校對完成，再補 create wizard、表單儲存與 CSV export flow。</p>
      </div>
    </article>
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
    line-height: 0.92;
    letter-spacing: 0;
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
    background:
      linear-gradient(180deg, rgba(255,255,255,.94), rgba(255,255,255,.82)),
      radial-gradient(circle at top right, rgba(49, 107, 255, 0.12), transparent 34%);
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

  .trip-card__body h2 {
    margin: 0 0 6px;
    font-size: 1.3rem;
  }

  .trip-card__body p {
    margin: 0;
    color: var(--muted);
  }

  .trip-card--new {
    min-height: 360px;
    display: grid;
    align-items: end;
    border-style: dashed;
    background:
      linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.76)),
      radial-gradient(circle at top left, rgba(255, 175, 42, 0.15), transparent 30%);
  }

  @media (max-width: 920px) {
    .home-hero {
      grid-template-columns: 1fr;
    }
  }
</style>
