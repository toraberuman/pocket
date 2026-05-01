<script lang="ts">
  import TripTimelineCard from "$lib/components/TripTimelineCard.svelte";
  import TripItemModal from "$lib/components/TripItemModal.svelte";
  import type { TimelineDay } from "$lib/view-models/trip";

  let { day, slug, editMode = false }: { day: TimelineDay; slug: string; editMode?: boolean } = $props();
  let selectedId = $state<string | null>(null);
  let detailId = $state<string | null>(null);

  const activeId = $derived.by(() => {
    if (selectedId && day.activities.some((activity) => activity.id === selectedId)) {
      return selectedId;
    }

    return day.activities[0]?.id ?? null;
  });

  const detailActivity = $derived(day.activities.find((activity) => activity.id === detailId) ?? null);

  function editHref(activityId: string) {
    return `/trips/${slug}/edit?day=${encodeURIComponent(day.date)}&item=${encodeURIComponent(activityId)}`;
  }
</script>

<section class="activity-list" aria-label={day.dayLabel}>
  {#each day.activities as activity}
    <TripTimelineCard
      {activity}
      selected={activeId === activity.id}
      {editMode}
      editHref={editHref(activity.id)}
      onSelect={() => {
        selectedId = activity.id;
        detailId = activity.id;
      }}
    />
  {/each}
</section>

{#if detailActivity}
  <TripItemModal
    activity={detailActivity}
    editHref={editMode ? editHref(detailActivity.id) : undefined}
    onClose={() => (detailId = null)}
  />
{/if}

<style>
  .activity-list {
    display: grid;
    gap: 1.5rem;
  }
</style>
