<script lang="ts">
  import type { TimelineActivity } from "$lib/view-models/trip";
  import CardTags from "$lib/components/trip-cards/CardTags.svelte";
  import CardTitleRow from "$lib/components/trip-cards/CardTitleRow.svelte";

  let {
    activity,
    selected = false,
    editMode = false,
    editHref
  }: {
    activity: TimelineActivity;
    selected?: boolean;
    editMode?: boolean;
    editHref?: string;
  } = $props();
</script>

<CardTitleRow title={activity.title} {editMode} {editHref} />
<p>{activity.location}</p>
<CardTags tags={activity.tags} />
{#if activity.notes && selected}
  <blockquote>{activity.notes}</blockquote>
{/if}

<style>
  p {
    margin: .4rem 0 0;
    color: var(--color-muted-foreground);
    font-size: .76rem;
  }

  blockquote {
    margin: 1rem 0 0;
    padding-left: .75rem;
    border-left: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
    color: var(--color-muted-foreground);
    font-size: .76rem;
    line-height: 1.7;
  }
</style>
