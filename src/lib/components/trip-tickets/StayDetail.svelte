<script lang="ts">
  import PocketIcon from "$lib/components/PocketIcon.svelte";
  import type { TimelineActivity } from "$lib/view-models/trip";
  import { detailOf, fareText, firstText } from "./ticket-utils";
  import { formatCurrencyAmount, parseCurrencyAmount } from "$lib/currencies";

  type RoomGuest = { name: string; guestCount?: number; pricePerPerson?: string; farePerNight?: string };
  type RoomInfo = {
    images: string[];
    roomName: string;
    roomNo?: string;
    windowView?: string;
    size?: string;
    bath?: string;
    bed?: string;
    roomDesc?: string;
    roomUrl?: string;
    layoutUrl?: string;
    bookingUrl?: string;
    paymentMethod?: string;
    cardLabel?: string;
    reservationStatus?: string;
    currency?: string;
    amount?: number;
    pricePerPerson?: string;
    guests: RoomGuest[];
  };

  let { activity }: { activity: TimelineActivity } = $props();

  const detail = $derived(detailOf(activity));
  const rooms = $derived(resolveRooms());
  const imageIndex = $state<Record<number, number>>({});
  const checkInTime = $derived(firstText(detail.checkInTime, detail.checkinTime, detail.checkIn, activity.raw.startTime) || "15:00");
  const checkOutTime = $derived(firstText(detail.checkOutTime, detail.checkoutTime, detail.checkOut, activity.raw.endTime) || "11:00");
  const checkInDateValue = $derived(firstText(detail.checkInDate, detail.checkinDate, activity.raw.dayDate));
  const checkInDate = $derived(formatShortDate(checkInDateValue));
  const nights = $derived(parseNights(detail.nights));
  const meals = $derived(resolveMealsForDisplay());
  const checkOutDate = $derived(formatShortDate(addDays(activity.raw.dayDate, nights, activity.raw.dayDate)));
  const activeMeals = $derived([
    meals.breakfast ? { label: "Breakfast", icon: "coffee" } : null,
    meals.lunch ? { label: "Lunch", icon: "utensils" } : null,
    meals.dinner ? { label: "Dinner", icon: "moon" } : null,
    meals.miniBar ? { label: "Mini Bar", icon: "coffee" } : null,
    meals.lounge ? { label: "Lounge", icon: "users" } : null
  ].filter((meal): meal is { label: string; icon: "coffee" | "utensils" | "moon" | "users" } => Boolean(meal)));
  const total = $derived(firstText(detail.totalFare, detail.total, fareText(activity)) || computedRoomTotal());
  const confirmation = $derived(firstText(detail.confirmationCode, detail.bookingCode, detail.reservationCode));
  const contact = $derived(firstText(detail.contactPhone, detail.phone, activity.raw.place.phone));
  const mapSrc = $derived(mapEmbedUrl());

  function resolveRooms(): RoomInfo[] {
    const rawRooms = detail.rooms;
    if (Array.isArray(rawRooms) && rawRooms.length) {
      return rawRooms
        .map((room) => normalizeRoom(room))
        .filter((room): room is RoomInfo => Boolean(room));
    }

    return [
      {
        images: csv(detail.images, detail.photos, detail.imageUrl, activity.raw.detailJson?.imageUrl),
        roomName: firstText(detail.roomName, detail.roomType, detail.room, detail["Room1"], detail.roomInfo) || "Room",
        roomNo: firstText(detail.roomNo, detail.roomNumber),
        windowView: firstText(detail.windowView, detail.view),
        size: firstText(detail.size, detail.roomSize),
        bath: firstText(detail.bath, detail.bathroom),
        bed: firstText(detail.bed, detail.bedType),
        roomDesc: firstText(detail.roomDesc, detail.description, activity.notes),
        roomUrl: firstText(detail.roomUrl, detail.roomInfoUrl, detail["房型資訊"]),
        layoutUrl: firstText(detail.layoutUrl),
        bookingUrl: firstText(detail.bookingUrl, detail.reservationUrl),
        paymentMethod: firstText(detail.paymentMethod, activity.raw.paymentMethod),
        cardLabel: firstText(detail.cardLabel, activity.raw.cardLabel),
        reservationStatus: firstText(detail.reservationStatus, activity.raw.reservationStatus),
        currency: firstText(detail.currency, activity.raw.currency),
        amount: parseCurrencyAmount(detail.amount ?? activity.raw.amount),
        pricePerPerson: firstText(detail.pricePerPerson, detail.farePerNight),
        guests: normalizeGuests(detail.guests, firstText(detail.guestName, detail.guest), firstText(detail.pricePerPerson, detail.farePerNight))
      }
    ];
  }

  function normalizeRoom(value: unknown) {
    if (!value || typeof value !== "object") return null;
    const room = value as Record<string, unknown>;
    return {
      images: csv(room.images, room.photos, room.imageUrl),
      roomName: firstText(room.roomName, room.roomType, room.name, room.type) || "Room",
      roomNo: firstText(room.roomNo, room.roomNumber, room.number),
      windowView: firstText(room.windowView, room.view),
      size: firstText(room.size, room.roomSize),
      bath: firstText(room.bath, room.bathroom),
      bed: firstText(room.bed, room.bedType),
      roomDesc: firstText(room.roomDesc, room.description, room.desc),
      roomUrl: firstText(room.roomUrl, room.url),
      layoutUrl: firstText(room.layoutUrl),
      bookingUrl: firstText(room.bookingUrl, room.reservationUrl),
      paymentMethod: firstText(room.paymentMethod),
      cardLabel: firstText(room.cardLabel),
      reservationStatus: firstText(room.reservationStatus, room.status),
      currency: firstText(room.currency, activity.raw.currency),
      amount: parseCurrencyAmount(room.amount),
      pricePerPerson: firstText(room.pricePerPerson, room.farePerNight),
      guests: normalizeGuests(room.guests, firstText(room.guestName, room.guest), firstText(room.pricePerPerson, room.farePerNight))
    };
  }

  function normalizeGuests(value: unknown, fallbackName = "", fallbackPrice = "") {
    if (Array.isArray(value) && value.length) {
      return value
        .map((guest) => {
          if (typeof guest === "string") return { name: guest };
          if (!guest || typeof guest !== "object") return null;
          const row = guest as Record<string, unknown>;
          return {
            name: firstText(row.nameEn, row.name, row.guestName) || "Traveler",
            guestCount: Number(row.guestCount) || undefined,
            pricePerPerson: firstText(row.pricePerPerson, row.farePerNight, row.price)
          };
        })
        .filter((guest): guest is RoomGuest => Boolean(guest));
    }

    if (!fallbackName && !fallbackPrice) return [];
    return [{ name: fallbackName || "Traveler", pricePerPerson: fallbackPrice }];
  }

  function resolveMeals() {
    const mealDetail = detail.meals;
    if (mealDetail && typeof mealDetail === "object") {
      const meals = mealDetail as Record<string, unknown>;
      return {
        breakfast: Boolean(meals.breakfast),
        lunch: Boolean(meals.lunch),
        dinner: Boolean(meals.dinner),
        miniBar: Boolean(meals.miniBar),
        lounge: Boolean(meals.lounge)
      };
    }

    const source = firstText(detail.meal, detail.mealsIncluded, detail.food, detail.dining);
    return {
      breakfast: /breakfast|早餐|早食/i.test(source),
      lunch: /lunch|午餐/i.test(source),
      dinner: /dinner|晚餐|餐食|素泊/i.test(source),
      miniBar: /mini\s*bar|minibar|迷你吧/i.test(source),
      lounge: /lounge|酒廊|貴賓室/i.test(source)
    };
  }

  function resolveMealsForDisplay() {
    const mealDetail = detail.meals;
    if (mealDetail && typeof mealDetail === "object") {
      const mealRecord = mealDetail as Record<string, unknown>;
      return {
        breakfast: Boolean(mealRecord.breakfast),
        lunch: Boolean(mealRecord.lunch),
        dinner: Boolean(mealRecord.dinner),
        miniBar: Boolean(mealRecord.miniBar),
        lounge: Boolean(mealRecord.lounge)
      };
    }

    const source = firstText(detail.meal, detail.mealsIncluded, detail.food, detail.dining);
    return {
      breakfast: /breakfast|早餐|早食/i.test(source),
      lunch: /lunch|午餐/i.test(source),
      dinner: /dinner|晚餐|夕食|晚食/i.test(source),
      miniBar: /mini\s*bar|minibar|迷你吧/i.test(source),
      lounge: /lounge|酒廊|貴賓室/i.test(source)
    };
  }

  function csv(...values: unknown[]) {
    return values.flatMap((value) => {
      if (Array.isArray(value)) return value.flatMap((item) => csv(item));
      return firstText(value)
        .split(/[\n,|]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    });
  }

  function computedRoomTotal() {
    const totalAmount = rooms.reduce((sum, room) => sum + (room.amount || 0), 0);
    const currency = rooms.find((room) => room.currency)?.currency || activity.raw.currency;
    return totalAmount ? formatCurrencyAmount(totalAmount, currency) : "";
  }

  function roomAmountText(room: RoomInfo) {
    return room.amount ? formatCurrencyAmount(room.amount, room.currency || activity.raw.currency) : "";
  }

  function guestPriceText(guest: RoomGuest) {
    const source = firstText(guest.pricePerPerson, guest.farePerNight);
    if (!source) return "";
    return `${source} / 人 / 晚`;
  }

  function guestCountText(guest: RoomGuest, room: RoomInfo) {
    const count = guest.guestCount || Number((room.guests[0] as RoomGuest | undefined)?.guestCount) || 1;
    return `${count}人`;
  }

  function roomTags(room: RoomInfo) {
    return [
      room.windowView,
      room.size,
      room.bath,
      room.bed
    ].filter((tag): tag is string => Boolean(tag));
  }

  function iconForTag(tag: string) {
    if (/view|景|海|山|garden|city/i.test(tag)) return "eye";
    if (/bath|浴|shower|tub/i.test(tag)) return "bath";
    if (/wifi/i.test(tag)) return "wifi";
    return "bed";
  }

  function iconForRoomTag(tag: string) {
    if (/view|景觀|garden|city|ocean|sea/i.test(tag)) return "eye";
    if (/bath|浴|shower|tub/i.test(tag)) return "bath";
    if (/wifi/i.test(tag)) return "wifi";
    return "bed";
  }

  function setImage(roomIndex: number, delta: number) {
    const room = rooms[roomIndex];
    if (!room?.images.length) return;
    const current = imageIndex[roomIndex] ?? 0;
    imageIndex[roomIndex] = (current + delta + room.images.length) % room.images.length;
  }

  function formatShortDate(value: string) {
    const parsed = parseDate(value, activity.raw.dayDate);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("en", { month: "2-digit", day: "2-digit" }).format(parsed).replace("/", ".");
  }

  function addDays(value: string, days: number, fallbackDate: string) {
    const parsed = parseDate(value, fallbackDate);
    if (Number.isNaN(parsed.getTime())) return value;
    parsed.setDate(parsed.getDate() + Math.max(1, days));
    return formatLocalDate(parsed);
  }

  function parseDate(value: string, fallbackDate: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00`);

    const shortDate = value.match(/^(\d{1,2})[./-](\d{1,2})$/);
    if (shortDate) {
      const fallbackYear = new Date(`${fallbackDate}T00:00:00`).getFullYear();
      return new Date(fallbackYear, Number(shortDate[1]) - 1, Number(shortDate[2]));
    }

    return new Date(`${value}T00:00:00`);
  }

  function parseNights(value: unknown) {
    const match = String(value ?? "").match(/\d+/);
    const parsed = match ? Number(match[0]) : 1;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }

  function formatLocalDate(value: Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function mapEmbedUrl() {
    if (typeof activity.raw.place.lat === "number" && typeof activity.raw.place.lng === "number") {
      return `https://maps.google.com/maps?q=${activity.raw.place.lat},${activity.raw.place.lng}&z=15&output=embed`;
    }
    const query = encodeURIComponent(firstText(activity.raw.place.address, activity.raw.place.name));
    return query ? `https://maps.google.com/maps?q=${query}&z=15&output=embed` : "";
  }
