import { error, fail, redirect } from "@sveltejs/kit";
import { deleteTripItemBySlug, getTripAccessBySlug, getTripBySlug, saveTripItemBySlug, updateTripBySlug } from "$lib/server/db";
import { hasTripAccess, isAdmin, setTripAccess, verifyPassword } from "$lib/server/auth";
import { formatCurrencyAmount, normalizeCurrency, parseCurrencyAmount } from "$lib/currencies";

function normalizeNumber(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  if (!text) return undefined;
  const number = Number(text);
  return Number.isFinite(number) ? number : undefined;
}

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || undefined;
}

function parseDetailJson(value: FormDataEntryValue | null) {
  const text = normalizeText(value);
  if (!text) return undefined;

  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

function collectDetailFields(form: FormData, category?: string) {
  const detail: Record<string, unknown> = {};

  for (const [key, value] of form.entries()) {
    if (!key.startsWith("detail.")) continue;
    detail[key.slice("detail.".length)] = normalizeText(value);
  }

  const names = form.getAll("passengerNameEn").map((value) => normalizeText(value));
  const classes = form.getAll("passengerClass").map((value) => normalizeText(value));
  const cars = form.getAll("passengerCar").map((value) => normalizeText(value));
  const seats = form.getAll("passengerSeat").map((value) => normalizeText(value));
  const passengers = names
    .map((nameEn, index) => ({
      nameEn,
      className: classes[index],
      car: cars[index],
      seat: seats[index]
    }))
    .filter((passenger) => passenger.nameEn || passenger.className || passenger.car || passenger.seat)
    .map((passenger) => ({
      nameEn: passenger.nameEn || "",
      className: passenger.className || "",
      car: passenger.car || "",
      seat: passenger.seat || ""
    }));

  if (passengers.length) {
    detail.passengers = passengers;
    detail.passengerNameEn = passengers[0].nameEn;
    detail.carriageClass = passengers[0].className;
    detail.carNumber = passengers[0].car;
    detail.seat = passengers[0].seat;
  }

  if (category === "stay") {
    detail.meals = {
      breakfast: form.get("stayMealBreakfast") === "on",
      lunch: form.get("stayMealLunch") === "on",
      dinner: form.get("stayMealDinner") === "on",
      miniBar: form.get("stayMealMiniBar") === "on",
      lounge: form.get("stayMealLounge") === "on"
    };

    const roomImages = form.getAll("stayRoomImages").map((value) => normalizeText(value));
    const roomNames = form.getAll("stayRoomName").map((value) => normalizeText(value));
    const roomNos = form.getAll("stayRoomNo").map((value) => normalizeText(value));
    const roomViews = form.getAll("stayRoomWindowView").map((value) => normalizeText(value));
    const roomSizes = form.getAll("stayRoomSize").map((value) => normalizeText(value));
    const roomBaths = form.getAll("stayRoomBath").map((value) => normalizeText(value));
    const roomBeds = form.getAll("stayRoomBed").map((value) => normalizeText(value));
    const roomDescs = form.getAll("stayRoomDesc").map((value) => normalizeText(value));
    const roomGuests = form.getAll("stayRoomGuestName").map((value) => normalizeText(value));
    const roomGuestCounts = form.getAll("stayRoomGuestCount").map((value) => normalizeNumber(value));
    const roomBookingUrls = form.getAll("stayRoomBookingUrl").map((value) => normalizeText(value));
    const roomPaymentMethods = form.getAll("stayRoomPaymentMethod").map((value) => normalizeText(value));
    const roomCardLabels = form.getAll("stayRoomCardLabel").map((value) => normalizeText(value));
    const roomReservationStatuses = form.getAll("stayRoomReservationStatus").map((value) => normalizeText(value));
    const roomCurrencies = form.getAll("stayRoomCurrency").map((value) => normalizeCurrency(normalizeText(value)));
    const roomAmounts = form.getAll("stayRoomAmount").map((value) => normalizeNumber(value));
    const roomPrices = form.getAll("stayRoomPricePerPerson").map((value) => normalizeText(value));
    const roomUrls = form.getAll("stayRoomUrl").map((value) => normalizeText(value));
    const stayNights = Math.max(1, Math.ceil(normalizeNumber(detail.nights as string) || 1));

    const roomCount = Math.max(
      roomImages.length,
      roomNames.length,
      roomNos.length,
      roomViews.length,
      roomSizes.length,
      roomBaths.length,
      roomBeds.length,
      roomDescs.length,
      roomGuests.length,
      roomGuestCounts.length,
      roomBookingUrls.length,
      roomPaymentMethods.length,
      roomCardLabels.length,
      roomReservationStatuses.length,
      roomCurrencies.length,
      roomAmounts.length,
      roomPrices.length,
      roomUrls.length
    );

    const rooms = Array.from({ length: roomCount }, (_, index) => {
      const guestName = roomGuests[index];
      const guestCount = Math.max(1, Math.ceil(roomGuestCounts[index] || 1));
      const roomCurrency = roomCurrencies[index];
      const roomAmount = roomAmounts[index];
      const pricePerPerson = roomAmount ? formatCurrencyAmount(Math.ceil(roomAmount / guestCount / stayNights), roomCurrency) : roomPrices[index];
      const guests = guestName || pricePerPerson ? [{ name: guestName || "", guestCount, pricePerPerson: pricePerPerson || "" }] : [];

      return {
        images: (roomImages[index] || "")
          .split(/\r?\n/)
          .map((image) => image.trim())
          .filter(Boolean),
        roomName: roomNames[index],
        roomNo: roomNos[index],
        windowView: roomViews[index],
        size: roomSizes[index],
        bath: roomBaths[index],
        bed: roomBeds[index],
        roomDesc: roomDescs[index],
        guestCount,
        bookingUrl: roomBookingUrls[index],
        paymentMethod: roomPaymentMethods[index],
        cardLabel: roomCardLabels[index],
        reservationStatus: roomReservationStatuses[index],
        currency: roomCurrency,
        amount: roomAmount,
        pricePerPerson,
        guests,
        roomUrl: roomUrls[index]
      };
    }).filter((room) =>
      room.images.length ||
      room.roomName ||
      room.roomNo ||
      room.windowView ||
      room.size ||
      room.bath ||
      room.bed ||
      room.roomDesc ||
      room.bookingUrl ||
      room.paymentMethod ||
      room.cardLabel ||
      room.reservationStatus ||
      room.amount ||
      room.guests.length ||
      room.roomUrl
    );

    if (rooms.length) {
      detail.rooms = rooms;
      const totalAmount = rooms.reduce((sum, room) => sum + (room.amount || 0), 0);
      if (totalAmount) {
        const currency = rooms.find((room) => room.currency)?.currency;
        detail.totalAmount = totalAmount;
        detail.totalFare = formatCurrencyAmount(totalAmount, currency);
      }
      const firstRoom = rooms[0];
      detail.roomName = firstRoom.roomName;
      detail.roomNo = firstRoom.roomNo;
      detail.windowView = firstRoom.windowView;
      detail.size = firstRoom.size;
      detail.bath = firstRoom.bath;
      detail.bed = firstRoom.bed;
      detail.roomDesc = firstRoom.roomDesc;
      detail.roomUrl = firstRoom.roomUrl;
      detail.guestCount = firstRoom.guestCount;
      detail.bookingUrl = firstRoom.bookingUrl;
      detail.paymentMethod = firstRoom.paymentMethod;
      detail.cardLabel = firstRoom.cardLabel;
      detail.reservationStatus = firstRoom.reservationStatus;
      detail.currency = firstRoom.currency;
      detail.amount = firstRoom.amount;
      detail.pricePerPerson = firstRoom.pricePerPerson;
    }
  }

  if (category === "restaurant") {
    const preorderNames = form.getAll("preorderCourseName").map((value) => normalizeText(value));
    const preorderNatives = form.getAll("preorderCourseNative").map((value) => normalizeText(value));
    const preorderDescriptions = form.getAll("preorderCourseDescription").map((value) => normalizeText(value));
    const preorderPrices = form.getAll("preorderCoursePrice").map((value) => normalizeText(value));
    const preorderCount = Math.max(preorderNames.length, preorderNatives.length, preorderDescriptions.length, preorderPrices.length);
    const preorderCourses = Array.from({ length: preorderCount }, (_, index) => ({
      courseName: preorderNames[index],
      courseNameNative: preorderNatives[index],
      description: preorderDescriptions[index],
      pricePerPerson: preorderPrices[index]
    })).filter((row) => row.courseName || row.courseNameNative || row.description || row.pricePerPerson);

    const recommendedNames = form.getAll("recommendedName").map((value) => normalizeText(value));
    const recommendedNatives = form.getAll("recommendedNative").map((value) => normalizeText(value));
    const recommendedDescriptions = form.getAll("recommendedDescription").map((value) => normalizeText(value));
    const recommendedPrices = form.getAll("recommendedPrice").map((value) => normalizeText(value));
    const recommendedCount = Math.max(recommendedNames.length, recommendedNatives.length, recommendedDescriptions.length, recommendedPrices.length);
    const recommendedMenu = Array.from({ length: recommendedCount }, (_, index) => ({
      name: recommendedNames[index],
      nativeName: recommendedNatives[index],
      description: recommendedDescriptions[index],
      price: recommendedPrices[index]
    })).filter((row) => row.name || row.nativeName || row.description || row.price);

    const orderNames = form.getAll("orderItemName").map((value) => normalizeText(value));
    const orderNatives = form.getAll("orderItemNative").map((value) => normalizeText(value));
    const orderDescriptions = form.getAll("orderItemDescription").map((value) => normalizeText(value));
    const orderPrices = form.getAll("orderItemPrice").map((value) => normalizeText(value));
    const orderQuantities = form.getAll("orderItemQuantity").map((value) => Math.max(1, Math.ceil(normalizeNumber(value) || 1)));
    const orderAmounts = form.getAll("orderItemAmount").map((value) => normalizeText(value));
    const orderCount = Math.max(orderNames.length, orderNatives.length, orderDescriptions.length, orderPrices.length, orderQuantities.length, orderAmounts.length);
    const orders = Array.from({ length: orderCount }, (_, index) => {
      const price = orderPrices[index];
      const quantity = orderQuantities[index] || 1;
      const numericPrice = parseCurrencyAmount(price);
      const amount = orderAmounts[index] || (numericPrice ? formatCurrencyAmount(numericPrice * quantity, normalizeCurrency(normalizeText(form.get("currency")))) : "");
      return {
        name: orderNames[index],
        nativeName: orderNatives[index],
        description: orderDescriptions[index],
        price,
        quantity,
        amount
      };
    }).filter((row) => row.name || row.nativeName || row.description || row.price || row.amount);

    if (preorderCourses.length) detail.preorderCourses = preorderCourses;
    if (recommendedMenu.length) detail.recommendedMenu = recommendedMenu;
    if (orders.length) {
      detail.orders = orders;
      const totalAmount = orders.reduce((sum, order) => sum + (parseCurrencyAmount(order.amount) || 0), 0);
      if (totalAmount) {
        const currency = normalizeCurrency(normalizeText(form.get("currency")));
        detail.totalAmount = formatCurrencyAmount(totalAmount, currency);
      }
    }
  }

  return detail;
}

export async function load({ params, platform, url, cookies }) {
  const access = await getTripAccessBySlug(params.slug, platform?.env);
  if (!access) {
    throw error(404, "Trip not found");
  }

  const admin = await isAdmin(cookies, platform?.env);
  const unlocked = admin || !access.editPasswordHash || hasTripAccess(cookies, params.slug, "edit");

  if (!unlocked) {
    return {
      trip: {
        ...access,
        notes: [],
        items: []
      },
      selectedDay: "",
      selectedItemId: "",
      selectedItem: null,
      selectedPanel: "item",
      locked: true
    };
  }

  const trip = await getTripBySlug(params.slug, platform?.env);
  if (!trip) throw error(404, "Trip not found");

  const selectedDay = url.searchParams.get("day") || trip.items[0]?.dayDate || "";
  const selectedItemId = url.searchParams.get("item") || "";
  const selectedItem = trip.items.find((item) => item.id === selectedItemId) || null;
  const selectedPanel = url.searchParams.get("panel") === "settings" ? "settings" : "item";

  return { trip, selectedDay, selectedItemId, selectedItem, selectedPanel, locked: false };
}

export const actions = {
  unlock: async ({ request, params, platform, cookies }) => {
    const access = await getTripAccessBySlug(params.slug, platform?.env);
    if (!access) throw error(404, "Trip not found");

    if (await isAdmin(cookies, platform?.env)) {
      throw redirect(303, `/trips/${params.slug}/edit`);
    }

    const password = String((await request.formData()).get("password") || "");
    if (!(await verifyPassword(password, access.editPasswordHash))) {
      return fail(401, { message: "Incorrect edit password." });
    }

    setTripAccess(cookies, params.slug, "edit");
    throw redirect(303, `/trips/${params.slug}/edit`);
  },
  save: async ({ request, params, platform, cookies }) => {
    if (!platform?.env?.DB) {
      return fail(503, {
        message: "This editor needs a D1 binding. Use the deployed app or a Wrangler-backed local environment."
      });
    }

    const access = await getTripAccessBySlug(params.slug, platform?.env);
    if (!access) {
      throw error(404, "Trip not found");
    }

    const admin = await isAdmin(cookies, platform?.env);
    const unlocked = admin || !access.editPasswordHash || hasTripAccess(cookies, params.slug, "edit");
    if (!unlocked) {
      return fail(403, {
        message: "Edit access is locked for this trip."
      });
    }

    const form = await request.formData();
    const dayDate = normalizeText(form.get("dayDate"));
    const name = normalizeText(form.get("name"));
    const category = normalizeText(form.get("category"));

    if (!dayDate || !name || !category) {
      return fail(400, {
        message: "Day, place name, and category are required."
      });
    }
    const detailFields = collectDetailFields(form, category);
    const stayTotalAmount = category === "stay" ? parseCurrencyAmount(detailFields.totalAmount as string | number | undefined) : undefined;
    const restaurantTotalAmount = category === "restaurant" ? parseCurrencyAmount(detailFields.totalAmount as string | number | undefined) : undefined;

    const result = await saveTripItemBySlug(
      params.slug,
      {
        itemId: normalizeText(form.get("itemId")),
        placeId: normalizeText(form.get("placeId")),
        dayDate,
        startTime: normalizeText(form.get("startTime")),
        endTime: normalizeText(form.get("endTime")),
        category,
        subcategory: normalizeText(form.get("subcategory")),
        reservationStatus: normalizeText(form.get("reservationStatus")),
        paymentMethod: normalizeText(form.get("paymentMethod")),
        cardLabel: normalizeText(form.get("cardLabel")),
        amount: stayTotalAmount ?? restaurantTotalAmount ?? normalizeNumber(form.get("amount")),
        currency: normalizeCurrency(normalizeText(form.get("currency")) || access.defaultCurrency),
        notes: normalizeText(form.get("notes")),
        name,
        nativeName: normalizeText(form.get("nativeName")),
        mapsUrl: normalizeText(form.get("mapsUrl")),
        address: normalizeText(form.get("address")),
        phone: normalizeText(form.get("phone")),
        websiteUrl: normalizeText(form.get("websiteUrl")),
        reservationUrl: normalizeText(form.get("reservationUrl")),
        roomType: normalizeText(form.get("roomType")),
        roomInfo: normalizeText(form.get("roomInfo")),
        meals: normalizeText(form.get("meals")),
        checkIn: normalizeText(form.get("checkIn")),
        checkOut: normalizeText(form.get("checkOut")),
        imageUrl: normalizeText(form.get("imageUrl")),
        detailFields,
        detailJson: parseDetailJson(form.get("detailJson"))
      },
      platform.env
    );

    throw redirect(303, `/trips/${params.slug}/edit?day=${encodeURIComponent(dayDate)}&item=${encodeURIComponent(result.itemId)}&saved=1`);
  },
  saveTrip: async ({ request, params, platform, cookies }) => {
    if (!platform?.env?.DB) {
      return fail(503, {
        message: "This editor needs a D1 binding. Use the deployed app or a Wrangler-backed local environment."
      });
    }

    const access = await getTripAccessBySlug(params.slug, platform?.env);
    if (!access) {
      throw error(404, "Trip not found");
    }

    const admin = await isAdmin(cookies, platform?.env);
    const unlocked = admin || !access.editPasswordHash || hasTripAccess(cookies, params.slug, "edit");
    if (!unlocked) {
      return fail(403, {
        message: "Edit access is locked for this trip."
      });
    }

    const form = await request.formData();
    const title = normalizeText(form.get("title"));
    const destination = normalizeText(form.get("destination"));
    const startDate = normalizeText(form.get("startDate"));
    const endDate = normalizeText(form.get("endDate"));
    const travelerCount = normalizeNumber(form.get("travelerCount"));

    if (!title || !destination || !startDate || !endDate || !travelerCount) {
      return fail(400, {
        message: "Trip title, destination, dates, and traveler count are required."
      });
    }

    await updateTripBySlug(
      params.slug,
      {
        title,
        destination,
        startDate,
        endDate,
        travelerCount,
        defaultCurrency: normalizeCurrency(normalizeText(form.get("defaultCurrency"))),
        coverImageUrl: normalizeText(form.get("coverImageUrl")),
        isPrivate: form.get("isPrivate") === "on",
        viewPassword: normalizeText(form.get("viewPassword")),
        editPassword: normalizeText(form.get("editPassword"))
      },
      platform.env
    );

    throw redirect(303, `/trips/${params.slug}/edit?panel=settings&settings=saved`);
  },
  delete: async ({ request, params, platform, cookies }) => {
    if (!platform?.env?.DB) {
      return fail(503, {
        message: "This editor needs a D1 binding. Use the deployed app or a Wrangler-backed local environment."
      });
    }

    const access = await getTripAccessBySlug(params.slug, platform?.env);
    if (!access) {
      throw error(404, "Trip not found");
    }

    const admin = await isAdmin(cookies, platform?.env);
    const unlocked = admin || !access.editPasswordHash || hasTripAccess(cookies, params.slug, "edit");
    if (!unlocked) {
      return fail(403, {
        message: "Edit access is locked for this trip."
      });
    }

    const form = await request.formData();
    const itemId = normalizeText(form.get("itemId"));
    const dayDate = normalizeText(form.get("dayDate"));

    if (!itemId) {
      return fail(400, {
        message: "No trip item was selected for deletion."
      });
    }

    await deleteTripItemBySlug(params.slug, itemId, platform.env);

    const redirectUrl = dayDate
      ? `/trips/${params.slug}/edit?day=${encodeURIComponent(dayDate)}&deleted=1`
      : `/trips/${params.slug}/edit?deleted=1`;
    throw redirect(303, redirectUrl);
  }
};
