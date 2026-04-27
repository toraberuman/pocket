import type { TripDetail, TripSummary } from "$lib/types";

export const demoTrips: TripSummary[] = [
  {
    id: "trip-korea-2026",
    slug: "2026korea",
    title: "2026.04 韓國賞櫻",
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
  notes: ["同行 4 人", "以包車 + 飯店切換為主", "之後要同步回 Google Drive CSV"],
  items: [
    {
      id: "ke2086",
      tripId: "trip-korea-2026",
      dayDate: "2026-04-02",
      startTime: "12:00",
      endTime: "15:30",
      category: "交通",
      amount: 0,
      currency: "KRW",
      notes: "TPE桃園 12:00 - PUS釜山 15:30",
      detailJson: {
        flightNo: "KE2086",
        fromCode: "TPE",
        toCode: "PUS",
        airline: "大韓航空"
      },
      place: {
        id: "place-pus",
        name: "大韓航空 KE2086",
        nativeName: "대한항공",
        mapsUrl: "https://maps.google.com"
      }
    },
    {
      id: "ananti-room1",
      tripId: "trip-korea-2026",
      dayDate: "2026-04-02",
      startTime: "17:00",
      category: "住宿",
      reservationStatus: "已付款",
      paymentMethod: "刷卡",
      cardLabel: "Richart",
      amount: 689041,
      currency: "KRW",
      notes: "Room1: Cabin U Ocean Village View(9~11F)",
      detailJson: {
        roomType: "Cabin U Ocean Village View(9~11F)",
        checkIn: "16:00",
        checkOut: "12:00",
        meals: "素泊"
      },
      place: {
        id: "place-ananti",
        name: "Ananti at Busan Village",
        nativeName: "아난티 앳 부산 빌라쥬",
        phone: "051-662-7100",
        address: "46083 부산 기장군 기장읍 기장해안로 267-7",
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
      category: "食",
      paymentMethod: "現金",
      amount: 33000,
      currency: "KRW",
      notes: "海鮮刀削麵、冷麵、餃子、海苔飯捲",
      place: {
        id: "place-samwon",
        name: "晚餐 Samwon Nuddle House",
        nativeName: "삼원면옥",
        mapsUrl: "https://maps.app.goo.gl/YdZ7dmj2y1uKzXpcA"
      }
    }
  ]
};