</script>

<section class="pocket-detail stay-detail">
  <header class="detail-header">
    <p>{firstText(detail.propertyType, detail.hotelType) || "Ryokan"}</p>
    <h3>{firstText(detail.propertyName, activity.title)}</h3>
    <span>{firstText(detail.address, activity.raw.place.address, activity.location)}</span>
  </header>

  <section class="check-grid">
    <div>
      <p><PocketIcon name="sun" size={14} /> Check-in</p>
      <strong>{checkInTime}</strong>
      <span>{checkInDate}</span>
    </div>
    <div class="night-line">
      <i></i><PocketIcon name="moon" size={16} /><i></i>
      <span>{nights} {nights === 1 ? "night" : "nights"}</span>
    </div>
    <div>
      <p><PocketIcon name="moon" size={14} /> Check-out</p>
      <strong>{checkOutTime}</strong>
      <span>{checkOutDate}</span>
    </div>
  </section>

  <section class="detail-section meals">
    <p class="section-title">Meals Included</p>
    {#if activeMeals.length}
      <div class="meal-tags">
        {#each activeMeals as meal}
          <span class="active"><PocketIcon name={meal.icon} size={14} />{meal.label}</span>
        {/each}
      </div>
    {:else}
      <div class="meal-tags">
        <span class="active"><PocketIcon name="bed" size={14} />Room Only / 素泊</span>
      </div>
    {/if}
  </section>

  <section class="detail-section">
    <p class="section-title">Rooms ({rooms.length})</p>
    <div class="rooms">
      {#each rooms as room, roomIndex}
        <article class="room-card">
          {#if room.images.length}
            <div class="room-photo">
              <img src={room.images[imageIndex[roomIndex] ?? 0]} alt={room.roomName} />
              {#if room.images.length > 1}
                <button type="button" aria-label="Previous room image" onclick={() => setImage(roomIndex, -1)}>
                  <PocketIcon name="chevron-left" size={17} />
                </button>
                <button type="button" aria-label="Next room image" onclick={() => setImage(roomIndex, 1)}>
                  <PocketIcon name="chevron-right" size={17} />
                </button>
                <div>{#each room.images as _, dot}<i class:active={dot === (imageIndex[roomIndex] ?? 0)}></i>{/each}</div>
              {/if}
            </div>
          {:else}
            <div class="room-photo empty-photo"><PocketIcon name="image" size={28} /></div>
          {/if}

          <div class="room-content">
            <div class="room-title">
              <div>
                {#if room.reservationStatus}
                  <p class="room-meta">
                    {#if room.reservationStatus}<span class="status">{room.reservationStatus}</span>{/if}
                  </p>
                {/if}
                <h4>{room.roomName}</h4>
                {#if room.roomNo}
                  <p class="room-meta">
                    {#if room.roomNo}<span>Room {room.roomNo}</span>{/if}
                  </p>
                {/if}
              </div>
              {#if room.roomUrl}<a href={room.roomUrl} target="_blank" rel="noreferrer"><PocketIcon name="external-link" size={17} /></a>{/if}
            </div>

            {#if roomTags(room).length}
              <div class="room-tags">
                {#each roomTags(room) as tag}
                  <span><PocketIcon name={iconForRoomTag(tag)} size={13} />{tag}</span>
                {/each}
              </div>
            {/if}

            {#if room.roomDesc}<p class="room-desc">{room.roomDesc}</p>{/if}

            {#if room.guests.length}
              <div class="guest-list">
                <p class="section-title">Guests</p>
                {#each room.guests as guest}
                  <div>
                    <strong>{guest.name}</strong>
                    {#if guest.pricePerPerson || guest.farePerNight}
                      <span>{guestCountText(guest, room)} · {guestPriceText(guest)}</span>
                    {/if}
                  </div>
                {/each}
                {#if roomAmountText(room)}
                  <div class="room-total-row"><strong></strong><span>{roomAmountText(room)} / 室</span></div>
                {/if}
              </div>
            {/if}

            {#if room.bookingUrl}
              <a class="booking-link" href={room.bookingUrl} target="_blank" rel="noreferrer">
                Booking <PocketIcon name="external-link" size={13} />
              </a>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  </section>

  <div class="tear-line"></div>

  <section class="payment-grid">
    <div class="total-price">
      <p class="section-title">Total</p>
      <strong>{total || "--"}</strong>
    </div>
  </section>

  <section class="facts">
    {#if confirmation}<div><p>Confirmation</p><strong>{confirmation}</strong></div>{/if}
    {#if contact}<div><p>Contact</p><strong>{contact}</strong></div>{/if}
  </section>

  {#if mapSrc}
    <div class="map-frame map-frame--bottom">
      <iframe src={mapSrc} title={`Map of ${activity.title}`} loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  {/if}
</section>
