<script lang="ts">
  import PocketIcon from "$lib/components/PocketIcon.svelte";

  let {
    title,
    editMode = false,
    editHref
  }: {
    title: string;
    editMode?: boolean;
    editHref?: string;
  } = $props();
</script>

<h2>
  <span>{title}</span>
  {#if editMode && editHref}
    <a class="edit-item" href={editHref} aria-label={`Edit ${title}`}>
      <PocketIcon name="edit" size={15} />
    </a>
  {/if}
</h2>

<style>
  h2 {
    display: flex;
    align-items: center;
    gap: .45rem;
    margin: 0;
    color: color-mix(in srgb, var(--color-foreground) 72%, transparent);
    font-size: .95rem;
    font-weight: 400;
    line-height: 1.35;
    letter-spacing: 0;
    transition: color 500ms ease;
  }

  span {
    min-width: 0;
  }

  .edit-item {
    width: 1.4rem;
    height: 1.4rem;
    flex: 0 0 auto;
    display: inline-grid;
    place-items: center;
    color: var(--color-muted-foreground);
    transition: color 300ms ease;
    position: relative;
    z-index: 2;
  }

  .edit-item:hover {
    color: var(--color-accent);
  }
</style>
