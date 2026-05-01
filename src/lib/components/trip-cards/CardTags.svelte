<script lang="ts">
  let { tags }: { tags: string[] } = $props();
</script>

{#if tags.length}
  <div class="activity-tags">
    {#each tags as tag}
      <span>{tag}</span>
    {/each}
  </div>
{/if}

<style>
  .activity-tags {
    display: flex;
    flex-wrap: wrap;
    gap: .35rem;
    margin-top: .75rem;
  }

  .activity-tags span {
    padding: .12rem .45rem;
    background: var(--color-muted);
    color: var(--color-muted-foreground);
    font-family: var(--font-pocket-mono);
    font-size: .58rem;
    letter-spacing: .06em;
    text-transform: uppercase;
  }
</style>
