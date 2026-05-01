<script lang="ts">
  import PocketIcon from "$lib/components/PocketIcon.svelte";
  import BusTicketDetail from "$lib/components/trip-tickets/BusTicketDetail.svelte";
  import FlightTicketDetail from "$lib/components/trip-tickets/FlightTicketDetail.svelte";
  import GenericItemDetail from "$lib/components/trip-tickets/GenericItemDetail.svelte";
  import RestaurantDetail from "$lib/components/trip-tickets/RestaurantDetail.svelte";
  import StayDetail from "$lib/components/trip-tickets/StayDetail.svelte";
  import TrainTicketDetail from "$lib/components/trip-tickets/TrainTicketDetail.svelte";
  import type { TimelineActivity } from "$lib/view-models/trip";

  let {
    activity,
    editHref,
    onClose
  }: {
    activity: TimelineActivity;
    editHref?: string;
    onClose: () => void;
  } = $props();

  const detailRegistry = {
    flight: FlightTicketDetail,
    train: TrainTicketDetail,
    bus: BusTicketDetail,
    stay: StayDetail,
    food: RestaurantDetail,
    generic: GenericItemDetail
  };

  const DetailComponent = $derived(detailRegistry[activity.detailKind] ?? GenericItemDetail);
  const isTicket = $derived(activity.detailKind === "flight" || activity.detailKind === "train" || activity.detailKind === "bus");
  const isDesignedDetail = $derived(isTicket || activity.detailKind === "stay" || activity.detailKind === "food");

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    }
  }
</script>

<div
  class="modal-backdrop"
  class:ticket-backdrop={isDesignedDetail}
  role="dialog"
  aria-modal="true"
  aria-labelledby="trip-item-title"
  tabindex="-1"
  onclick={handleBackdropClick}
  onkeydown={handleKeydown}
>
  <article class:ticket-shell={isDesignedDetail} class="detail-sheet">
    <button
      class:ticket-close={isTicket}
      class:designed-close={activity.detailKind === "stay" || activity.detailKind === "food"}
      class="close-button"
      type="button"
      aria-label="Close detail"
      onclick={onClose}
    >
      <PocketIcon name="x" size={18} />
    </button>

    {#if !isDesignedDetail}
      <header>
        <div>
          <p>{activity.label}</p>
          <h2 id="trip-item-title">{activity.title}</h2>
          <span>{activity.time} · {activity.location}</span>
        </div>
      </header>
    {/if}

    <DetailComponent {activity} />

    {#if activity.notes && !isDesignedDetail}
      <section class="notes">
        <small>Notes</small>
        <p>{activity.notes}</p>
      </section>
    {/if}

    {#if !isDesignedDetail && (activity.raw.place.mapsUrl || editHref)}
      <footer>
        {#if activity.raw.place.mapsUrl}
          <a href={activity.raw.place.mapsUrl} target="_blank" rel="noreferrer">Open in maps</a>
        {/if}
        {#if editHref}
          <a class="primary" href={editHref}>
            <PocketIcon name="edit" size={16} />
            Edit item
          </a>
        {/if}
      </footer>
    {/if}
  </article>
</div>

<style>
  .modal-backdrop {
    --modal-pocket-width: 430px;
    position: fixed;
    inset: 0;
    z-index: 80;
    display: grid;
    place-items: end center;
    padding: 1rem;
    overflow-x: hidden;
    overflow-y: auto;
    background: color-mix(in srgb, var(--color-foreground) 28%, transparent);
    backdrop-filter: blur(10px);
  }

  .ticket-backdrop {
    place-items: center;
    background: color-mix(in srgb, var(--color-foreground) 22%, transparent);
  }

  .detail-sheet {
    position: relative;
    width: min(var(--modal-pocket-width), calc(100vw - 1rem));
    max-height: min(86vh, 760px);
    overflow: auto;
    padding: 1.5rem;
    border: 1px solid color-mix(in srgb, var(--color-border) 70%, transparent);
    background: var(--color-card);
    box-shadow: 0 24px 70px color-mix(in srgb, var(--color-foreground) 16%, transparent);
  }

  .ticket-shell {
    width: min(var(--modal-pocket-width), calc(100vw - 1rem));
    max-height: none;
    overflow: visible;
    padding: 0 0 1.8rem;
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  .close-button {
    position: absolute;
    top: .9rem;
    right: .9rem;
    z-index: 5;
    width: 2.6rem;
    height: 2.6rem;
    display: grid;
    place-items: center;
    border: 0;
    background: transparent;
    color: var(--color-muted-foreground);
  }

  .ticket-close {
    top: auto;
    right: auto;
    bottom: 1.8rem;
    left: 50%;
    transform: translate(-50%, 50%);
    width: 2.85rem;
    height: 2.85rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-background);
    color: var(--color-foreground);
    box-shadow: 0 12px 28px color-mix(in srgb, var(--color-foreground) 14%, transparent);
  }

  .designed-close {
    top: 1.45rem;
    right: 1.45rem;
    width: 2.8rem;
    height: 2.8rem;
    background: color-mix(in srgb, var(--color-card) 86%, white);
    color: var(--color-muted-foreground);
  }

  header {
    padding-bottom: 1.2rem;
    border-bottom: 1px solid var(--color-border);
  }

  header p,
  header span,
  small {
    font-family: var(--font-pocket-mono);
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  header p {
    margin: 0 0 .7rem;
    color: var(--color-accent);
    font-size: .65rem;
  }

  h2 {
    margin: 0;
    font-size: clamp(1.8rem, 9vw, 3.2rem);
    font-weight: 300;
    line-height: .95;
    letter-spacing: 0;
  }

  header span {
    display: block;
    margin-top: .9rem;
    color: var(--color-muted-foreground);
    font-size: .68rem;
    letter-spacing: .08em;
  }

  .notes {
    margin-top: 1.4rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
  }

  small {
    color: var(--color-muted-foreground);
    font-size: .62rem;
  }

  .notes p {
    margin: .5rem 0 0;
    color: var(--color-muted-foreground);
    line-height: 1.8;
  }

  footer {
    display: flex;
    justify-content: end;
    gap: .75rem;
    margin-top: 1.5rem;
  }

  footer a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    min-height: 2.85rem;
    padding: 0 1rem;
    border: 1px solid var(--color-border);
    color: var(--color-foreground);
  }

  footer a.primary {
    border-color: var(--color-foreground);
    background: var(--color-foreground);
    color: var(--color-background);
  }

  @media (max-width: 560px) {
    .modal-backdrop {
      padding: 0;
    }

    .ticket-backdrop {
      place-items: end center;
      padding-block: 1rem;
    }

    .detail-sheet {
      width: min(var(--modal-pocket-width), calc(100vw - 1rem));
      max-height: 88vh;
      border-right: 0;
      border-bottom: 0;
      border-left: 0;
    }

    .ticket-shell {
      width: min(var(--modal-pocket-width), calc(100vw - 1rem));
      max-height: none;
      overflow: visible;
    }
  }
</style>
