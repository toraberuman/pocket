<script lang="ts">
  import PocketIcon from "$lib/components/PocketIcon.svelte";
  import type { TimelineActivity } from "$lib/view-models/trip";
  import { airportCode, airportFullName, barcodeBars, detailOf, firstText, passengerRows } from "$lib/components/trip-tickets/ticket-utils";

  let { activity }: { activity: TimelineActivity } = $props();

  const detail = $derived(detailOf(activity));
  const passengers = $derived(passengerRows(activity));
  const flight = $derived({
    airline: firstText(detail.airline, activity.raw.place.name),
    flightNumber: firstText(detail.flightNumber, activity.title),
    fromCode: airportCode(detail.fromAirportCode) || airportCode(detail.fromCode) || "TPE",
    fromName: airportFullName(
      detail.fromAirportNameEn,
      detail.departureAirportNameEn,
      detail.fromAirportName,
      detail.departureAirportName,
      detail.fromName
    ) || "Departure",
    fromTerminal: firstText(detail.fromTerminal),
    toCode: airportCode(detail.toAirportCode) || airportCode(detail.toCode) || "PUS",
    toName: airportFullName(
      detail.toAirportNameEn,
      detail.arrivalAirportNameEn,
      detail.toAirportName,
      detail.arrivalAirportName,
      detail.toName
    ) || "Arrival",
    gate: firstText(detail.gate),
    cabinClass: firstText(detail.cabinClass, detail.class),
    confirmation: firstText(detail.bookingReference, detail.confirmationCode),
    departTime: activity.time,
    arriveTime: activity.raw.endTime || firstText(detail.arrivalTime) || "-"
  });
</script>

