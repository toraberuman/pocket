<script lang="ts">
  import type { TimelineActivity } from "$lib/view-models/trip";
  import CardTags from "$lib/components/trip-cards/CardTags.svelte";
  import CardTitleRow from "$lib/components/trip-cards/CardTitleRow.svelte";

  let {
    activity,
    editMode = false,
    editHref
  }: {
    activity: TimelineActivity;
    selected?: boolean;
    editMode?: boolean;
    editHref?: string;
  } = $props();

  const detail = $derived(activity.raw.detailJson || {});
  const fromName = $derived(text(detail.fromName) || activity.raw.place.name);
  const toName = $derived(text(detail.toName) || activity.raw.place.nativeName || activity.raw.place.address || "");

  function text(value: unknown) {
    return typeof value === "string" && value.trim() ? value.trim() : "";
  }
</script>

<CardTitleRow title={activity.title} {editMode} {editHref} />
{#if toName}
  <div class="route">
    <span>{fromName}</span>
    <i></i>
    <span>{toName}</span>
  </div>
{:else}
  <p>{activity.location}</p>
{/if}
<CardTags tags={activity.tags} />

<style>
  p {
    margin: .4rem 0 0;
    color: var(--color-muted-foreground);
    font-size: .76rem;
  }

  .route {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 3.5rem minmax(0, 1fr);
    gap: .75rem;
    align-items: center;
    margin-top: .55rem;
    color: var(--color-foreground);
    font-size: .85rem;
  }

  .route span {
    min-width: 0;
  }

  .route span:last-child {
    text-align: right;
  }

  i {
    height: 1px;
    background: var(--color-border);
  }
</style>
