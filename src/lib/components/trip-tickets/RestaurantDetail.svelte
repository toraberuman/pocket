<script lang="ts">
  import PocketIcon from "$lib/components/PocketIcon.svelte";
  import type { TimelineActivity } from "$lib/view-models/trip";
  import { detailOf, fareText, firstText, text } from "./ticket-utils";
  import { formatCurrencyAmount, parseCurrencyAmount } from "$lib/currencies";

  type MenuItem = { name: string; nativeName?: string; description?: string; price?: string; quantity: number; amount?: string };
  type RecommendedItem = { name: string; nativeName?: string; description?: string; price?: string };
  type PreorderCourse = { courseName: string; courseNameNative?: string; description?: string; pricePerPerson?: string };

  let { activity }: { activity: TimelineActivity } = $props();

  const detail = $derived(detailOf(activity));
  const reservation = $derived(resolveReservation());
  const preorderCourses = $derived(resolvePreorderCourses());
  const recommended = $derived(resolveRecommended());
  const orders = $derived(resolveOrders());
  const total = $derived(sumOrders() || firstText(detail.totalAmount, detail.orderTotal, detail.total, fareText(activity)));
  const paymentStatus = $derived(firstText(detail.paymentStatus, activity.raw.reservationStatus) || "pay_on_site");
  const paymentMethod = $derived(firstText(detail.paymentMethod, activity.raw.paymentMethod));
  const deposit = $derived(firstText(detail.depositAmount, detail.deposit));
  const mapSrc = $derived(mapEmbedUrl());

  function resolveReservation() {
    const raw = detail.reservation && typeof detail.reservation === "object" ? detail.reservation as Record<string, unknown> : {};
    return {
      date: formatShortDate(firstText(raw.date, detail.reservationDate, activity.raw.dayDate)),
      time: firstText(raw.time, detail.reservationTime, activity.raw.startTime),
      partySize: Number(raw.partySize || detail.partySize || detail.guests || detail.people) || 0,
      seating: seatingLabel(firstText(raw.seating, detail.seating, detail.seatType)),
      confirmationCode: firstText(raw.confirmationCode, detail.confirmationCode, detail.reservationCode),
      contactPhone: firstText(raw.contactPhone, detail.contactPhone, detail.phone, activity.raw.place.phone)
    };
  }

  function resolvePreorderCourses(): PreorderCourse[] {
    const rawCourses = detail.preorderCourses || detail.preorderCourse;
    if (Array.isArray(rawCourses)) {
      return rawCourses
        .map((item) => normalizePreorderCourse(item))
        .filter((item): item is PreorderCourse => Boolean(item));
    }

    const raw = rawCourses && typeof rawCourses === "object" ? rawCourses as Record<string, unknown> : {};
    const courseName = firstText(raw.courseName, raw.name, detail.preorderCourseName, detail.courseName);
    const fallback = courseName ? [{
      courseName,
      courseNameNative: firstText(raw.courseNameNative, raw.nativeName, detail.preorderCourseNative, detail.courseNameNative),
      description: firstText(raw.description, detail.preorderCourseDescription, detail.courseDescription),
      pricePerPerson: firstText(raw.pricePerPerson, raw.price, detail.preorderCoursePrice, detail.pricePerPerson)
    }] : [];
    return fallback;
  }

  function normalizePreorderCourse(value: unknown) {
    if (!value || typeof value !== "object") return null;
    const row = value as Record<string, unknown>;
    const courseName = firstText(row.courseName, row.name, row.itemName, row.title);
    if (!courseName) return null;
    return {
      courseName,
      courseNameNative: firstText(row.courseNameNative, row.nativeName, row.nameNative, row.originalName),
      description: firstText(row.description, row.desc),
      pricePerPerson: firstText(row.pricePerPerson, row.price, row.unitPrice)
    };
  }

  function resolveRecommended(): RecommendedItem[] {
    const raw = detail.recommendedMenu || detail.recommendedItems || detail.recommendations;
    if (Array.isArray(raw)) {
      return raw
        .map((item) => normalizeRecommended(item))
        .filter((item): item is RecommendedItem => Boolean(item));
    }
    return [];
  }

  function normalizeRecommended(value: unknown) {
    if (typeof value === "string") return { name: value };
    if (!value || typeof value !== "object") return null;
    const row = value as Record<string, unknown>;
    return {
      name: firstText(row.name, row.itemName, row.title),
      nativeName: firstText(row.nativeName, row.nameNative, row.originalName),
      description: firstText(row.description, row.desc),
      price: firstText(row.price)
    };
  }

  function resolveOrders(): MenuItem[] {
    const raw = detail.orders || detail.orderItems || detail.menuItems || detail.items;
    if (Array.isArray(raw)) {
      return raw
        .map((item) => normalizeOrder(item))
        .filter((item): item is MenuItem => Boolean(item));
    }
    return [];
  }

  function normalizeOrder(value: unknown) {
    if (!value || typeof value !== "object") return null;
    const row = value as Record<string, unknown>;
    const quantity = Number(row.quantity || row.qty || 1) || 1;
    const price = firstText(row.price, row.unitPrice);
    const amount = firstText(row.amount, row.subtotal) || calcAmount(price, quantity);
    return {
      name: firstText(row.name, row.itemName, row.title),
      nativeName: firstText(row.nativeName, row.nameNative, row.originalName),
      description: firstText(row.description, row.desc),
      price,
      quantity,
      amount
    };
  }

  function seatingLabel(value: string) {
    const key = value.toLowerCase().replace(/[\s_-]+/g, "");
    if (key === "counter") return "吧台";
    if (key === "table") return "桌位";
    if (key === "privateroom") return "包廂";
    return value;
  }

  function calcAmount(price: string, quantity: number) {
    const numeric = parseCurrencyAmount(price);
    if (!numeric || !price) return "";
    return formatCurrencyAmount(numeric * quantity, activity.raw.currency);
  }

  function sumOrders() {
    const values = orders.map((order) => parseCurrencyAmount(order.amount)).filter((value): value is number => typeof value === "number");
    if (!values.length) return "";
    return formatCurrencyAmount(values.reduce((sum, value) => sum + value, 0), activity.raw.currency);
  }

  function moneyText(value?: string) {
    const amount = parseCurrencyAmount(value);
    return typeof amount === "number" ? formatCurrencyAmount(amount, activity.raw.currency) : (value || "");
  }

  function paymentIcon(value: string) {
    if (/cash|現金/i.test(value)) return "banknote";
    if (/qr|code/i.test(value)) return "qr-code";
    return "credit-card";
  }

  function formatShortDate(value: string) {
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("en", { month: "2-digit", day: "2-digit" }).format(parsed).replace("/", ".");
  }

  function mapEmbedUrl() {
    if (typeof activity.raw.place.lat === "number" && typeof activity.raw.place.lng === "number") {
      return `https://maps.google.com/maps?q=${activity.raw.place.lat},${activity.raw.place.lng}&z=16&output=embed`;
    }
    const query = encodeURIComponent(firstText(activity.raw.place.address, activity.raw.place.name));
    return query ? `https://maps.google.com/maps?q=${query}&z=16&output=embed` : "";
  }
