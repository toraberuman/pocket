<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import { groupByDay } from "$lib/utils";

  let { data, form }: { data: PageData; form: ActionData } = $props();
  const trip = $derived(data.trip);
  const grouped = $derived(groupByDay(trip.items));
  const selectedDay = $derived(data.selectedDay || grouped[0]?.date || "");
  const selectedItem = $derived(data.selectedItem);

  function field(key: string) {
    return (selectedItem?.detailJson?.[key] as string | undefined) || "";
  }
</script>

<svelte:head>
  <title>{trip.title} Editor</title>
</svelte:head>

<main class="editor-shell">
  {#if data.locked}
    <section class="card lock-card">
      <p class="eyebrow">Protected editor</p>
      <h1>{trip.title}</h1>
      <p>Enter the edit password to manage this trip.</p>
      {#if form?.message}<p class="editor-message">{form.message}</p>{/if}
      <form method="post" class="lock-form">
        <input type="password" name="password" placeholder="Edit password" required />
        <button type="submit" formaction="?/unlock">Unlock editor</button>
      </form>
    </section>
  {:else}
    <header class="editor-hero">
      <div>
        <p class="eyebrow">Editor mode</p>
        <h1>{trip.title}</h1>
        <p>{trip.destination} · {trip.travelerCount} people · {trip.startDate} - {trip.endDate}</p>
      </div>
      <a class="back-link" href={`/trips/${trip.slug}`}>Back to preview</a>
    </header>

    <section class="editor-grid">
      <section class="editor-main">
        <section class="editor-panel card">
          <div class="editor-panel__head">
            <div>
              <p class="eyebrow">Trip settings</p>
              <h2>Trip basics and passwords</h2>
            </div>
          </div>

          {#if form?.message}
            <p class="editor-message">{form.message}</p>
          {/if}

          <form class="place-form" method="post">
            <div class="form-grid">
              <label class="field field--span-2">
                <span>Trip title</span>
                <input name="title" value={trip.title} required />
              </label>
              <label class="field">
                <span>Destination</span>
                <input name="destination" value={trip.destination} required />
              </label>
              <label class="field">
                <span>Traveler count</span>
                <input type="number" min="1" name="travelerCount" value={trip.travelerCount} required />
              </label>
              <label class="field">
                <span>Start date</span>
                <input type="date" name="startDate" value={trip.startDate} required />
              </label>
              <label class="field">
                <span>End date</span>
                <input type="date" name="endDate" value={trip.endDate} required />
              </label>
              <label class="field field--span-2">
                <span>Cover image URL</span>
                <input name="coverImageUrl" value={trip.coverImageUrl || ""} />
              </label>
              <label class="field field--span-2 checkbox-field">
                <input type="checkbox" name="isPrivate" checked={Boolean(trip.isPrivate)} />
                <span>Private trip</span>
              </label>
              <label class="field">
                <span>View password</span>
                <input type="password" name="viewPassword" placeholder="Leave blank to keep current password" />
              </label>
              <label class="field">
                <span>Edit password</span>
                <input type="password" name="editPassword" placeholder="Leave blank to keep current password" />
              </label>
            </div>

            <button class="submit" type="submit" formaction="?/saveTrip">Save trip settings</button>
          </form>
        </section>

        <section class="editor-panel card">
          <div class="editor-panel__head">
            <div>
              <p class="eyebrow">Trip item</p>
              <h2>{selectedItem ? "Update stop" : "Create new stop"}</h2>
            </div>
            <a class="editor-badge" href={`/trips/${trip.slug}/edit?day=${selectedDay}`}>New item</a>
          </div>

          <form class="place-form" method="post">
            <input type="hidden" name="itemId" value={selectedItem?.id || ""} />
            <input type="hidden" name="placeId" value={selectedItem?.place.id || ""} />

            <div class="form-grid">
              <label class="field">
                <span>Date</span>
                <input type="date" name="dayDate" value={selectedItem?.dayDate || selectedDay} required />
              </label>
              <label class="field">
                <span>Start time</span>
                <input type="time" name="startTime" value={selectedItem?.startTime || ""} />
              </label>
              <label class="field">
                <span>End time</span>
                <input type="time" name="endTime" value={selectedItem?.endTime || ""} />
              </label>
              <label class="field">
                <span>Category</span>
                <select name="category">
                  <option value="交通" selected={(selectedItem?.category || "交通") === "交通"}>交通</option>
                  <option value="住宿" selected={selectedItem?.category === "住宿"}>住宿</option>
                  <option value="食" selected={selectedItem?.category === "食"}>食</option>
                  <option value="景點" selected={selectedItem?.category === "景點"}>景點</option>
                  <option value="購物" selected={selectedItem?.category === "購物"}>購物</option>
                  <option value="體驗" selected={selectedItem?.category === "體驗"}>體驗</option>
                  <option value="其他" selected={selectedItem?.category === "其他"}>其他</option>
                </select>
              </label>
            </div>

            <div class="form-grid">
              <label class="field field--span-2">
                <span>Place name</span>
                <input name="name" value={selectedItem?.place.name || ""} required />
              </label>
              <label class="field">
                <span>Native name</span>
                <input name="nativeName" value={selectedItem?.place.nativeName || ""} />
              </label>
              <label class="field">
                <span>Google Maps URL</span>
                <input name="mapsUrl" value={selectedItem?.place.mapsUrl || ""} />
              </label>
              <label class="field field--span-2">
                <span>Address</span>
                <input name="address" value={selectedItem?.place.address || ""} />
              </label>
              <label class="field">
                <span>Phone</span>
                <input name="phone" value={selectedItem?.place.phone || ""} />
              </label>
              <label class="field">
                <span>Website</span>
                <input name="websiteUrl" value={selectedItem?.place.websiteUrl || ""} />
              </label>
              <label class="field field--span-2">
                <span>Reservation URL</span>
                <input name="reservationUrl" value={selectedItem?.place.reservationUrl || ""} />
              </label>
            </div>

            <div class="form-grid">
              <label class="field">
                <span>Payment method</span>
                <input name="paymentMethod" value={selectedItem?.paymentMethod || ""} />
              </label>
              <label class="field">
                <span>Card label</span>
                <input name="cardLabel" value={selectedItem?.cardLabel || ""} />
              </label>
              <label class="field">
                <span>Amount</span>
                <input type="number" step="0.01" name="amount" value={selectedItem?.amount ?? ""} />
              </label>
              <label class="field">
                <span>Currency</span>
                <input name="currency" value={selectedItem?.currency || "KRW"} />
              </label>
              <label class="field">
                <span>Reservation status</span>
                <input name="reservationStatus" value={selectedItem?.reservationStatus || ""} />
              </label>
              <label class="field">
                <span>Image URL</span>
                <input name="imageUrl" value={field("imageUrl")} />
              </label>
            </div>

            <div class="form-grid">
              <label class="field">
                <span>Check-in</span>
                <input name="checkIn" value={field("checkIn")} />
              </label>
              <label class="field">
                <span>Check-out</span>
                <input name="checkOut" value={field("checkOut")} />
              </label>
              <label class="field field--span-2">
                <span>Room type</span>
                <input name="roomType" value={field("roomType")} />
              </label>
              <label class="field field--span-2">
                <span>Room info</span>
                <textarea name="roomInfo" rows="3">{field("roomInfo")}</textarea>
              </label>
              <label class="field field--span-2">
                <span>Meals</span>
                <input name="meals" value={field("meals")} placeholder="Breakfast, lounge, vegan..." />
              </label>
            </div>

            <label class="field">
              <span>Notes</span>
              <textarea name="notes" rows="5">{selectedItem?.notes || ""}</textarea>
            </label>

            <label class="field">
              <span>Extra detail JSON</span>
              <textarea name="detailJson" rows="6">{selectedItem?.detailJson ? JSON.stringify(selectedItem.detailJson, null, 2) : ""}</textarea>
            </label>

            <button class="submit" type="submit" formaction="?/save">Save item to D1</button>
          </form>
        </section>
      </section>

      <aside class="editor-side">
        <section class="card day-summary">
          <p class="eyebrow">Editing day</p>
          <h3>{grouped.find((day) => day.date === selectedDay)?.label || "No day selected"}</h3>
          <nav class="day-list">
            {#each grouped as day}
              <a class:selected={selectedDay === day.date} href={`/trips/${trip.slug}/edit?day=${day.date}`}>
                <span>{day.label}</span>
                <small>{day.items.length} items</small>
              </a>
            {/each}
          </nav>
        </section>

        <section class="card note-card">
          <p class="eyebrow">Items</p>
          <div class="item-list">
            {#each grouped.find((day) => day.date === selectedDay)?.items || [] as item}
              <a class:selected={selectedItem?.id === item.id} href={`/trips/${trip.slug}/edit?day=${selectedDay}&item=${item.id}`}>
                <strong>{item.place.name}</strong>
                <span>{item.startTime || "All day"} · {item.category}</span>
              </a>
            {/each}
          </div>
        </section>
      </aside>
    </section>
  {/if}
</main>

<style>
  .editor-shell {
    min-height: 100vh;
    padding: 40px 24px 56px;
  }
  .editor-hero,
  .editor-grid {
    width: min(1120px, calc(100vw - 32px));
    margin: 0 auto;
  }
  .editor-main {
    display: grid;
    gap: 24px;
  }
  .lock-card {
    width: min(560px, 100%);
    margin: 0 auto;
    padding: 28px;
    background: #fff;
  }
  .lock-card h1 {
    margin: 0 0 10px;
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1;
  }
  .lock-form {
    display: flex;
    gap: 12px;
    margin-top: 18px;
  }
  .lock-form input {
    flex: 1 1 auto;
    padding: 14px 15px;
    border-radius: 18px;
    border: 1px solid var(--border);
  }
  .lock-form button,
  .submit {
    border: 0;
    border-radius: 18px;
    padding: 15px 16px;
    background: linear-gradient(135deg, #212836 0%, #313a4e 100%);
    color: white;
    font-weight: 800;
    cursor: pointer;
  }
  .editor-hero {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: end;
    margin-bottom: 24px;
  }
  .editor-hero h1 {
    margin: 0 0 8px;
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 3.5vw, 3.6rem);
  }
  .editor-hero p:last-child {
    margin: 0;
    color: var(--muted);
  }
  .back-link {
    padding: 12px 16px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.9);
  }
  .editor-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 24px;
    align-items: start;
  }
  .editor-panel,
  .day-summary,
  .note-card {
    padding: 24px;
    background: #fff;
  }
  .editor-panel__head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: start;
    margin-bottom: 18px;
  }
  .editor-panel__head h2,
  .day-summary h3,
  .note-card h3 {
    margin: 0;
  }
  .editor-badge {
    display: inline-flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 999px;
    background: rgba(230, 80, 79, 0.08);
    color: var(--accent);
    font-size: 0.85rem;
    font-weight: 700;
  }
  .editor-message {
    margin: 0 0 16px;
    color: var(--accent);
    font-weight: 600;
  }
  .editor-side {
    display: grid;
    gap: 18px;
    position: sticky;
    top: 16px;
  }
  .day-list,
  .item-list {
    display: grid;
    gap: 10px;
    margin-top: 16px;
  }
  .day-list a,
  .item-list a {
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.9);
    border-radius: 18px;
    padding: 12px 14px;
    text-align: left;
  }
  .day-list a.selected,
  .item-list a.selected {
    border-color: rgba(29, 36, 51, 0.16);
    box-shadow: 0 12px 28px rgba(17, 24, 39, 0.06);
  }
  .day-list span,
  .day-list small,
  .item-list strong,
  .item-list span {
    display: block;
  }
  .day-list small,
  .item-list span {
    color: var(--muted);
  }
  .place-form {
    display: grid;
    gap: 14px;
  }
  .field {
    display: grid;
    gap: 8px;
  }
  .field span {
    color: var(--muted);
    font-size: 0.92rem;
    font-weight: 600;
  }
  .checkbox-field {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .checkbox-field input {
    width: 18px;
    height: 18px;
  }
  .checkbox-field span {
    color: inherit;
    font-size: 1rem;
    font-weight: 600;
  }
  .field input,
  .field textarea,
  .field select {
    width: 100%;
    padding: 14px 15px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: white;
    font: inherit;
  }
  .field--span-2 {
    grid-column: span 2;
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  @media (max-width: 960px) {
    .editor-grid {
      grid-template-columns: 1fr;
    }
    .editor-side {
      position: static;
    }
  }
  @media (max-width: 780px) {
    .editor-hero,
    .editor-grid {
      width: min(100vw - 20px, 1120px);
    }
    .editor-hero,
    .form-grid {
      display: grid;
    }
    .field--span-2 {
      grid-column: span 1;
    }
  }
</style>
