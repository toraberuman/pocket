<script lang="ts">
  import GenericTimelineCardContent from "$lib/components/trip-cards/GenericTimelineCardContent.svelte";
  import type { TimelineActivity } from "$lib/view-models/trip";

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

<GenericTimelineCardContent {activity} {selected} {editMode} {editHref} />