</script>

<section class="pocket-detail restaurant-detail">
  <header class="detail-header">
    <div class="label-with-icon">
      <PocketIcon name="utensils" size={16} />
      <p>{firstText(detail.cuisine) || firstText(detail.restaurantType, detail.type) || "Dining"}</p>
    </div>
    <h3>{firstText(detail.restaurantName, activity.title)}</h3>
    <span>{firstText(detail.address, activity.raw.place.address, activity.location)}</span>
  </header>

  <section class="detail-section reservation-grid">
    <p class="section-title">Reservation</p>
    <div>
      <p>Date</p><strong>{reservation.date}</strong>
    </div>
    <div>
      <p>Time</p><strong>{reservation.time || "--"}</strong>
    </div>
    <div>
      <p><PocketIcon name="users" size={13} /> Party Size</p><strong>{reservation.partySize || "--"} guests</strong>
    </div>
    {#if reservation.seating}<div><p>Seating</p><strong>{reservation.seating}</strong></div>{/if}
    <div>
      <p>Payment Status</p>
      <span class="status"><PocketIcon name="credit-card" size={15} />{paymentStatus}</span>
    </div>
    {#if deposit}<div><p>Pre Payment Deposit</p><strong>{moneyText(deposit)}</strong></div>{/if}
  </section>

  {#if reservation.confirmationCode || reservation.contactPhone}
    <section class="facts reservation-facts">
      {#if reservation.confirmationCode}<div><p>Confirmation</p><strong>{reservation.confirmationCode}</strong></div>{/if}
      {#if reservation.contactPhone}<div><p><PocketIcon name="phone" size={14} /> Contact</p><strong>{reservation.contactPhone}</strong></div>{/if}
    </section>
  {/if}

  {#if preorderCourses.length}
    <section class="detail-section preorder">
      <p class="section-title"><PocketIcon name="star" size={15} /> Preorder Course</p>
      <div class="recommended">
        {#each preorderCourses as course}
          <div class="line-item">
            <div>
              <h4>{course.courseName}</h4>
              {#if course.courseNameNative}<span>{course.courseNameNative}</span>{/if}
              {#if course.description}<p>{course.description}</p>{/if}
            </div>
            {#if course.pricePerPerson}<strong>{moneyText(course.pricePerPerson)}/person</strong>{/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if recommended.length}
    <section class="detail-section">
      <p class="section-title">Recommended</p>
      <div class="recommended">
        {#each recommended as item}
          <div class="line-item">
            <div>
              <h4>{item.name}</h4>
              {#if item.nativeName}<span>{item.nativeName}</span>{/if}
              {#if item.description}<p>{item.description}</p>{/if}
            </div>
            {#if item.price}<strong>{moneyText(item.price)}</strong>{/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if orders.length}
    <section class="detail-section">
      <p class="section-title">Order Details</p>
      <div class="order-table">
        <table>
          <thead>
            <tr><th>Item</th><th>Price</th><th>Qty</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {#each orders as item}
              <tr>
                <td><strong>{item.name}</strong>{#if item.nativeName}<span>{item.nativeName}</span>{/if}</td>
                <td>{moneyText(item.price)}</td>
                <td>{item.quantity}</td>
                <td>{item.amount}</td>
              </tr>
            {/each}
          </tbody>
          <tfoot>
            <tr><td colspan="2"></td><td class="total-label">Total</td><td>{total}</td></tr>
          </tfoot>
        </table>
      </div>
    </section>
  {/if}

  {#if paymentMethod}
    <div class="tear-line"></div>
    <section class="method-row">
      <p class="section-title">Payment Method</p>
      <span class="status neutral"><PocketIcon name={paymentIcon(paymentMethod)} size={15} />{paymentMethod}</span>
    </section>
  {/if}

  {#if mapSrc}
    <div class="map-frame map-frame--bottom">
      <iframe src={mapSrc} title={`Map of ${activity.title}`} loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  {/if}
</section>
