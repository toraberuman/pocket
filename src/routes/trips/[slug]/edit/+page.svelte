<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import type { LocaleCode, TripCategory, TripSubcategory } from "$lib/types";
  import {
    categoryLabel,
    categoryLabels,
    defaultLocale,
    subcategoryLabel,
    subcategoryLabels
  } from "$lib/i18n/labels";
  import { currencyOptions, defaultCurrencyCode, formatCurrencyAmount, parseCurrencyAmount } from "$lib/currencies";
  import { groupByDay } from "$lib/utils";

  type Option<T extends string> = { value: T; label: string };
  type DetailField = {
    name: string;
    label: string;
    placeholder?: string;
    type?: "text" | "number" | "url" | "textarea";
    span?: 1 | 2;
  };
  type PassengerRow = { nameEn: string; className: string; car: string; seat: string };
  type RestaurantCourseRow = { name: string; nativeName: string; description: string; price: string };
  type RestaurantOrderRow = RestaurantCourseRow & { quantity: string; amount: string };
  type StayRoomRow = {
    images: string;
    roomName: string;
    roomNo: string;
    windowView: string;
    size: string;
    bath: string;
    bed: string;
    roomDesc: string;
    guestName: string;
    guestCount: string;
    bookingUrl: string;
    paymentMethod: string;
    cardLabel: string;
    reservationStatus: string;
    currency: string;
    amount: string;
    pricePerPerson: string;
    roomUrl: string;
  };
  type RestaurantSeating = "Counter" | "Table" | "Private Room";

  const restaurantSeatingLabels: Record<LocaleCode, Record<RestaurantSeating, string>> = {
    "zh-TW": {
      Counter: "吧台",
      Table: "桌位",
      "Private Room": "包廂"
    },
    en: {
      Counter: "Counter",
      Table: "Table",
      "Private Room": "Private Room"
    }
  };

  const restaurantSeatingOptions: Option<RestaurantSeating>[] = [
    { value: "Counter", label: restaurantSeatingLabels[defaultLocale].Counter },
    { value: "Table", label: restaurantSeatingLabels[defaultLocale].Table },
    { value: "Private Room", label: restaurantSeatingLabels[defaultLocale]["Private Room"] }
  ];

  const categoryOptions: Option<TripCategory>[] = [
    { value: "transport", label: categoryLabels[defaultLocale].transport },
    { value: "stay", label: categoryLabels[defaultLocale].stay },
    { value: "restaurant", label: categoryLabels[defaultLocale].restaurant },
    { value: "sight", label: categoryLabels[defaultLocale].sight },
    { value: "shopping", label: categoryLabels[defaultLocale].shopping },
    { value: "experience", label: categoryLabels[defaultLocale].experience },
    { value: "other", label: categoryLabels[defaultLocale].other }
  ];

  const subcategoryOptions: Record<TripCategory, Option<TripSubcategory>[]> = {
    transport: [
      { value: "flight", label: subcategoryLabels[defaultLocale].flight },
      { value: "train", label: subcategoryLabels[defaultLocale].train },
      { value: "taxi", label: subcategoryLabels[defaultLocale].taxi },
      { value: "drive", label: subcategoryLabels[defaultLocale].drive },
      { value: "walk", label: subcategoryLabels[defaultLocale].walk },
      { value: "bus", label: subcategoryLabels[defaultLocale].bus },
      { value: "metro", label: subcategoryLabels[defaultLocale].metro },
      { value: "ferry", label: subcategoryLabels[defaultLocale].ferry },
      { value: "transfer", label: subcategoryLabels[defaultLocale].transfer }
    ],
    stay: [{ value: "stay", label: subcategoryLabels[defaultLocale].stay }],
    restaurant: [{ value: "restaurant", label: subcategoryLabels[defaultLocale].restaurant }],
    sight: [{ value: "sight", label: subcategoryLabels[defaultLocale].sight }],
    shopping: [{ value: "shopping", label: subcategoryLabels[defaultLocale].shopping }],
    experience: [{ value: "experience", label: subcategoryLabels[defaultLocale].experience }],
    other: [{ value: "other", label: subcategoryLabels[defaultLocale].other }]
  };

  const detailFieldsBySubcategory: Partial<Record<TripSubcategory, DetailField[]>> = {
    flight: [
      { name: "flightNumber", label: "Flight number", placeholder: "KE2086" },
      { name: "airline", label: "Airline", placeholder: "Korean Air" },
      { name: "fromAirportCode", label: "From airport code", placeholder: "TPE" },
      { name: "fromAirportNameEn", label: "From airport name (EN)", placeholder: "Taiwan Taoyuan International Airport", span: 2 },
      { name: "fromAirportName", label: "From airport name", placeholder: "桃園國際機場", span: 2 },
      { name: "toAirportCode", label: "To airport code", placeholder: "PUS" },
      { name: "toAirportNameEn", label: "To airport name (EN)", placeholder: "Gimhae International Airport", span: 2 },
      { name: "toAirportName", label: "To airport name", placeholder: "金海國際機場", span: 2 },
      { name: "fromTerminal", label: "Departure terminal", placeholder: "Terminal 2" },
      { name: "arrivalTerminal", label: "Arrival terminal", placeholder: "Terminal 1" },
      { name: "gate", label: "Gate" },
      { name: "arrivalGate", label: "Arrival gate" },
      { name: "cabinClass", label: "Cabin class", placeholder: "Economy / Business" },
      { name: "bookingReference", label: "Booking reference" },
      { name: "checkInUrl", label: "Check-in URL", type: "url", span: 2 }
    ],
    train: [
      { name: "trainNumber", label: "Train number", placeholder: "KTX 104" },
      { name: "trainType", label: "Train type", placeholder: "KTX" },
      { name: "fromStation", label: "From station", placeholder: "Busan" },
      { name: "toStation", label: "To station", placeholder: "Gyeongju" },
      { name: "platform", label: "Platform" },
      { name: "operator", label: "Operator" },
      { name: "durationMinutes", label: "Duration minutes", type: "number" }
    ],
    taxi: [
      { name: "provider", label: "Taxi company", placeholder: "Uber / KAKAO T" },
      { name: "fromName", label: "From" },
      { name: "toName", label: "To" },
      { name: "pickupPoint", label: "Pickup point" },
      { name: "dropoffPoint", label: "Drop-off point" },
      { name: "distanceKm", label: "Distance km", type: "number" },
      { name: "durationMinutes", label: "Duration minutes", type: "number" },
      { name: "bookingCode", label: "Booking code" }
    ],
    drive: [
      { name: "fromName", label: "From" },
      { name: "toName", label: "To" },
      { name: "navigationUrl", label: "Navigation URL", type: "url", span: 2 },
      { name: "distanceKm", label: "Distance km", type: "number" },
      { name: "durationMinutes", label: "Duration minutes", type: "number" },
      { name: "parkingName", label: "Parking" },
      { name: "parkingFee", label: "Parking fee", type: "number" },
      { name: "tollFee", label: "Toll fee", type: "number" },
      { name: "fuelFee", label: "Fuel fee", type: "number" }
    ],
    walk: [
      { name: "fromName", label: "From" },
      { name: "toName", label: "To" },
      { name: "distanceKm", label: "Distance km", type: "number" },
      { name: "durationMinutes", label: "Duration minutes", type: "number" },
      { name: "routeNotes", label: "Route notes", type: "textarea", span: 2 }
    ],
    bus: [
      { name: "routeName", label: "Route" },
      { name: "operator", label: "Operator" },
      { name: "fromName", label: "From" },
      { name: "toName", label: "To" },
      { name: "platformOrStop", label: "Platform / stop" },
      { name: "durationMinutes", label: "Duration minutes", type: "number" }
    ],
    metro: [
      { name: "routeName", label: "Line" },
      { name: "fromName", label: "From" },
      { name: "toName", label: "To" },
      { name: "platformOrStop", label: "Platform / stop" },
      { name: "durationMinutes", label: "Duration minutes", type: "number" }
    ],
    ferry: [
      { name: "operator", label: "Operator" },
      { name: "routeName", label: "Route" },
      { name: "fromName", label: "From" },
      { name: "toName", label: "To" },
      { name: "seat", label: "Seat" },
      { name: "bookingCode", label: "Booking code" }
    ],
    transfer: [
      { name: "operator", label: "Provider" },
      { name: "fromName", label: "From" },
      { name: "toName", label: "To" },
      { name: "pickupPoint", label: "Pickup point" },
      { name: "dropoffPoint", label: "Drop-off point" },
      { name: "bookingCode", label: "Booking code" }
    ],
    stay: [
      { name: "propertyType", label: "Property type", placeholder: "Ryokan / Hotel" },
      { name: "propertyName", label: "Property name", placeholder: "Ryokan Asakusa Shigetsu" },
      { name: "checkInTime", label: "Check-in time", placeholder: "15:00" },
      { name: "checkOutTime", label: "Check-out time", placeholder: "10:00" },
      { name: "nights", label: "Nights", type: "number" },
      { name: "confirmationCode", label: "Confirmation code" },
      { name: "contactPhone", label: "Contact phone" }
    ],
    restaurant: [
      { name: "reservationTime", label: "Reservation time", placeholder: "19:00" },
      { name: "partySize", label: "Party size", type: "number" },
      { name: "confirmationCode", label: "Confirmation code" },
      { name: "contactPhone", label: "Contact phone" },
      { name: "cuisine", label: "Cuisine" },
      { name: "restaurantType", label: "Restaurant type", placeholder: "Fine Dining" },
      { name: "depositAmount", label: "Pre Payment deposit" }
    ],
    shopping: [
      { name: "purchaseItemsText", label: "Purchase items", type: "textarea", span: 2 },
      { name: "taxRefund", label: "Tax refund" },
      { name: "brand", label: "Brand" }
    ],
    sight: [
      { name: "openingHours", label: "Opening hours" },
      { name: "ticketType", label: "Ticket type" },
      { name: "durationMinutes", label: "Duration minutes", type: "number" }
    ],
    experience: [
      { name: "openingHours", label: "Opening hours" },
      { name: "ticketType", label: "Ticket type" },
      { name: "durationMinutes", label: "Duration minutes", type: "number" },
      { name: "bookingCode", label: "Booking code" }
    ],
    other: [{ name: "summary", label: "Summary", type: "textarea", span: 2 }]
  };

  let { data, form }: { data: PageData; form: ActionData } = $props();
  const trip = $derived(data.trip);
  const grouped = $derived(groupByDay(trip.items));
  const selectedDay = $derived(data.selectedDay || grouped[0]?.date || "");
  const selectedPanel = $derived(data.selectedPanel || "item");
  const selectedItem = $derived(data.selectedItem);
  let formDayDate = $state("");
  let formStartTime = $state("");
  let formEndTime = $state("");
  let formPlaceName = $state("");
  let formNativeName = $state("");
  let formCategory = $state<TripCategory>("transport");
  let formSubcategory = $state<TripSubcategory>("flight");
  let detailValues = $state<Record<string, string>>({});
  let passengerRows = $state<PassengerRow[]>([{ nameEn: "", className: "", car: "", seat: "" }]);
  let stayRoomRows = $state<StayRoomRow[]>([emptyStayRoom()]);
  let preorderRows = $state<RestaurantCourseRow[]>([emptyRestaurantCourse()]);
  let recommendedRows = $state<RestaurantCourseRow[]>([emptyRestaurantCourse()]);
  let orderRows = $state<RestaurantOrderRow[]>([emptyRestaurantOrder()]);
  let flightResolveMessage = $state("");
  let flightResolvePending = $state(false);
  let syncedItemId = $state<string | null>(null);
  const activeDetailFields = $derived(detailFieldsBySubcategory[formSubcategory] || []);

  $effect(() => {
    const nextItemId = selectedItem?.id || null;
    if (nextItemId !== syncedItemId) {
      formDayDate = selectedItem?.dayDate || selectedDay;
      formStartTime = selectedItem?.startTime || "";
      formEndTime = selectedItem?.endTime || "";
      formPlaceName = selectedItem?.place.name || "";
      formNativeName = selectedItem?.place.nativeName || "";
      formCategory = coerceCategory(selectedItem?.category);
      formSubcategory = coerceSubcategory(selectedItem?.subcategory, formCategory);
      const nextDetailValues = Object.fromEntries(
        Object.entries(selectedItem?.detailJson || {}).map(([key, value]) => [key, typeof value === "string" ? value : String(value)])
      );
      const meals = selectedItem?.detailJson?.meals;
      if (meals && typeof meals === "object") {
        const mealValues = meals as Record<string, unknown>;
        if (mealValues.breakfast) nextDetailValues.mealBreakfast = "on";
        if (mealValues.lunch) nextDetailValues.mealLunch = "on";
        if (mealValues.dinner) nextDetailValues.mealDinner = "on";
        if (mealValues.miniBar) nextDetailValues.mealMiniBar = "on";
        if (mealValues.lounge) nextDetailValues.mealLounge = "on";
      }
      detailValues = nextDetailValues;
      passengerRows = passengersFromDetail(selectedItem?.detailJson);
      stayRoomRows = stayRoomsFromDetail(selectedItem?.detailJson);
      preorderRows = restaurantCourseRowsFromDetail(selectedItem?.detailJson, "preorder");
      recommendedRows = restaurantCourseRowsFromDetail(selectedItem?.detailJson, "recommended");
      orderRows = restaurantOrderRowsFromDetail(selectedItem?.detailJson);
      flightResolveMessage = "";
      syncedItemId = nextItemId;
    }
  });

  function coerceCategory(value: string | undefined): TripCategory {
    return categoryOptions.some((option) => option.value === value) ? (value as TripCategory) : "transport";
  }

  function coerceSubcategory(value: string | undefined, category: TripCategory): TripSubcategory {
    const options = subcategoryOptions[category];
    return options.some((option) => option.value === value) ? (value as TripSubcategory) : options[0].value;
  }

  function field(key: string) {
    return detailValues[key] || "";
  }

  function detailInputType(field: DetailField) {
    return field.type === "number" || field.type === "url" ? field.type : "text";
  }

  function passengersFromDetail(detail: Record<string, unknown> | undefined): PassengerRow[] {
    const rawPassengers = detail?.passengers;
    if (Array.isArray(rawPassengers)) {
      const parsed = rawPassengers
        .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
        .map((row) => ({
          nameEn: String(row.nameEn || row.englishName || row.passengerNameEn || row.name || row.passengerName || "").trim(),
          className: String(row.className || row.carriageClass || row.cabinClass || row.class || "").trim(),
          car: String(row.car || row.carNumber || "").trim(),
          seat: String(row.seat || "").trim()
        }))
        .filter((row) => row.nameEn || row.className || row.car || row.seat);
      if (parsed.length) return parsed;
    }

    const nameEn = String(detail?.passengerNameEn || detail?.englishName || detail?.passengerName || "").trim();
    const className = String(detail?.carriageClass || detail?.cabinClass || detail?.class || "").trim();
    const car = String(detail?.carNumber || "").trim();
    const seat = String(detail?.seat || "").trim();
    return [{ nameEn, className, car, seat }];
  }

  function updatePassenger(index: number, key: keyof PassengerRow, value: string) {
    passengerRows = passengerRows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row));
  }

  function addPassenger() {
    passengerRows = [...passengerRows, { nameEn: "", className: "", car: "", seat: "" }];
  }

  function removePassenger(index: number) {
    passengerRows =
      passengerRows.length > 1
        ? passengerRows.filter((_, rowIndex) => rowIndex !== index)
        : [{ nameEn: "", className: "", car: "", seat: "" }];
  }

  function emptyStayRoom(): StayRoomRow {
    return {
      images: "",
      roomName: "",
      roomNo: "",
      windowView: "",
      size: "",
      bath: "",
      bed: "",
      roomDesc: "",
      guestName: "",
      guestCount: "1",
      bookingUrl: "",
      paymentMethod: "",
      cardLabel: "",
      reservationStatus: "",
      currency: "",
      amount: "",
      pricePerPerson: "",
      roomUrl: ""
    };
  }

  function emptyRestaurantCourse(): RestaurantCourseRow {
    return { name: "", nativeName: "", description: "", price: "" };
  }

  function emptyRestaurantOrder(): RestaurantOrderRow {
    return { ...emptyRestaurantCourse(), quantity: "1", amount: "" };
  }

  function stayRoomsFromDetail(detail: Record<string, unknown> | undefined): StayRoomRow[] {
    const rawRooms = detail?.rooms;
    if (Array.isArray(rawRooms)) {
      const parsed = rawRooms
        .filter((room): room is Record<string, unknown> => Boolean(room) && typeof room === "object")
        .map((room) => {
          const guests = Array.isArray(room.guests) ? room.guests : [];
          const firstGuest = guests.find((guest): guest is Record<string, unknown> => Boolean(guest) && typeof guest === "object");
          return {
            images: Array.isArray(room.images) ? room.images.join("\n") : String(room.images || room.photos || ""),
            roomName: String(room.roomName || room.roomType || room.name || ""),
            roomNo: String(room.roomNo || room.roomNumber || ""),
            windowView: String(room.windowView || room.view || ""),
            size: String(room.size || ""),
            bath: String(room.bath || ""),
            bed: String(room.bed || ""),
            roomDesc: String(room.roomDesc || room.description || ""),
            guestName: String(firstGuest?.name || firstGuest?.nameEn || ""),
            guestCount: String(room.guestCount || firstGuest?.guestCount || "1"),
            bookingUrl: String(room.bookingUrl || room.reservationUrl || ""),
            paymentMethod: String(room.paymentMethod || ""),
            cardLabel: String(room.cardLabel || ""),
            reservationStatus: String(room.reservationStatus || room.status || ""),
            currency: String(room.currency || selectedItem?.currency || trip.defaultCurrency || defaultCurrencyCode),
            amount: String(room.amount || ""),
            pricePerPerson: String(firstGuest?.pricePerPerson || firstGuest?.farePerNight || room.pricePerPerson || ""),
            roomUrl: String(room.roomUrl || room.url || "")
          };
        });
      if (parsed.length) return parsed;
    }

    return [
      {
        ...emptyStayRoom(),
        images: String(detail?.images || detail?.photos || detail?.imageUrl || ""),
        roomName: String(detail?.roomName || detail?.roomType || detail?.roomInfo || ""),
        roomNo: String(detail?.roomNo || detail?.roomNumber || ""),
        windowView: String(detail?.windowView || detail?.view || ""),
        size: String(detail?.size || ""),
        bath: String(detail?.bath || ""),
        bed: String(detail?.bed || ""),
        roomDesc: String(detail?.roomDesc || detail?.description || ""),
        guestName: String(detail?.guestName || detail?.guest || ""),
        guestCount: String(detail?.guestCount || "1"),
        bookingUrl: String(detail?.bookingUrl || detail?.reservationUrl || ""),
        paymentMethod: String(detail?.paymentMethod || selectedItem?.paymentMethod || ""),
        cardLabel: String(detail?.cardLabel || selectedItem?.cardLabel || ""),
        reservationStatus: String(detail?.reservationStatus || selectedItem?.reservationStatus || ""),
        currency: String(detail?.currency || selectedItem?.currency || trip.defaultCurrency || defaultCurrencyCode),
        amount: String(detail?.amount || selectedItem?.amount || ""),
        pricePerPerson: String(detail?.pricePerPerson || detail?.farePerNight || ""),
        roomUrl: String(detail?.roomUrl || detail?.roomInfoUrl || "")
      }
    ];
  }

  function updateStayRoom(index: number, key: keyof StayRoomRow, value: string) {
    stayRoomRows = stayRoomRows.map((room, roomIndex) => (roomIndex === index ? { ...room, [key]: value } : room));
  }

  function addStayRoom() {
    stayRoomRows = [...stayRoomRows, emptyStayRoom()];
  }

  function removeStayRoom(index: number) {
    stayRoomRows = stayRoomRows.length > 1 ? stayRoomRows.filter((_, roomIndex) => roomIndex !== index) : [emptyStayRoom()];
  }

  function restaurantCourseRowsFromDetail(detail: Record<string, unknown> | undefined, type: "preorder" | "recommended"): RestaurantCourseRow[] {
    const source = type === "preorder" ? detail?.preorderCourses || detail?.preorderCourse : detail?.recommendedMenu || detail?.recommendedItems;
    const rows = Array.isArray(source) ? source : source && typeof source === "object" ? [source] : [];
    const parsed = rows
      .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
      .map((row) => ({
        name: String(row.courseName || row.name || row.itemName || ""),
        nativeName: String(row.courseNameNative || row.nativeName || row.nameNative || row.originalName || ""),
        description: String(row.description || row.desc || ""),
        price: String(row.pricePerPerson || row.price || row.unitPrice || "")
      }))
      .filter((row) => row.name || row.nativeName || row.description || row.price);
    return parsed.length ? parsed : [emptyRestaurantCourse()];
  }

  function restaurantOrderRowsFromDetail(detail: Record<string, unknown> | undefined): RestaurantOrderRow[] {
    const rawOrders = detail?.orders || detail?.orderItems || detail?.menuItems || detail?.items;
    const parsed = (Array.isArray(rawOrders) ? rawOrders : [])
      .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
      .map((row) => ({
        name: String(row.name || row.itemName || row.title || ""),
        nativeName: String(row.nativeName || row.nameNative || row.originalName || ""),
        description: String(row.description || row.desc || ""),
        price: String(row.price || row.unitPrice || ""),
        quantity: String(row.quantity || row.qty || "1"),
        amount: String(row.amount || row.subtotal || "")
      }))
      .filter((row) => row.name || row.nativeName || row.description || row.price || row.amount);
    return parsed.length ? parsed : [emptyRestaurantOrder()];
  }

  function updateRestaurantCourse(kind: "preorder" | "recommended", index: number, key: keyof RestaurantCourseRow, value: string) {
    const updater = (row: RestaurantCourseRow, rowIndex: number) => (rowIndex === index ? { ...row, [key]: value } : row);
    if (kind === "preorder") preorderRows = preorderRows.map(updater);
    if (kind === "recommended") recommendedRows = recommendedRows.map(updater);
  }

  function addRestaurantCourse(kind: "preorder" | "recommended") {
    if (kind === "preorder") preorderRows = [...preorderRows, emptyRestaurantCourse()];
    if (kind === "recommended") recommendedRows = [...recommendedRows, emptyRestaurantCourse()];
  }

  function removeRestaurantCourse(kind: "preorder" | "recommended", index: number) {
    if (kind === "preorder") preorderRows = preorderRows.length > 1 ? preorderRows.filter((_, rowIndex) => rowIndex !== index) : [emptyRestaurantCourse()];
    if (kind === "recommended") recommendedRows = recommendedRows.length > 1 ? recommendedRows.filter((_, rowIndex) => rowIndex !== index) : [emptyRestaurantCourse()];
  }

  function updateRestaurantOrder(index: number, key: keyof RestaurantOrderRow, value: string) {
    orderRows = orderRows.map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      const next = { ...row, [key]: value };
      if (key === "price" || key === "quantity") {
        next.amount = restaurantOrderAmount(next);
      }
      return next;
    });
  }

  function addRestaurantOrder() {
    orderRows = [...orderRows, emptyRestaurantOrder()];
  }

  function removeRestaurantOrder(index: number) {
    orderRows = orderRows.length > 1 ? orderRows.filter((_, rowIndex) => rowIndex !== index) : [emptyRestaurantOrder()];
  }

  function restaurantOrderAmount(row: RestaurantOrderRow) {
    const price = parseCurrencyAmount(row.price) || 0;
    const quantity = Number(row.quantity || "1") || 1;
    return price ? formatCurrencyAmount(price * quantity, selectedItem?.currency || trip.defaultCurrency || defaultCurrencyCode) : "";
  }

  function roomAmountValue(room: StayRoomRow) {
    return parseCurrencyAmount(room.amount) || 0;
  }

  function roomGuestCountValue(room: StayRoomRow) {
    const count = Number(room.guestCount || "1");
    return Number.isFinite(count) && count > 0 ? count : 1;
  }

  function roomPricePerPerson(room: StayRoomRow) {
    const amount = roomAmountValue(room);
    if (!amount) return "";
    return formatCurrencyAmount(Math.ceil(amount / roomGuestCountValue(room) / stayNightCount()), room.currency || trip.defaultCurrency || defaultCurrencyCode);
  }

  function stayNightCount() {
    const count = Number(detailValues.nights || "1");
    return Number.isFinite(count) && count > 0 ? Math.ceil(count) : 1;
  }

  function stayTotalAmount() {
    return stayRoomRows.reduce((sum, room) => sum + roomAmountValue(room), 0);
  }

  function stayTotalFare() {
    const total = stayTotalAmount();
    return total ? formatCurrencyAmount(total, stayRoomRows.find((room) => room.currency)?.currency || trip.defaultCurrency || defaultCurrencyCode) : "";
  }

  function handleCategoryChange() {
    formSubcategory = subcategoryOptions[formCategory][0].value;
  }

  function setDetailValues(values: Record<string, unknown>) {
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === "string" && value.trim()) {
        detailValues[key] = value.trim();
      }
    }
  }

  async function resolveFlightDetails() {
    flightResolveMessage = "";
    const flightNumber = detailValues.flightNumber?.trim();

    if (!formDayDate || !flightNumber) {
      flightResolveMessage = "Please enter date and flight number first.";
      return;
    }

    flightResolvePending = true;
    try {
      const response = await fetch("/api/flights/resolve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          flightDate: formDayDate,
          flightNumber
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        flightResolveMessage = payload.message || "Unable to resolve flight.";
        return;
      }

      setDetailValues(payload.detail || {});
      if (payload.startTime) formStartTime = payload.startTime;
      if (payload.endTime) formEndTime = payload.endTime;
      if (payload.placeName) formPlaceName = payload.placeName;
      if (payload.nativeName) formNativeName = payload.nativeName;
      flightResolveMessage = "Flight details updated.";
    } catch {
      flightResolveMessage = "Unable to connect to the flight resolver.";
    } finally {
      flightResolvePending = false;
    }
  }

  function confirmDelete(event: SubmitEvent) {
    if (!confirm("Delete this trip item?")) {
      event.preventDefault();
    }
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
        <p>{trip.destination} / {trip.travelerCount} people / {trip.startDate} - {trip.endDate}</p>
      </div>
      <a class="back-link" href={`/trips/${trip.slug}`}>Back to preview</a>
    </header>

    <section class="editor-grid">
      <section class="editor-main">
        {#if selectedPanel === "settings"}
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
                <span>Main currency</span>
                <select name="defaultCurrency" value={trip.defaultCurrency || defaultCurrencyCode}>
                  {#each currencyOptions as option}
                    <option value={option.code}>{option.label}</option>
                  {/each}
                </select>
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

        {:else}
        <section class="editor-panel card">
          <div class="editor-panel__head">
            <div>
              <p class="eyebrow">Trip item</p>
              <h2>{selectedItem ? "Update stop" : "Create new stop"}</h2>
            </div>
            <div class="editor-panel__actions">
              <a class="editor-badge" href={`/trips/${trip.slug}/edit?day=${selectedDay}`}>New item</a>
              {#if selectedItem}
                <form method="post" onsubmit={confirmDelete}>
                  <input type="hidden" name="itemId" value={selectedItem.id} />
                  <input type="hidden" name="dayDate" value={selectedItem.dayDate} />
                  <button class="editor-delete" type="submit" formaction="?/delete">Delete</button>
                </form>
              {/if}
            </div>
          </div>

          <form class="place-form" method="post">
            <input type="hidden" name="itemId" value={selectedItem?.id || ""} />
            <input type="hidden" name="placeId" value={selectedItem?.place.id || ""} />

            <div class="form-grid">
              <label class="field">
                <span>Date</span>
                <input type="date" name="dayDate" bind:value={formDayDate} required />
              </label>
              <label class="field">
                <span>Start time</span>
                <input type="time" name="startTime" bind:value={formStartTime} />
              </label>
              <label class="field">
                <span>End time</span>
                <input type="time" name="endTime" bind:value={formEndTime} />
              </label>
              <label class="field">
                <span>Category</span>
                <select name="category" bind:value={formCategory} onchange={handleCategoryChange}>
                  {#each categoryOptions as categoryOption}
                    <option value={categoryOption.value}>{categoryOption.label}</option>
                  {/each}
                </select>
              </label>
              <label class="field">
                <span>Subcategory</span>
                <select name="subcategory" bind:value={formSubcategory}>
                  {#each subcategoryOptions[formCategory] as subcategoryOption}
                    <option value={subcategoryOption.value}>{subcategoryOption.label}</option>
                  {/each}
                </select>
              </label>
            </div>

            <div class="form-grid">
              <label class="field field--span-2">
                <span>Place name</span>
                <input name="name" bind:value={formPlaceName} required />
              </label>
              <label class="field">
                <span>Native name</span>
                <input name="nativeName" bind:value={formNativeName} />
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
                <select name="currency" value={selectedItem?.currency || trip.defaultCurrency || defaultCurrencyCode}>
                  {#each currencyOptions as option}
                    <option value={option.code}>{option.label}</option>
                  {/each}
                </select>
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

            {#if activeDetailFields.length}
              <section class="detail-fieldset">
                <div class="detail-fieldset__head">
                  <div>
                    <p class="eyebrow">Type-specific details</p>
                    <h3>{subcategoryLabel(formSubcategory)}</h3>
                  </div>
                  {#if formSubcategory === "flight"}
                    <button class="soft-button" type="button" onclick={resolveFlightDetails} disabled={flightResolvePending}>
                      {flightResolvePending ? "Fetching..." : "Fetch flight"}
                    </button>
                  {/if}
                </div>
                {#if flightResolveMessage && formSubcategory === "flight"}
                  <p class="inline-message">{flightResolveMessage}</p>
                {/if}
                <div class="form-grid">
                  {#each activeDetailFields as detailField}
                    <label class={`field ${detailField.span === 2 ? "field--span-2" : ""}`}>
                      <span>{detailField.label}</span>
                      {#if detailField.type === "textarea"}
                        <textarea
                          name={`detail.${detailField.name}`}
                          rows="3"
                          placeholder={detailField.placeholder || ""}
                          bind:value={detailValues[detailField.name]}
                        ></textarea>
                      {:else}
                        <input
                          type={detailInputType(detailField)}
                          step={detailField.type === "number" ? "0.01" : undefined}
                          name={`detail.${detailField.name}`}
                          bind:value={detailValues[detailField.name]}
                          placeholder={detailField.placeholder || ""}
                        />
                      {/if}
                    </label>
                  {/each}
                </div>
                {#if formSubcategory === "flight" || formSubcategory === "train"}
                  <section class="passenger-editor" aria-label={`${subcategoryLabel(formSubcategory)} passengers`}>
                    <div class="passenger-editor__head">
                      <div>
                        <p class="eyebrow">Passengers</p>
                        <h3>{formSubcategory === "train" ? "English name, class, car and seat" : "English name and seat"}</h3>
                      </div>
                      <button class="soft-button" type="button" onclick={addPassenger}>Add passenger</button>
                    </div>
                    <div class="passenger-rows">
                      {#each passengerRows as passenger, index}
                        <div class="passenger-row">
                          <label class="field">
                            <span>English name</span>
                            <input
                              name="passengerNameEn"
                              value={passenger.nameEn}
                              placeholder="TANAKA YUKI"
                              oninput={(event) => updatePassenger(index, "nameEn", (event.currentTarget as HTMLInputElement).value)}
                            />
                          </label>
                          {#if formSubcategory === "train"}
                            <label class="field">
                              <span>Carriage class</span>
                              <input
                                name="passengerClass"
                                value={passenger.className}
                                placeholder="First class"
                                oninput={(event) => updatePassenger(index, "className", (event.currentTarget as HTMLInputElement).value)}
                              />
                            </label>
                            <label class="field">
                              <span>Car number</span>
                              <input
                                name="passengerCar"
                                value={passenger.car}
                                placeholder="8"
                                oninput={(event) => updatePassenger(index, "car", (event.currentTarget as HTMLInputElement).value)}
                              />
                            </label>
                          {/if}
                          <label class="field">
                            <span>Seat</span>
                            <input
                              name="passengerSeat"
                              value={passenger.seat}
                              placeholder="24A"
                              oninput={(event) => updatePassenger(index, "seat", (event.currentTarget as HTMLInputElement).value)}
                            />
                          </label>
                          <button class="row-remove" type="button" aria-label="Remove passenger" onclick={() => removePassenger(index)}>×</button>
                        </div>
                      {/each}
                    </div>
                  </section>
                {/if}
                {#if formCategory === "stay"}
                  <section class="stay-editor" aria-label="Stay details">
                    <input type="hidden" name="detail.totalFare" value={stayTotalFare()} />
                    <div class="passenger-editor__head">
                      <div>
                        <p class="eyebrow">Meals</p>
                        <h3>Included meals</h3>
                      </div>
                    </div>
                    <div class="meal-checkboxes">
                      <label><input type="checkbox" name="stayMealBreakfast" checked={detailValues.mealBreakfast === "on"} /> Breakfast</label>
                      <label><input type="checkbox" name="stayMealLunch" checked={detailValues.mealLunch === "on"} /> Lunch</label>
                      <label><input type="checkbox" name="stayMealDinner" checked={detailValues.mealDinner === "on"} /> Dinner</label>
                      <label><input type="checkbox" name="stayMealMiniBar" checked={detailValues.mealMiniBar === "on"} /> Mini Bar</label>
                      <label><input type="checkbox" name="stayMealLounge" checked={detailValues.mealLounge === "on"} /> Lounge</label>
                    </div>

                    <div class="passenger-editor__head">
                      <div>
                        <p class="eyebrow">Rooms</p>
                        <h3>Multiple room types</h3>
                      </div>
                      <button class="soft-button" type="button" onclick={addStayRoom}>Add room</button>
                    </div>
                    <div class="stay-room-rows">
                      {#each stayRoomRows as room, index}
                        <section class="stay-room-row">
                          <div class="room-row-head">
                            <strong>Room {index + 1}</strong>
                            <button class="row-remove" type="button" aria-label="Remove room" onclick={() => removeStayRoom(index)}>×</button>
                          </div>
                          <div class="form-grid">
                            <label class="field field--span-2">
                              <span>Image URLs</span>
                              <textarea
                                name="stayRoomImages"
                                rows="3"
                                placeholder="One image URL per line"
                                value={room.images}
                                oninput={(event) => updateStayRoom(index, "images", (event.currentTarget as HTMLTextAreaElement).value)}
                              ></textarea>
                            </label>
                            <label class="field">
                              <span>Room name</span>
                              <input name="stayRoomName" value={room.roomName} oninput={(event) => updateStayRoom(index, "roomName", (event.currentTarget as HTMLInputElement).value)} />
                            </label>
                            <label class="field">
                              <span>Room no.</span>
                              <input name="stayRoomNo" value={room.roomNo} oninput={(event) => updateStayRoom(index, "roomNo", (event.currentTarget as HTMLInputElement).value)} />
                            </label>
                            <label class="field">
                              <span>Window view</span>
                              <input name="stayRoomWindowView" value={room.windowView} placeholder="Ocean View" oninput={(event) => updateStayRoom(index, "windowView", (event.currentTarget as HTMLInputElement).value)} />
                            </label>
                            <label class="field">
                              <span>Size</span>
                              <input name="stayRoomSize" value={room.size} placeholder="30m2" oninput={(event) => updateStayRoom(index, "size", (event.currentTarget as HTMLInputElement).value)} />
                            </label>
                            <label class="field">
                              <span>Bath</span>
                              <input name="stayRoomBath" value={room.bath} placeholder="Private Bath" oninput={(event) => updateStayRoom(index, "bath", (event.currentTarget as HTMLInputElement).value)} />
                            </label>
                            <label class="field">
                              <span>Bed</span>
                              <input name="stayRoomBed" value={room.bed} placeholder="Futon / Twin" oninput={(event) => updateStayRoom(index, "bed", (event.currentTarget as HTMLInputElement).value)} />
                            </label>
                            <label class="field">
                              <span>Guest name</span>
                              <input name="stayRoomGuestName" value={room.guestName} placeholder="TANAKA YUKI" oninput={(event) => updateStayRoom(index, "guestName", (event.currentTarget as HTMLInputElement).value)} />
                            </label>
                            <label class="field">
                              <span>Guest count</span>
                              <input type="number" min="1" name="stayRoomGuestCount" value={room.guestCount} oninput={(event) => updateStayRoom(index, "guestCount", (event.currentTarget as HTMLInputElement).value)} />
                            </label>
                            <label class="field field--span-2">
                              <span>Booking URL</span>
                              <input name="stayRoomBookingUrl" value={room.bookingUrl} oninput={(event) => updateStayRoom(index, "bookingUrl", (event.currentTarget as HTMLInputElement).value)} />
                            </label>
                            <label class="field">
                              <span>Payment method</span>
                              <input name="stayRoomPaymentMethod" value={room.paymentMethod} placeholder="Credit card / Cash" oninput={(event) => updateStayRoom(index, "paymentMethod", (event.currentTarget as HTMLInputElement).value)} />
                            </label>
                            <label class="field">
                              <span>Card label</span>
                              <input name="stayRoomCardLabel" value={room.cardLabel} oninput={(event) => updateStayRoom(index, "cardLabel", (event.currentTarget as HTMLInputElement).value)} />
                            </label>
                            <label class="field">
                              <span>Reservation status</span>
                              <input name="stayRoomReservationStatus" value={room.reservationStatus} placeholder="Paid / Reserved" oninput={(event) => updateStayRoom(index, "reservationStatus", (event.currentTarget as HTMLInputElement).value)} />
                            </label>
                            <label class="field">
                              <span>Currency</span>
                              <select name="stayRoomCurrency" value={room.currency || trip.defaultCurrency || defaultCurrencyCode} onchange={(event) => updateStayRoom(index, "currency", (event.currentTarget as HTMLSelectElement).value)}>
                                {#each currencyOptions as option}
                                  <option value={option.code}>{option.label}</option>
                                {/each}
                              </select>
                            </label>
                            <label class="field">
                              <span>Room amount</span>
                              <input type="number" step="0.01" name="stayRoomAmount" value={room.amount} oninput={(event) => updateStayRoom(index, "amount", (event.currentTarget as HTMLInputElement).value)} />
                            </label>
                            <label class="field">
                              <span>Price per person per night</span>
                              <input name="stayRoomPricePerPerson" value={roomPricePerPerson(room)} readonly />
                            </label>
                            <label class="field field--span-2">
                              <span>Room URL</span>
                              <input name="stayRoomUrl" value={room.roomUrl} oninput={(event) => updateStayRoom(index, "roomUrl", (event.currentTarget as HTMLInputElement).value)} />
                            </label>
                            <label class="field field--span-2">
                              <span>Room description</span>
                              <textarea
                                name="stayRoomDesc"
                                rows="3"
                                value={room.roomDesc}
                                oninput={(event) => updateStayRoom(index, "roomDesc", (event.currentTarget as HTMLTextAreaElement).value)}
                              ></textarea>
                            </label>
                          </div>
                        </section>
                      {/each}
                    </div>
                    <div class="stay-total">
                      <span>Total fare</span>
                      <strong>{stayTotalFare() || "--"}</strong>
                    </div>
                  </section>
                {/if}
                {#if formCategory === "restaurant"}
                  <section class="stay-editor" aria-label="Restaurant details">
                    <div class="passenger-editor__head">
                      <div>
                        <p class="eyebrow">Reservation</p>
                        <h3>Dining details</h3>
                      </div>
                    </div>
                    <div class="form-grid">
                      <label class="field">
                        <span>Seating</span>
                        <select name="detail.seating" value={detailValues.seating || ""} onchange={(event) => setDetailValues({ seating: (event.currentTarget as HTMLSelectElement).value })}>
                          <option value="">Select seating</option>
                          {#each restaurantSeatingOptions as option}
                            <option value={option.value}>{option.label}</option>
                          {/each}
                        </select>
                      </label>
                      <label class="field">
                        <span>Payment status</span>
                        <input name="detail.paymentStatus" value={detailValues.paymentStatus || selectedItem?.reservationStatus || ""} oninput={(event) => setDetailValues({ paymentStatus: (event.currentTarget as HTMLInputElement).value })} />
                      </label>
                    </div>

                    <div class="passenger-editor__head">
                      <div>
                        <p class="eyebrow">Preorder</p>
                        <h3>Course list</h3>
                      </div>
                      <button class="soft-button" type="button" onclick={() => addRestaurantCourse("preorder")}>Add course</button>
                    </div>
                    <div class="stay-room-rows">
                      {#each preorderRows as row, index}
                        <section class="stay-room-row">
                          <div class="room-row-head">
                            <strong>Course {index + 1}</strong>
                            <button class="row-remove" type="button" aria-label="Remove preorder course" onclick={() => removeRestaurantCourse("preorder", index)}>×</button>
                          </div>
                          <div class="form-grid">
                            <label class="field"><span>Course name</span><input name="preorderCourseName" value={row.name} oninput={(event) => updateRestaurantCourse("preorder", index, "name", (event.currentTarget as HTMLInputElement).value)} /></label>
                            <label class="field"><span>Original name</span><input name="preorderCourseNative" value={row.nativeName} oninput={(event) => updateRestaurantCourse("preorder", index, "nativeName", (event.currentTarget as HTMLInputElement).value)} /></label>
                            <label class="field"><span>Price per person</span><input name="preorderCoursePrice" value={row.price} oninput={(event) => updateRestaurantCourse("preorder", index, "price", (event.currentTarget as HTMLInputElement).value)} /></label>
                            <label class="field field--span-2"><span>Description</span><textarea name="preorderCourseDescription" rows="2" value={row.description} oninput={(event) => updateRestaurantCourse("preorder", index, "description", (event.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
                          </div>
                        </section>
                      {/each}
                    </div>

                    <div class="passenger-editor__head">
                      <div>
                        <p class="eyebrow">Recommended</p>
                        <h3>Menu list</h3>
                      </div>
                      <button class="soft-button" type="button" onclick={() => addRestaurantCourse("recommended")}>Add menu</button>
                    </div>
                    <div class="stay-room-rows">
                      {#each recommendedRows as row, index}
                        <section class="stay-room-row">
                          <div class="room-row-head">
                            <strong>Menu {index + 1}</strong>
                            <button class="row-remove" type="button" aria-label="Remove recommended menu" onclick={() => removeRestaurantCourse("recommended", index)}>×</button>
                          </div>
                          <div class="form-grid">
                            <label class="field"><span>Name</span><input name="recommendedName" value={row.name} oninput={(event) => updateRestaurantCourse("recommended", index, "name", (event.currentTarget as HTMLInputElement).value)} /></label>
                            <label class="field"><span>Original name</span><input name="recommendedNative" value={row.nativeName} oninput={(event) => updateRestaurantCourse("recommended", index, "nativeName", (event.currentTarget as HTMLInputElement).value)} /></label>
                            <label class="field"><span>Unit price</span><input name="recommendedPrice" value={row.price} oninput={(event) => updateRestaurantCourse("recommended", index, "price", (event.currentTarget as HTMLInputElement).value)} /></label>
                            <label class="field field--span-2"><span>Description</span><textarea name="recommendedDescription" rows="2" value={row.description} oninput={(event) => updateRestaurantCourse("recommended", index, "description", (event.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
                          </div>
                        </section>
                      {/each}
                    </div>

                    <div class="passenger-editor__head">
                      <div>
                        <p class="eyebrow">Order</p>
                        <h3>Order items</h3>
                      </div>
                      <button class="soft-button" type="button" onclick={addRestaurantOrder}>Add item</button>
                    </div>
                    <div class="stay-room-rows">
                      {#each orderRows as row, index}
                        <section class="stay-room-row">
                          <div class="room-row-head">
                            <strong>Order {index + 1}</strong>
                            <button class="row-remove" type="button" aria-label="Remove order item" onclick={() => removeRestaurantOrder(index)}>×</button>
                          </div>
                          <div class="form-grid">
                            <label class="field"><span>Name</span><input name="orderItemName" value={row.name} oninput={(event) => updateRestaurantOrder(index, "name", (event.currentTarget as HTMLInputElement).value)} /></label>
                            <label class="field"><span>Original name</span><input name="orderItemNative" value={row.nativeName} oninput={(event) => updateRestaurantOrder(index, "nativeName", (event.currentTarget as HTMLInputElement).value)} /></label>
                            <label class="field"><span>Unit price</span><input name="orderItemPrice" value={row.price} oninput={(event) => updateRestaurantOrder(index, "price", (event.currentTarget as HTMLInputElement).value)} /></label>
                            <label class="field"><span>Quantity</span><input type="number" min="1" name="orderItemQuantity" value={row.quantity} oninput={(event) => updateRestaurantOrder(index, "quantity", (event.currentTarget as HTMLInputElement).value)} /></label>
                            <label class="field"><span>Subtotal</span><input name="orderItemAmount" value={row.amount || restaurantOrderAmount(row)} readonly /></label>
                            <label class="field field--span-2"><span>Notes</span><textarea name="orderItemDescription" rows="2" value={row.description} oninput={(event) => updateRestaurantOrder(index, "description", (event.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
                          </div>
                        </section>
                      {/each}
                    </div>
                  </section>
                {/if}
              </section>
            {/if}

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
        {/if}
      </section>

      <aside class="editor-side">
        <section class="card control-card">
          <p class="eyebrow">Controls</p>
          <nav class="control-list">
            <a class:selected={selectedPanel === "item" && !selectedItem} href={`/trips/${trip.slug}/edit?day=${selectedDay}`}>
              <strong>New item</strong>
              <span>Add a stop to the selected day</span>
            </a>
            <a class:selected={selectedPanel === "item" && Boolean(selectedItem)} href={selectedItem ? `/trips/${trip.slug}/edit?day=${selectedDay}&item=${selectedItem.id}` : `/trips/${trip.slug}/edit?day=${selectedDay}`}>
              <strong>Edit item</strong>
              <span>{selectedItem ? selectedItem.place.name : "Pick an item below"}</span>
            </a>
            <a class:selected={selectedPanel === "settings"} href={`/trips/${trip.slug}/edit?panel=settings`}>
              <strong>Trip settings</strong>
              <span>Title, dates, cover, access</span>
            </a>
          </nav>
        </section>

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
                <span>
                  {item.startTime || "All day"} / {categoryLabel(item.category)}
                  {item.subcategory ? ` / ${subcategoryLabel(item.subcategory)}` : ""}
                </span>
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
    height: auto;
    overflow-y: auto;
    padding: 40px 24px 56px;
  }

  :global(html),
  :global(body) {
    overflow-y: auto;
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
  .control-card,
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
  .editor-panel__actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .editor-panel__actions :global(form) {
    margin: 0;
  }
  .editor-panel__head h2,
  .day-summary h3 {
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
  .control-list {
    display: grid;
    gap: 10px;
    margin-top: 16px;
  }
  .control-list a {
    display: grid;
    gap: 4px;
    padding: 14px;
    border: 1px solid var(--border);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
  }
  .control-list a.selected {
    border-color: rgba(230, 80, 79, 0.34);
    background: rgba(230, 80, 79, 0.08);
    box-shadow: 0 12px 28px rgba(17, 24, 39, 0.06);
  }
  .control-list strong,
  .control-list span {
    display: block;
  }
  .control-list span {
    color: var(--muted);
    font-size: 0.9rem;
  }
  .editor-delete {
    display: inline-flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 999px;
    border: 1px solid rgba(230, 80, 79, 0.18);
    background: rgba(230, 80, 79, 0.08);
    color: var(--accent);
    font: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
  }
  .editor-message {
    margin: 0 0 16px;
    color: var(--accent);
    font-weight: 600;
  }
  .detail-fieldset {
    display: grid;
    gap: 14px;
    padding: 18px;
    border: 1px solid rgba(29, 36, 51, 0.08);
    border-radius: 24px;
    background: rgba(248, 247, 242, 0.62);
  }
  .detail-fieldset__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .detail-fieldset h3 {
    margin: 2px 0 0;
    font-family: var(--font-display);
    font-size: 1.25rem;
  }
  .soft-button {
    border: 1px solid rgba(29, 36, 51, 0.12);
    border-radius: 999px;
    background: white;
    color: var(--ink);
    cursor: pointer;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 800;
    padding: 10px 14px;
    white-space: nowrap;
  }
  .soft-button:disabled {
    cursor: wait;
    opacity: 0.62;
  }
  .inline-message {
    margin: 0;
    color: var(--muted);
    font-size: 0.92rem;
  }
  .passenger-editor {
    display: grid;
    gap: 12px;
    padding-top: 4px;
  }
  .passenger-editor__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .passenger-editor__head h3 {
    margin: 2px 0 0;
    font-family: var(--font-display);
    font-size: 1.1rem;
  }
  .passenger-rows {
    display: grid;
    gap: 10px;
  }
  .passenger-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(7rem, 0.42fr) auto;
    gap: 10px;
    align-items: end;
    padding: 12px;
    border: 1px solid rgba(29, 36, 51, 0.08);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.72);
  }
  .row-remove {
    width: 2.75rem;
    height: 2.75rem;
    border: 1px solid rgba(29, 36, 51, 0.1);
    border-radius: 999px;
    background: white;
    color: var(--muted);
    cursor: pointer;
    font-size: 1.3rem;
    line-height: 1;
  }
  .stay-editor {
    display: grid;
    gap: 18px;
    padding-top: 4px;
  }
  .meal-checkboxes {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .meal-checkboxes label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 42px;
    border: 1px solid rgba(29, 36, 51, 0.1);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.74);
    color: var(--ink);
    cursor: pointer;
    font-weight: 750;
    padding: 0 14px;
  }
  .meal-checkboxes input {
    accent-color: var(--accent);
  }
  .stay-room-rows {
    display: grid;
    gap: 14px;
  }
  .stay-room-row {
    display: grid;
    gap: 14px;
    border: 1px solid rgba(29, 36, 51, 0.1);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.68);
    box-shadow: 0 14px 34px rgba(17, 24, 39, 0.05);
    padding: 14px;
  }
  .room-row-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .room-row-head strong {
    font-family: var(--font-display);
    font-size: 1.05rem;
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
  .field input[readonly] {
    color: var(--muted);
    background: rgba(248, 247, 242, 0.78);
  }
  .field--span-2 {
    grid-column: span 2;
  }
  .stay-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 16px 18px;
    border-radius: 20px;
    background: rgba(29, 36, 51, 0.04);
    border: 1px solid rgba(29, 36, 51, 0.08);
  }
  .stay-total span {
    color: var(--muted);
    font-weight: 700;
  }
  .stay-total strong {
    font-size: 1.2rem;
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
    .passenger-row {
      grid-template-columns: 1fr;
    }
    .row-remove {
      justify-self: end;
    }
  }
</style>