<section class="ticket flight-ticket" aria-label="Boarding pass">
  <div class="ticket-top">
    <div>
      <small>Boarding Pass</small>
      <strong>{flight.airline}</strong>
    </div>
    <div>
      <small>Flight</small>
      <strong>{flight.flightNumber}</strong>
    </div>
  </div>

  <div class="route">
    <div class="airport">
      <b>{flight.fromCode}</b>
      <span>{flight.fromName}</span>
    </div>
    <div class="route-line">
      <i></i>
      <PocketIcon name="plane" size={20} strokeWidth={1.9} />
      <i></i>
    </div>
    <div class="airport">
      <b>{flight.toCode}</b>
      <span>{flight.toName}</span>
    </div>
  </div>

  <div class="times">
    <div>
      <small>Depart</small>
      <strong>{flight.departTime}</strong>
    </div>
    <div>
      <small>Arrive</small>
      <strong>{flight.arriveTime}</strong>
    </div>
  </div>

  <div class="tear" aria-hidden="true"></div>

  <section class="passengers">
    <small>Passengers ({passengers.length})</small>
    {#each passengers as passenger}
      <div>
        <strong>{passenger.name}</strong>
        {#if passenger.seat}<span>Seat {passenger.seat}</span>{/if}
      </div>
    {/each}
  </section>

  <section class="facts">
    <div>
      <small>Class</small>
      <strong>{flight.cabinClass || "-"}</strong>
    </div>
    <div>
      <small>Terminal</small>
      <strong>{flight.fromTerminal || "-"}</strong>
    </div>
    <div>
      <small>Gate</small>
      <strong>{flight.gate || "-"}</strong>
    </div>
    <div>
      <small>Confirmation</small>
      <strong>{flight.confirmation || "-"}</strong>
    </div>
  </section>

  <div class="barcode" aria-hidden="true">
    {#each barcodeBars as width}
      <span style={`width:${width}px`}></span>
    {/each}
  </div>
</section>

<style>
  .ticket {
    --boarding-pass-type-scale: .96;
    --bp-airport-code-size: calc(36px * var(--boarding-pass-type-scale));
    --bp-airport-name-size: calc(11px * var(--boarding-pass-type-scale));
    --bp-time-label-size: calc(10px * var(--boarding-pass-type-scale));
    --bp-field-label-size: calc(9px * var(--boarding-pass-type-scale));
    --bp-field-content-size: calc(13px * var(--boarding-pass-type-scale));
    --bp-time-content-size: 20px;
    width: 100%;
    margin: 0 auto;
    overflow: visible;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    box-shadow: 0 24px 70px color-mix(in srgb, var(--color-foreground) 16%, transparent);
  }

  .ticket-top {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.4rem 1.6rem;
    background: var(--color-accent);
    color: var(--color-accent-foreground);
  }

  .ticket-top div:last-child,
  .route div:last-child,
  .times div:last-child {
    text-align: right;
  }

  small {
    display: block;
    font-family: var(--font-pocket-mono);
    font-size: var(--bp-field-label-size);
    letter-spacing: .18em;
    text-transform: uppercase;
    opacity: .68;
  }

  .ticket-top strong {
    display: block;
    margin-top: .45rem;
    color: currentColor;
    font-size: clamp(1.05rem, 4vw, 1.2rem);
    font-weight: 300;
    line-height: 1.15;
  }

  .ticket-top small {
    font-size: 10px;
  }

  .route {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(4.6rem, .72fr) minmax(0, 1fr);
    gap: .8rem;
    align-items: start;
    padding: 2rem 1.6rem 1.45rem;
  }

  b {
    display: block;
    color: var(--color-foreground);
    font-family: var(--font-pocket-sans);
    font-size: var(--bp-airport-code-size);
    font-weight: 300;
    line-height: 1;
    letter-spacing: 0;
  }

  .route span {
    display: block;
    margin-top: .45rem;
    color: var(--color-muted-foreground);
    font-family: var(--font-pocket-sans);
    font-size: var(--bp-airport-name-size);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .route-line {
    display: flex;
    align-items: center;
    align-self: start;
    gap: .65rem;
    min-height: var(--bp-airport-code-size);
    color: var(--color-accent);
  }

  .route-line i {
    height: 1px;
    flex: 1;
    background: var(--color-border);
  }

  .times {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0 1.6rem 1.7rem;
    border-bottom: 1px dashed var(--color-border);
  }

  .times small {
    font-size: var(--bp-time-label-size);
  }

  .times strong {
    display: block;
    margin-top: .5rem;
    font-family: var(--font-pocket-mono);
    font-size: var(--bp-time-content-size);
    font-weight: 300;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0;
    line-height: 1.05;
  }

  .tear {
    position: relative;
    height: 0;
  }

  .tear::before,
  .tear::after {
    content: "";
    position: absolute;
    top: -.55rem;
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 999px;
    background: var(--color-background);
  }

  .tear::before { left: -.55rem; }
  .tear::after { right: -.55rem; }

  .passengers {
    display: grid;
    gap: .65rem;
    padding: 1.6rem;
  }

  .passengers > small {
    margin-bottom: .25rem;
  }

  .passengers div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: .85rem 1rem;
    background: var(--color-muted);
  }

  .passengers strong,
  .facts strong {
    font-family: var(--font-pocket-sans);
    font-size: var(--bp-field-content-size);
  }

  .passengers span {
    flex: 0 0 auto;
    max-width: 42%;
    font-family: var(--font-pocket-sans);
    font-size: 10px;
    line-height: 1.25;
    text-align: right;
  }

  .passengers strong,
  .facts strong {
    font-weight: 500;
  }

  .passengers span {
    font-weight: 400;
  }

  .passengers span {
    color: var(--color-muted-foreground);
  }

  .facts {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.2rem;
    padding: 1.5rem 1.6rem;
    border-top: 1px solid var(--color-border);
  }

  .facts strong {
    display: block;
    margin-top: .45rem;
  }

  .barcode {
    display: flex;
    justify-content: center;
    gap: 2px;
    margin: 0 1.6rem 1.6rem;
    padding: 1rem;
    background: var(--color-muted);
  }

  .barcode span {
    height: 2.8rem;
    background: var(--color-foreground);
  }

  @media (max-width: 560px) {
    .ticket {
      width: 100%;
    }

    .ticket-top {
      padding: 1.2rem 1.25rem;
    }

    .route {
      grid-template-columns: minmax(0, 1fr) 4rem minmax(0, 1fr);
      gap: .55rem;
      padding-inline: 1.25rem;
    }

    .route-line {
      gap: .4rem;
      min-height: clamp(2.45rem, 11.2vw, 3.25rem);
    }

    .facts {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      padding-inline: 1.25rem;
    }

    .passengers,
    .times {
      padding-inline: 1.25rem;
    }

    .barcode {
      margin-inline: 1.25rem;
    }
  }
</style>
