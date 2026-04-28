<script lang="ts">
  import type { PageData, ActionData } from "./$types";
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
  <header class="editor-hero">
    <div>
      <p class="eyebrow">Editor mode</p>
      <h1>{trip.title}</h1>
      <p>{trip.destination} · {trip.travelerCount} 人旅程</p>
    </div>
    <a class="back-link" href={`/trips/${trip.slug}`}>Back to preview</a>
  </header>

  <section class="editor-grid">
    <section class="editor-panel card">
      <div class="editor-panel__head">
        <div>
          <p class="eyebrow">Trip item</p>
          <h2>{selectedItem ? "編輯行程項目" : "新增行程項目"}</h2>
        </div>
        <a class="editor-badge" href={`/trips/${trip.slug}/edit?day=${selectedDay}`}>新增空白項目</a>
      </div>

      {#if form?.message}
        <p class="editor-message">{form.message}</p>
      {/if}

      <form class="place-form" method="post">
        <input type="hidden" name="/action" value="save" />
        <input type="hidden" name="itemId" value={selectedItem?.id || ""} />
        <input type="hidden" name="placeId" value={selectedItem?.place.id || ""} />

        <div class="form-grid">
          <label class="field">
            <span>日期</span>
            <input type="date" name="dayDate" value={selectedItem?.dayDate || selectedDay} required />
          </label>
          <label class="field">
            <span>開始時間</span>
            <input type="time" name="startTime" value={selectedItem?.startTime || ""} />
          </label>
          <label class="field">
            <span>結束時間</span>
            <input type="time" name="endTime" value={selectedItem?.endTime || ""} />
          </label>
          <label class="field">
            <span>類別</span>
            <select name="category" value={selectedItem?.category || "景點"}>
              <option value="食">食</option>
              <option value="交通">交通</option>
              <option value="住宿">住宿</option>
              <option value="景點">景點</option>
              <option value="購物">購物</option>
              <option value="體驗">體驗</option>
              <option value="其他">其他</option>
            </select>
          </label>
        </div>

        <div class="form-grid">
          <label class="field field--span-2">
            <span>地點名稱</span>
            <input name="name" value={selectedItem?.place.name || ""} required />
          </label>
          <label class="field">
            <span>原文名稱</span>
            <input name="nativeName" value={selectedItem?.place.nativeName || ""} />
          </label>
          <label class="field">
            <span>Google Maps 連結</span>
            <input name="mapsUrl" value={selectedItem?.place.mapsUrl || ""} />
          </label>
          <label class="field field--span-2">
            <span>地址</span>
            <input name="address" value={selectedItem?.place.address || ""} />
          </label>
          <label class="field">
            <span>電話</span>
            <input name="phone" value={selectedItem?.place.phone || ""} />
          </label>
          <label class="field">
            <span>官網</span>
            <input name="websiteUrl" value={selectedItem?.place.websiteUrl || ""} />
          </label>
          <label class="field field--span-2">
            <span>訂位 / 預約連結</span>
            <input name="reservationUrl" value={selectedItem?.place.reservationUrl || ""} />
          </label>
        </div>

        <div class="form-grid">
          <label class="field">
            <span>付款方式</span>
            <input name="paymentMethod" value={selectedItem?.paymentMethod || ""} />
          </label>
          <label class="field">
            <span>付款標籤</span>
            <input name="cardLabel" value={selectedItem?.cardLabel || ""} />
          </label>
          <label class="field">
            <span>金額</span>
            <input type="number" step="0.01" name="amount" value={selectedItem?.amount ?? ""} />
          </label>
          <label class="field">
            <span>幣別</span>
            <input name="currency" value={selectedItem?.currency || "KRW"} />
          </label>
          <label class="field">
            <span>預約狀態</span>
            <input name="reservationStatus" value={selectedItem?.reservationStatus || ""} />
          </label>
          <label class="field">
            <span>圖片網址</span>
            <input name="imageUrl" value={field("imageUrl")} />
          </label>
        </div>

        <div class="form-grid">
          <label class="field">
            <span>入住時間</span>
            <input name="checkIn" value={field("checkIn")} />
          </label>
          <label class="field">
            <span>退房時間</span>
            <input name="checkOut" value={field("checkOut")} />
          </label>
          <label class="field field--span-2">
            <span>房型</span>
            <input name="roomType" value={field("roomType")} />
          </label>
          <label class="field field--span-2">
            <span>房型資訊</span>
            <textarea name="roomInfo" rows="3">{field("roomInfo")}</textarea>
          </label>
          <label class="field field--span-2">
            <span>餐食</span>
            <input name="meals" value={field("meals")} placeholder="早餐、晚餐" />
          </label>
        </div>

        <label class="field">
          <span>備註</span>
          <textarea name="notes" rows="5">{selectedItem?.notes || ""}</textarea>
        </label>

        <label class="field">
          <span>額外 detail JSON</span>
          <textarea name="detailJson" rows="6">{selectedItem?.detailJson ? JSON.stringify(selectedItem.detailJson, null, 2) : ""}</textarea>
        </label>

        <button class="submit" type="submit" formaction="?/save">儲存到 D1</button>
      </form>
    </section>

    <aside class="editor-side">
      <section class="card day-summary">
        <p class="eyebrow">Editing day</p>
        <h3>{grouped.find((day) => day.date === selectedDay)?.label}</h3>
        <nav class="day-list">
          {#each grouped as day}
            <a class:selected={selectedDay === day.date} href={`/trips/${trip.slug}/edit?day=${day.date}`}>
              <span>{day.label}</span>
              <small>{day.items.length} 筆</small>
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
    background: rgba(255,255,255,.9);
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
    background: rgba(230,80,79,.08);
    color: var(--accent);
    font-size: .85rem;
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
    background: rgba(255,255,255,.9);
    border-radius: 18px;
    padding: 12px 14px;
    text-align: left;
  }
  .day-list a.selected,
  .item-list a.selected {
    border-color: rgba(29,36,51,.16);
    box-shadow: 0 12px 28px rgba(17,24,39,.06);
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
  .place-form { display: grid; gap: 14px; }
  .field { display: grid; gap: 8px; }
  .field span { color: var(--muted); font-size: .92rem; font-weight: 600; }
  .field input,
  .field textarea,
  .field select {
    width: 100%;
    padding: 14px 15px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: white;
  }
  .field--span-2 { grid-column: span 2; }
  .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .submit {
    border: 0;
    border-radius: 18px;
    padding: 15px 16px;
    background: linear-gradient(135deg, #212836 0%, #313a4e 100%);
    color: white;
    font-weight: 800;
  }
  @media (max-width: 960px) {
    .editor-grid { grid-template-columns: 1fr; }
    .editor-side { position: static; }
  }
  @media (max-width: 780px) {
    .editor-hero,
    .editor-grid { width: min(100vw - 20px, 1120px); }
    .editor-hero,
    .form-grid { display: grid; }
    .field--span-2 { grid-column: span 1; }
  }
</style>
