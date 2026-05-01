<script lang="ts">
  import type { TimelineActivity } from "$lib/view-models/trip";

  let { activity }: { activity: TimelineActivity } = $props();

  const detailRows = $derived.by(() => {
    const detail = activity.raw.detailJson || {};
    return Object.entries(detail)
      .filter(([, value]) => value !== undefined && value !== null && String(value).trim())
      .map(([key, value]) => ({
        key: formatKey(key),
        value: String(value)
      }));
  });

  function formatKey(key: string) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
  }
</script>

{#if activity.tags.length}
  <div class="tags">
    {#each activity.tags as tag}
      <span>{tag}</span>
    {/each}
  </div>
{/if}

{#if detailRows.length}
  <section class="detail-grid" aria-label="Item details">
    {#each detailRows as row}
      <div>
        <small>{row.key}</small>
        {#if /^https?:\/\//i.test(row.value)}
          <a href={row.value} target="_blank" rel="noreferrer">{row.value}</a>
        {:else}
          <strong>{row.value}</strong>
        {/if}
      </div>
    {/each}
  </section>
{/if}

<style>
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: .45rem;
    margin: 1.2rem 0;
  }

  .tags span,
  small {
    font-family: var(--font-pocket-mono);
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .tags span {
    padding: .2rem .55rem;
    border: 1px solid var(--color-border);
    color: var(--color-muted-foreground);
    font-size: .58rem;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-top: 1px solid var(--color-border);
  }

  .detail-grid div {
    display: grid;
    gap: .45rem;
    padding: 1rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  .detail-grid div:nth-child(odd) {
    padding-right: .8rem;
  }

  .detail-grid div:nth-child(even) {
    padding-left: .8rem;
  }

  small {
    color: var(--color-muted-foreground);
    font-size: .62rem;
  }

  strong,
  a {
    color: var(--color-foreground);
    font-weight: 400;
    overflow-wrap: anywhere;
  }

  @media (max-width: 560px) {
    .detail-grid {
      grid-template-columns: 1fr;
    }

    .detail-grid div:nth-child(n) {
      padding-right: 0;
      padding-left: 0;
    }
  }
</style>
