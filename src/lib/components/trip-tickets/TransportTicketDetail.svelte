<script lang="ts">
  import PocketIcon from "$lib/components/PocketIcon.svelte";
  import type { TimelineActivity } from "$lib/view-models/trip";
  import { detailOf, durationText, fareText, firstText, passengerRows, qrBlocks } from "$lib/components/trip-tickets/ticket-utils";

  let { activity, mode }: { activity: TimelineActivity; mode: "train" | "bus" } = $props();

  const detail = $derived(detailOf(activity));
  const passengers = $derived(passengerRows(activity));
  const ticket = $derived({
    operator: firstText(detail.operator, detail.provider, activity.raw.place.name),
    line: firstText(detail.line, detail.routeName, detail.trainType),
    number: firstText(detail.trainNumber, detail.routeNumber, detail.routeName),
    from: firstText(detail.fromStation, detail.fromName, activity.raw.place.name),
    fromPlatform: firstText(detail.fromPlatform, detail.platform),
    to: firstText(detail.toStation, detail.toName, activity.raw.place.nativeName),
    toPlatform: firstText(detail.toPlatform),
    departTime: activity.time,
    arriveTime: activity.raw.endTime || firstText(detail.arrivalTime) || "-",
    duration: durationText(activity) || durationBetween(activity.time, activity.raw.endTime || firstText(detail.arrivalTime)),
    className: firstText(detail.carriageClass, detail.cabinClass, detail.class, passengers[0]?.className),
    fare: firstText(detail.fare) || fareText(activity),
    confirmation: firstText(detail.reservationCode, detail.bookingReference, detail.confirmationCode)
  });

  const accentClass = $derived(mode === "bus" ? "bus-ticket" : "train-ticket");
  const title = $derived(mode === "bus" ? "Bus Ticket" : "Train Ticket");
  const numberLabel = $derived(mode === "bus" ? "Route" : "Train");

  function durationBetween(start: string, end: string) {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    if (startMinutes === null || endMinutes === null) return "";
    const adjustedEnd = endMinutes < startMinutes ? endMinutes + 24 * 60 : endMinutes;
    const minutes = adjustedEnd - startMinutes;
    if (minutes <= 0) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours ? `${hours}h ${mins}m` : `${mins}m`;
  }

  function timeToMinutes(value: string) {
    const match = value.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    return hours * 60 + minutes;
  }
</script>

