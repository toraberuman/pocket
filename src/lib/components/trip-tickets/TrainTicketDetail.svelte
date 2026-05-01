<script lang="ts">
  import TransportTicketDetail from "$lib/components/trip-tickets/TransportTicketDetail.svelte";
  import type { TimelineActivity } from "$lib/view-models/trip";

  let { activity }: { activity: TimelineActivity } = $props();
</script>

<TransportTicketDetail {activity} mode="train" />
