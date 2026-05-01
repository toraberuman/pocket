import type { TripDetail, TripSummary } from "$lib/types";

export const demoTrips: TripSummary[] = [
  {
    id: "trip-korea-2026",
    slug: "2026korea",
    title: "2026 Korea Spring Trip",
    destination: "South Korea",
    startDate: "2026-04-02",
    endDate: "2026-04-08",
    travelerCount: 4,
    coverImageUrl:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1600&q=80"
  }
];

export const demoTripDetail: TripDetail = {
  ...demoTrips[0],
  notes: ["Demo trip data"],
  items: [
    {
      id: "ke2086",
      tripId: "trip-korea-2026",
      dayDate: "2026-04-02",
      startTime: "12:00",
      endTime: "15:30",
      category: "transport",
      subcategory: "flight",
      amount: 0,
      currency: "KRW",
      notes: "TPE 12:00 - PUS 15:30",
      detailJson: {
        flightNumber: "KE2086",
        fromAirportCode: "TPE",
        toAirportCode: "PUS",
        airline: "Korean Air",
        mode: "flight"
      },
      place: {
        id: "place-pus",
        name: "Korean Air KE2086",
        nativeName: "대한항공",
        mapsUrl: "https://maps.google.com"
      }
    },
    {
      id: "ananti-room1",
      tripId: "trip-korea-2026",
      dayDate: "2026-04-02",
      startTime: "17:00",
      category: "stay",
      subcategory: "stay",
      reservationStatus: "paid",
      paymentMethod: "card",
      cardLabel: "Richart",
      amount: 689041,
      currency: "KRW",
      notes: "Room1: Cabin U Ocean Village View(9~11F)",
      detailJson: {
        roomType: "Cabin U Ocean Village View(9~11F)",
        checkIn: "16:00",
        checkOut: "12:00",
        meals: "breakfast"
      },
      place: {
        id: "place-ananti",
        name: "Ananti at Busan Village",
        nativeName: "아난티 앳 부산 빌라쥬",
        phone: "051-662-7100",
        address: "Busan",
        websiteUrl: "https://ananti.kr/zh/atbusan",
        mapsUrl: "https://maps.app.goo.gl/kV29t6RAJy5iHJyV6",
        lat: 35.198,
        lng: 129.228
      }
    },
    {
      id: "samwon-dinner",
      tripId: "trip-korea-2026",
      dayDate: "2026-04-02",
      startTime: "19:00",
      category: "restaurant",
      subcategory: "restaurant",
      paymentMethod: "cash",
      amount: 33000,
      currency: "KRW",
      notes: "Dinner",
      place: {
        id: "place-samwon",
        name: "Samwon Noodle House",
        nativeName: "삼원면옥",
        mapsUrl: "https://maps.app.goo.gl/YdZ7dmj2y1uKzXpcA"
      }
    }
  ]
};