<section class={`ticket ${accentClass}`} aria-label={title}>
  <div class="ticket-top">
    <div class="operator">
      <span>
        <PocketIcon name={mode === "bus" ? "bus" : "train"} size={24} />
      </span>
      <div>
        <small>{title}</small>
        <strong>{ticket.operator}</strong>
      </div>
    </div>
    {#if ticket.number}
      <div class="number">
        <small>{numberLabel}</small>
        <strong>{ticket.number}</strong>
      </div>
    {/if}
    {#if ticket.line}<p>{ticket.line}</p>{/if}
  </div>

  <div class="route">
    <div>
      <small>From</small>
      <b>{ticket.from}</b>
      {#if ticket.fromPlatform}<span>Platform {ticket.fromPlatform}</span>{/if}
    </div>
    <div class="route-line">
      <div>
        <i></i>
        <PocketIcon name={mode === "bus" ? "bus" : "train"} size={17} />
        <i class="filled"></i>
      </div>
      {#if ticket.duration}<span>{ticket.duration}</span>{/if}
    </div>
    <div>
      <small>To</small>
      <b>{ticket.to}</b>
      {#if ticket.toPlatform}<span>Platform {ticket.toPlatform}</span>{/if}
    </div>
  </div>

  <div class="times">
    <div>
      <small>Depart</small>
      <strong>{ticket.departTime}</strong>
    </div>
    <div>
      <small>Arrive</small>
      <strong>{ticket.arriveTime}</strong>
    </div>
  </div>

  <div class="tear" aria-hidden="true"></div>

  <section class="passengers">
    <small>Passengers ({passengers.length})</small>
    {#each passengers as passenger}
      <div>
        <strong>{passenger.name}</strong>
        <span>
          {#if passenger.className}{passenger.className}{/if}
          {#if passenger.className && (passenger.car || passenger.seat)} · {/if}
          {#if passenger.car}Car {passenger.car}{/if}
          {#if passenger.car && passenger.seat} · {/if}
          {#if passenger.seat}Seat {passenger.seat}{/if}
        </span>
      </div>
    {/each}
  </section>

  <section class="facts">
    <div>
      <small>Class</small>
      <strong>{ticket.className || "-"}</strong>
    </div>
    <div>
      <small>Fare</small>
      <strong>{ticket.fare || "-"}</strong>
    </div>
    <div>
      <small>Confirmation</small>
      <strong>{ticket.confirmation || "-"}</strong>
    </div>
  </section>

  <div class="qr" aria-hidden="true">
    <div>
      {#each Array.from({ length: 49 }) as _, index}
        <span class:filled={qrBlocks.includes(index)}></span>
      {/each}
    </div>
  </div>
  <p class="scan">Scan at gate</p>
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
    background: var(--color-card);
    border: 1px solid var(--color-border);
    box-shadow: 0 24px 70px color-mix(in srgb, var(--color-foreground) 16%, transparent);
  }

  .ticket-top {
    position: relative;
    display: grid;
    gap: .8rem;
    padding: 1.6rem;
    background: var(--ticket-accent);
    color: white;
  }

  .train-ticket {
    --ticket-accent: var(--color-accent);
  }

  .bus-ticket {
    --ticket-accent: #4f8377;
  }

  .operator {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .operator > span {
    width: 3.4rem;
    height: 3.4rem;
    display: grid;
    place-items: center;
    background: rgba(255,255,255,.16);
  }

  .number {
    position: absolute;
    top: 1.6rem;
    right: 1.6rem;
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
    font-family: var(--font-pocket-sans);
    font-size: clamp(1.05rem, 4vw, 1.2rem);
    font-weight: 300;
    line-height: 1.15;
  }

  .ticket-top p {
    margin: 0;
    color: rgba(255,255,255,.62);
    font-family: var(--font-pocket-mono);
    font-size: var(--bp-field-content-size);
  }

  .route {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(6rem, .7fr) minmax(0, 1fr);
    gap: 1rem;
    align-items: start;
    padding: 2rem 1.6rem 1.4rem;
    border-bottom: 1px solid var(--color-border);
  }

  .route > div:last-child {
    text-align: right;
  }

  b {
    display: block;
    margin-top: .55rem;
    color: var(--color-foreground);
    font-family: var(--font-pocket-sans);
    font-size: var(--bp-airport-code-size);
    font-weight: 300;
    line-height: 1;
    letter-spacing: 0;
  }

  .route span {
    display: block;
    margin-top: .55rem;
    color: var(--color-muted-foreground);
    font-family: var(--font-pocket-sans);
    font-size: var(--bp-airport-name-size);
    line-height: 1.35;
  }

  .route-line {
    display: grid;
    place-items: center;
    align-self: start;
    min-height: var(--bp-airport-code-size);
    margin-top: calc(var(--bp-field-label-size) + .55rem);
    color: var(--ticket-accent);
  }

  .route-line div {
    display: flex;
    align-items: center;
    gap: .5rem;
    width: 100%;
  }

  .route-line i {
    height: 1px;
    flex: 1;
    position: relative;
    background: var(--color-border);
  }

  .route-line i:first-child::before,
  .route-line i.filled::after {
    content: "";
    position: absolute;
    top: 50%;
    width: .45rem;
    height: .45rem;
    border: 2px solid var(--ticket-accent);
    border-radius: 999px;
    background: var(--color-card);
    transform: translateY(-50%);
  }

  .route-line i:first-child::before {
    left: -.28rem;
  }

  .route-line i.filled::after {
    right: -.28rem;
    background: var(--ticket-accent);
  }

  .route-line > span {
    margin-top: .55rem;
    color: var(--color-muted-foreground);
    font-family: var(--font-pocket-mono);
    font-size: 10px;
  }

  .times {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.4rem 1.6rem 1.7rem;
    border-bottom: 1px dashed var(--color-border);
  }

  .times div:last-child {
    text-align: right;
  }

  .times small {
    font-size: var(--bp-time-label-size);
  }

  .times strong {
    display: block;
    margin-top: .45rem;
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
    max-width: 44%;
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

  .qr {
    display: grid;
    place-items: center;
    margin: 0 1.6rem;
    padding: 1.4rem;
    background: var(--color-muted);
  }

  .qr > div {
    width: 6rem;
    height: 6rem;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(7, 1fr);
    gap: 1px;
    padding: .45rem;
    background: white;
  }

  .qr span.filled {
    background: var(--color-foreground);
  }

  .scan {
    margin: .8rem 0 1.6rem;
    color: var(--color-muted-foreground);
    font-family: var(--font-pocket-mono);
    font-size: var(--bp-field-label-size);
    text-align: center;
  }

  @media (max-width: 560px) {
    .facts {
      grid-template-columns: 1fr;
    }

    .route {
      grid-template-columns: minmax(0, 1fr) minmax(4rem, .58fr) minmax(0, 1fr);
      gap: .55rem;
      padding-inline: 1.15rem;
    }

    .route-line {
      margin-top: calc(var(--bp-field-label-size) + .7rem);
    }

    b {
      font-size: clamp(1.28rem, 8vw, var(--bp-airport-code-size));
      line-height: 1.08;
    }
  }
</style>
