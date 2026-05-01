"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { MapPin, Train, Utensils, Camera, Building2, TreePine, ChevronLeft, ChevronRight, Map, Plane, X, Bus, Car, Clock, Coffee, Moon, Sun, Bath, Wifi, Wind, Eye, ExternalLink, CreditCard, Wallet, Image, Users, Phone, Star, Banknote, QrCode } from "lucide-react"
import Link from "next/link"

export interface PassengerInfo {
  name: string
  seat?: string
}

export interface FlightDetails {
  airline: string
  flightNumber: string
  departure: {
    airport: string
    code: string
    time: string
    terminal?: string
    gate?: string
  }
  arrival: {
    airport: string
    code: string
    time: string
    terminal?: string
  }
  passengers: PassengerInfo[]
  class?: string
  confirmationCode?: string
}

export interface TransportPassengerInfo {
  name: string
  car?: string
  seat?: string
}

export interface TransportDetails {
  mode: "train" | "bus" | "taxi"
  operator?: string
  line?: string
  trainNumber?: string
  departure: {
    station: string
    time: string
    platform?: string
  }
  arrival: {
    station: string
    time: string
    platform?: string
  }
  duration?: string
  class?: string
  fare?: string
  reservationCode?: string
  passengers?: TransportPassengerInfo[]
}

export interface RoomGuest {
  name: string
  farePerNight?: string
}

export interface RoomInfo {
  roomType: string
  roomNumber?: string
  guests: RoomGuest[]
  tags?: string[]
  description?: string
  photos?: string[]
  roomUrl?: string
  layoutUrl?: string
}

export interface StayDetails {
  propertyName: string
  propertyType?: "hotel" | "ryokan" | "hostel" | "airbnb" | "resort"
  checkIn: {
    date: string
    time: string
  }
  checkOut: {
    date: string
    time: string
  }
  nights: number
  meals?: {
    breakfast?: boolean
    lunch?: boolean
    dinner?: boolean
  }
  rooms: RoomInfo[]
  totalFare?: string
  paymentStatus: "paid" | "pay_on_site" | "partial"
  confirmationCode?: string
  contactPhone?: string
  address?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface MenuItem {
  name: string
  nativeName?: string
  price: string
  quantity: number
  amount: string
}

export interface RecommendedItem {
  name: string
  nativeName?: string
  description?: string
  price?: string
  photoUrl?: string
}

export interface FoodDetails {
  restaurantName: string
  restaurantType?: "restaurant" | "izakaya" | "cafe" | "fine_dining" | "street_food"
  cuisine?: string
  reservation?: {
    date: string
    time: string
    partySize: number
    seating?: string
    confirmationCode?: string
    contactPhone?: string
  }
  address?: string
  coordinates?: {
    lat: number
    lng: number
  }
  recommendedMenu?: RecommendedItem[]
  preorderCourse?: {
    courseName: string
    courseNameNative?: string
    description?: string
    pricePerPerson: string
  }
  orders?: MenuItem[]
  totalAmount?: string
  paymentStatus: "paid" | "pay_on_site" | "deposit_paid"
  paymentMethod?: "credit_card" | "cash" | "ic_card" | "qr_code"
  depositAmount?: string
}

export interface Activity {
  id: string
  time: string
  title: string
  location: string
  type: "transport" | "food" | "sightseeing" | "accommodation" | "nature" | "flight"
  tags?: string[]
  notes?: string
  flightDetails?: FlightDetails
  transportDetails?: TransportDetails
  stayDetails?: StayDetails
  foodDetails?: FoodDetails
}

export interface DaySchedule {
  date: string
  dayLabel: string
  activities: Activity[]
}

const iconMap = {
  transport: Train,
  food: Utensils,
  sightseeing: Camera,
  accommodation: Building2,
  nature: TreePine,
  flight: Plane,
}

const typeLabels = {
  transport: "Transit",
  food: "Dining",
  sightseeing: "Explore",
  accommodation: "Stay",
  nature: "Nature",
  flight: "Flight",
}

export const sampleTrip: DaySchedule[] = [
  {
    date: "05.12",
    dayLabel: "Day 1",
    activities: [
      {
        id: "0",
        time: "06:30",
        title: "Flight to Tokyo",
        location: "SFO to NRT",
        type: "flight",
        tags: ["Direct", "11h 15m"],
        flightDetails: {
          airline: "Japan Airlines",
          flightNumber: "JL 001",
          departure: {
            airport: "San Francisco International",
            code: "SFO",
            time: "06:30",
            terminal: "I",
            gate: "G92",
          },
          arrival: {
            airport: "Narita International",
            code: "NRT",
            time: "15:45+1",
            terminal: "2",
          },
          passengers: [
            { name: "TANAKA YUKI", seat: "24A" },
            { name: "TANAKA HANA", seat: "24B" },
          ],
          class: "Economy",
          confirmationCode: "ABC123",
        },
      },
      {
        id: "1",
        time: "16:00",
        title: "Arrive at Narita Airport",
        location: "Narita, Chiba",
        type: "transport",
        tags: ["JR Pass", "International"],
        notes: "Pick up JR Pass at the airport",
      },
      {
        id: "2",
        time: "11:30",
        title: "Check in at Ryokan",
        location: "Asakusa, Tokyo",
        type: "accommodation",
        tags: ["Traditional", "Onsen"],
        stayDetails: {
          propertyName: "Ryokan Asakusa Shigetsu",
          propertyType: "ryokan",
          checkIn: {
            date: "05.12",
            time: "15:00",
          },
          checkOut: {
            date: "05.13",
            time: "10:00",
          },
          nights: 1,
          meals: {
            breakfast: true,
            dinner: true,
          },
          rooms: [
            {
              roomType: "Traditional Japanese Room",
              roomNumber: "305",
              guests: [
                { name: "TANAKA YUKI", farePerNight: "¥18,000" },
                { name: "TANAKA HANA", farePerNight: "¥18,000" },
              ],
              tags: ["Garden View", "30m²", "Private Bath", "Tatami", "Futon"],
              description: "Elegant tatami room with shoji screens overlooking the zen garden. Includes yukata robes and green tea set.",
              photos: [
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
                "https://images.unsplash.com/photo-1515362778563-6a8d0e44bc0b?w=800",
                "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
              ],
              roomUrl: "https://example.com/ryokan-room-305",
            },
          ],
          totalFare: "¥36,000",
          paymentStatus: "paid",
          confirmationCode: "RSA-2024-7823",
          contactPhone: "+81-3-3842-6431",
          address: "1-31-11 Asakusa, Taito-ku, Tokyo",
          coordinates: {
            lat: 35.7147,
            lng: 139.7966,
          },
        },
      },
      {
        id: "3",
        time: "13:00",
        title: "Lunch at Senso-ji Temple Area",
        location: "Asakusa, Tokyo",
        type: "food",
        tags: ["Soba", "Local"],
        notes: "Try local soba noodles",
      },
      {
        id: "4",
        time: "14:30",
        title: "Senso-ji Temple",
        location: "Asakusa, Tokyo",
        type: "sightseeing",
        tags: ["Temple", "Historic"],
      },
    ],
  },
  {
    date: "05.13",
    dayLabel: "Day 2",
    activities: [
      {
        id: "5",
        time: "08:00",
        title: "Shinkansen to Kyoto",
        location: "Tokyo Station",
        type: "transport",
        tags: ["Bullet Train", "Reserved"],
        notes: "Reserved seats, Car 8",
        transportDetails: {
          mode: "train",
          operator: "JR Central",
          line: "Tokaido Shinkansen",
          trainNumber: "Nozomi 7",
          departure: {
            station: "Tokyo",
            time: "08:00",
            platform: "14",
          },
          arrival: {
            station: "Kyoto",
            time: "10:15",
            platform: "12",
          },
          duration: "2h 15m",
          class: "Reserved",
          fare: "¥13,320",
          reservationCode: "NZM-78234",
          passengers: [
            { name: "TANAKA YUKI", car: "8", seat: "5A" },
            { name: "TANAKA HANA", car: "8", seat: "5B" },
          ],
        },
      },
      {
        id: "6",
        time: "10:15",
        title: "Arrive in Kyoto",
        location: "Kyoto Station",
        type: "transport",
        tags: ["Arrival"],
      },
      {
        id: "7",
        time: "11:30",
        title: "Fushimi Inari Shrine",
        location: "Fushimi, Kyoto",
        type: "sightseeing",
        tags: ["Shrine", "Torii Gates"],
        notes: "Arrive early to avoid crowds",
      },
      {
        id: "8",
        time: "14:00",
        title: "Kaiseki Lunch",
        location: "Gion District",
        type: "food",
        tags: ["Kaiseki", "Fine Dining"],
        foodDetails: {
          restaurantName: "Gion Karyo",
          restaurantType: "fine_dining",
          cuisine: "Kaiseki",
          reservation: {
            date: "05.13",
            time: "14:00",
            partySize: 2,
            seating: "Private Room",
            confirmationCode: "GK-2024-5512",
            contactPhone: "+81-75-561-0015",
          },
          address: "570-235 Gionmachi Minamigawa, Higashiyama-ku, Kyoto",
          coordinates: {
            lat: 35.0037,
            lng: 135.7756,
          },
          recommendedMenu: [
            {
              name: "Seasonal Sashimi",
              nativeName: "旬のお造り",
              description: "Fresh selection of today's finest fish",
              price: "¥2,800",
            },
            {
              name: "Wagyu Beef",
              nativeName: "和牛",
              description: "A5 grade Kyoto beef, grilled to perfection",
              price: "¥4,500",
            },
          ],
          preorderCourse: {
            courseName: "Seasonal Kaiseki Course",
            courseNameNative: "季節の懐石コース",
            description: "8-course meal featuring the finest seasonal ingredients from Kyoto",
            pricePerPerson: "¥15,000",
          },
          orders: [
            { name: "Seasonal Kaiseki Course", nativeName: "季節の懐石コース", price: "¥15,000", quantity: 2, amount: "¥30,000" },
            { name: "Premium Sake Pairing", nativeName: "日本酒ペアリング", price: "¥3,500", quantity: 2, amount: "¥7,000" },
            { name: "Matcha Dessert", nativeName: "抹茶デザート", price: "¥1,200", quantity: 2, amount: "¥2,400" },
          ],
          totalAmount: "¥39,400",
          paymentStatus: "deposit_paid",
          paymentMethod: "credit_card",
          depositAmount: "¥10,000",
        },
      },
      {
        id: "9",
        time: "16:00",
        title: "Arashiyama Bamboo Grove",
        location: "Arashiyama, Kyoto",
        type: "nature",
        tags: ["Bamboo", "Walking"],
      },
      {
        id: "9a",
        time: "18:00",
        title: "Check in at Kyoto Hotel",
        location: "Higashiyama, Kyoto",
        type: "accommodation",
        tags: ["Boutique", "Modern"],
        stayDetails: {
          propertyName: "The Celestine Kyoto Gion",
          propertyType: "hotel",
          checkIn: {
            date: "05.13",
            time: "15:00",
          },
          checkOut: {
            date: "05.15",
            time: "11:00",
          },
          nights: 2,
          meals: {
            breakfast: true,
          },
          rooms: [
            {
              roomType: "Deluxe Twin Room",
              roomNumber: "512",
              guests: [
                { name: "TANAKA YUKI", farePerNight: "¥22,000" },
              ],
              tags: ["City View", "28m²", "Rain Shower", "Mini Bar", "Workspace"],
              description: "Modern room with panoramic views of Higashiyama mountains. Features premium bedding and Nespresso machine.",
              photos: [
                "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
              ],
              roomUrl: "https://example.com/celestine-room-512",
            },
            {
              roomType: "Superior Double Room",
              roomNumber: "514",
              guests: [
                { name: "TANAKA HANA", farePerNight: "¥19,000" },
              ],
              tags: ["Garden View", "24m²", "Soaking Tub", "Balcony"],
              description: "Cozy room with private balcony overlooking the Japanese garden. Includes complimentary mini bar.",
              photos: [
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
              ],
              roomUrl: "https://example.com/celestine-room-514",
            },
          ],
          totalFare: "¥82,000",
          paymentStatus: "pay_on_site",
          confirmationCode: "CLG-89234-KYO",
          contactPhone: "+81-75-532-3111",
          address: "572 Gionmachi Minamigawa, Higashiyama-ku, Kyoto",
          coordinates: {
            lat: 35.0036,
            lng: 135.7780,
          },
        },
      },
    ],
  },
  {
    date: "05.14",
    dayLabel: "Day 3",
    activities: [
      {
        id: "10",
        time: "06:00",
        title: "Kinkaku-ji Golden Pavilion",
        location: "Kita-ku, Kyoto",
        type: "sightseeing",
        tags: ["Temple", "UNESCO"],
        notes: "Best light in the morning",
      },
      {
        id: "10a",
        time: "08:00",
        title: "City Bus to Higashiyama",
        location: "Kinkaku-ji Mae",
        type: "transport",
        tags: ["City Bus", "IC Card"],
        transportDetails: {
          mode: "bus",
          operator: "Kyoto City Bus",
          line: "Route 12",
          trainNumber: "12",
          departure: {
            station: "Kinkaku-ji Mae",
            time: "08:05",
          },
          arrival: {
            station: "Gion",
            time: "08:35",
          },
          duration: "30m",
          fare: "¥230",
          passengers: [
            { name: "TANAKA YUKI" },
            { name: "TANAKA HANA" },
          ],
        },
      },
      {
        id: "11",
        time: "09:00",
        title: "Traditional Tea Ceremony",
        location: "Higashiyama, Kyoto",
        type: "sightseeing",
        tags: ["Tea", "Cultural"],
      },
      {
        id: "12",
        time: "12:00",
        title: "Nishiki Market",
        location: "Nakagyo, Kyoto",
        type: "food",
        tags: ["Market", "Street Food"],
        notes: "Try the pickles and matcha treats",
      },
    ],
  },
]

function TransportTicketCard({
  activity,
  onClose,
}: {
  activity: Activity
  onClose: () => void
}) {
  const transport = activity.transportDetails
  if (!transport) return null

  const modeIcon = {
    train: Train,
    bus: Bus,
    taxi: Car,
  }
  const ModeIcon = modeIcon[transport.mode]

  const modeLabel = {
    train: "Train Ticket",
    bus: "Bus Ticket", 
    taxi: "Taxi Reservation",
  }

  const modeColor = {
    train: "bg-accent",
    bus: "bg-chart-2",
    taxi: "bg-chart-4",
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-card border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header stripe */}
        <div className={cn("px-6 py-4", modeColor[transport.mode])}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center bg-white/20 rounded-sm">
                <ModeIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/70">
                  {modeLabel[transport.mode]}
                </p>
                <p className="text-lg font-light text-white mt-0.5">
                  {transport.operator || activity.title}
                </p>
              </div>
            </div>
            {transport.trainNumber && (
              <div className="text-right">
                <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-white/70">
                  {transport.mode === "train" ? "Train" : "Route"}
                </p>
                <p className="text-xl font-mono font-light text-white">
                  {transport.trainNumber}
                </p>
              </div>
            )}
          </div>
          {transport.line && (
            <p className="text-[11px] text-white/60 mt-2 font-mono tracking-wide">
              {transport.line}
            </p>
          )}
        </div>

        {/* Route section */}
        <div className="px-6 py-6 border-b border-dashed border-border">
          <div className="flex items-start justify-between">
            {/* Departure */}
            <div className="text-left flex-1">
              <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                From
              </p>
              <p className="text-2xl font-light tracking-tight text-foreground mt-1">
                {transport.departure.station}
              </p>
              {transport.departure.platform && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Platform {transport.departure.platform}
                </p>
              )}
            </div>

            {/* Journey indicator */}
            <div className="flex flex-col items-center justify-center px-4 py-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full border-2 border-accent" />
                <div className="h-px w-8 bg-border" />
                <ModeIcon className="h-4 w-4 text-accent" />
                <div className="h-px w-8 bg-border" />
                <div className="h-2 w-2 rounded-full bg-accent" />
              </div>
              {transport.duration && (
                <p className="text-[10px] font-mono text-muted-foreground mt-2">
                  {transport.duration}
                </p>
              )}
            </div>

            {/* Arrival */}
            <div className="text-right flex-1">
              <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                To
              </p>
              <p className="text-2xl font-light tracking-tight text-foreground mt-1">
                {transport.arrival.station}
              </p>
              {transport.arrival.platform && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Platform {transport.arrival.platform}
                </p>
              )}
            </div>
          </div>

          {/* Times */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <div>
              <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                Depart
              </p>
              <p className="text-xl font-mono font-light text-foreground mt-1">
                {transport.departure.time}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                Arrive
              </p>
              <p className="text-xl font-mono font-light text-foreground mt-1">
                {transport.arrival.time}
              </p>
            </div>
          </div>
        </div>

        {/* Tear line decoration */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-4 h-4 bg-background rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute right-0 top-0 w-4 h-4 bg-background rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Passengers section */}
        {transport.passengers && transport.passengers.length > 0 && (
          <div className="px-6 py-4 border-b border-border/50">
            <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground mb-3">
              Passengers ({transport.passengers.length})
            </p>
            <div className="space-y-2">
              {transport.passengers.map((passenger, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-secondary/50"
                >
                  <span className="text-[13px] font-medium text-foreground">
                    {passenger.name}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    {passenger.car && <span>Car {passenger.car}</span>}
                    {passenger.seat && <span>Seat {passenger.seat}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details grid */}
        <div className="px-6 py-5 grid grid-cols-3 gap-4">
          {transport.class && (
            <div>
              <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                Class
              </p>
              <p className="text-[13px] font-medium text-foreground mt-1">
                {transport.class}
              </p>
            </div>
          )}
          {transport.fare && (
            <div>
              <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                Fare
              </p>
              <p className="text-[13px] font-medium text-foreground mt-1">
                {transport.fare}
              </p>
            </div>
          )}
          {transport.reservationCode && (
            <div>
              <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                Confirmation
              </p>
              <p className="text-[13px] font-mono font-medium text-foreground mt-1">
                {transport.reservationCode}
              </p>
            </div>
          )}
        </div>

        {/* QR Code area for train/bus */}
        {(transport.mode === "train" || transport.mode === "bus") && (
          <div className="px-6 pb-6">
            <div className="bg-secondary p-4 flex items-center justify-center">
              <div className="w-24 h-24 bg-white p-2">
                {/* Simplified QR code pattern */}
                <div className="w-full h-full grid grid-cols-7 grid-rows-7 gap-[1px]">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-full h-full",
                        Math.random() > 0.5 ? "bg-foreground" : "bg-white"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[9px] font-mono tracking-wide text-center text-muted-foreground mt-2">
              Scan at gate
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function RoomPhotoCarousel({ photos }: { photos: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!photos || photos.length === 0) return null

  return (
    <div className="relative mb-3">
      <div className="aspect-[16/10] overflow-hidden bg-secondary">
        <img
          src={photos[currentIndex]}
          alt={`Room photo ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      {photos.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-card/80 backdrop-blur-sm text-foreground hover:bg-card transition-colors"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % photos.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-card/80 backdrop-blur-sm text-foreground hover:bg-card transition-colors"
            aria-label="Next photo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  index === currentIndex ? "bg-white" : "bg-white/50"
                )}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function StayDetailCard({
  activity,
  onClose,
}: {
  activity: Activity
  onClose: () => void
}) {
  const stay = activity.stayDetails
  if (!stay) return null

  const propertyTypeLabel = {
    hotel: "Hotel",
    ryokan: "Ryokan",
    hostel: "Hostel",
    airbnb: "Vacation Rental",
    resort: "Resort",
  }

  const tagIcons: Record<string, typeof Eye> = {
    "Garden View": Eye,
    "City View": Eye,
    "Ocean View": Eye,
    "Mountain View": Eye,
    "Private Bath": Bath,
    "Rain Shower": Bath,
    "Soaking Tub": Bath,
    "Mini Bar": Coffee,
    "Wifi": Wifi,
    "Balcony": Wind,
    "Workspace": Building2,
  }

  const paymentStatusConfig = {
    paid: { label: "Paid", icon: CreditCard, color: "text-chart-2 bg-chart-2/10" },
    pay_on_site: { label: "Pay on site", icon: Wallet, color: "text-chart-4 bg-chart-4/10" },
    partial: { label: "Partial paid", icon: CreditCard, color: "text-accent bg-accent/10" },
  }

  const paymentConfig = paymentStatusConfig[stay.paymentStatus]
  const PaymentIcon = paymentConfig.icon

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md my-8 bg-card border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10 bg-card/80 backdrop-blur-sm"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="bg-chart-3 px-6 py-5">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/70">
            {propertyTypeLabel[stay.propertyType || "hotel"]}
          </p>
          <h3 className="text-xl font-light text-white mt-1">
            {stay.propertyName}
          </h3>
          {stay.address && (
            <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
              {stay.address}
            </p>
          )}
        </div>

        {/* Google Maps */}
        {stay.coordinates && (
          <div className="aspect-[16/9] bg-secondary">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6CE-xaQwN0fIBkA&q=${stay.coordinates.lat},${stay.coordinates.lng}&zoom=15`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map of ${stay.propertyName}`}
            />
          </div>
        )}

        {/* Check-in / Check-out - Highlighted */}
        <div className="px-6 py-5 border-b border-border bg-secondary/30">
          <div className="flex items-stretch justify-between">
            {/* Check-in */}
            <div className="flex-1 text-center border-r border-border/50 pr-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sun className="h-4 w-4 text-chart-4" />
                <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                  Check-in
                </p>
              </div>
              <p className="text-2xl font-light text-foreground">
                {stay.checkIn.time}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {stay.checkIn.date}
              </p>
            </div>

            {/* Nights indicator */}
            <div className="flex flex-col items-center justify-center px-4">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-chart-4" />
                <div className="h-px w-6 bg-border" />
                <Moon className="h-4 w-4 text-muted-foreground" />
                <div className="h-px w-6 bg-border" />
                <div className="h-2 w-2 rounded-full border-2 border-chart-3" />
              </div>
              <p className="text-[10px] font-mono text-muted-foreground mt-2">
                {stay.nights} {stay.nights === 1 ? "night" : "nights"}
              </p>
            </div>

            {/* Check-out */}
            <div className="flex-1 text-center border-l border-border/50 pl-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Moon className="h-4 w-4 text-chart-3" />
                <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                  Check-out
                </p>
              </div>
              <p className="text-2xl font-light text-foreground">
                {stay.checkOut.time}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {stay.checkOut.date}
              </p>
            </div>
          </div>
        </div>

        {/* Meals section */}
        {stay.meals && (
          <div className="px-6 py-4 border-b border-border/50">
            <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground mb-3">
              Meals Included
            </p>
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5",
                stay.meals.breakfast ? "bg-chart-4/10 text-chart-4" : "bg-secondary text-muted-foreground/50"
              )}>
                <Coffee className="h-3.5 w-3.5" />
                <span className="text-[11px] font-mono tracking-wide">Breakfast</span>
              </div>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5",
                stay.meals.lunch ? "bg-chart-4/10 text-chart-4" : "bg-secondary text-muted-foreground/50"
              )}>
                <Utensils className="h-3.5 w-3.5" />
                <span className="text-[11px] font-mono tracking-wide">Lunch</span>
              </div>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5",
                stay.meals.dinner ? "bg-chart-4/10 text-chart-4" : "bg-secondary text-muted-foreground/50"
              )}>
                <Moon className="h-3.5 w-3.5" />
                <span className="text-[11px] font-mono tracking-wide">Dinner</span>
              </div>
            </div>
          </div>
        )}

        {/* Rooms section */}
        <div className="px-6 py-4 border-b border-border/50">
          <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground mb-4">
            Rooms ({stay.rooms.length})
          </p>
          <div className="space-y-4">
            {stay.rooms.map((room, roomIndex) => (
              <div key={roomIndex} className="bg-secondary/30 overflow-hidden">
                {/* Room photo carousel */}
                {room.photos && room.photos.length > 0 && (
                  <RoomPhotoCarousel photos={room.photos} />
                )}

                <div className="p-4">
                  {/* Room header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[13px] font-medium text-foreground">
                        {room.roomType}
                      </p>
                      {room.roomNumber && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Room {room.roomNumber}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {room.layoutUrl && (
                        <a 
                          href={room.layoutUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="View room layout"
                        >
                          <Map className="h-4 w-4" />
                        </a>
                      )}
                      {room.roomUrl && (
                        <a 
                          href={room.roomUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="View room details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Room tags */}
                  {room.tags && room.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {room.tags.map((tag, tagIndex) => {
                        const TagIcon = tagIcons[tag]
                        return (
                          <span 
                            key={tagIndex}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-background text-[10px] font-mono tracking-wide text-muted-foreground"
                          >
                            {TagIcon && <TagIcon className="h-3 w-3" />}
                            {tag}
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Room description */}
                  {room.description && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                      {room.description}
                    </p>
                  )}

                  {/* Guests in this room */}
                  <div className="border-t border-border/50 pt-3 mt-3">
                    <p className="text-[9px] font-mono tracking-[0.1em] uppercase text-muted-foreground mb-2">
                      Guests
                    </p>
                    <div className="space-y-1.5">
                      {room.guests.map((guest, guestIndex) => (
                        <div 
                          key={guestIndex}
                          className="flex items-center justify-between py-1.5 px-2 bg-background"
                        >
                          <span className="text-[12px] font-medium text-foreground">
                            {guest.name}
                          </span>
                          {guest.farePerNight && (
                            <span className="text-[11px] text-muted-foreground">
                              {guest.farePerNight}/night
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tear line decoration */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-4 h-4 bg-background rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute right-0 top-0 w-4 h-4 bg-background rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Payment & Details */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                Total
              </p>
              <p className="text-xl font-light text-foreground mt-1">
                {stay.totalFare || "—"}
              </p>
            </div>
            <div className={cn(
              "flex items-center gap-2 px-3 py-2",
              paymentConfig.color
            )}>
              <PaymentIcon className="h-4 w-4" />
              <span className="text-[11px] font-mono tracking-wide">
                {paymentConfig.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stay.confirmationCode && (
              <div>
                <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                  Confirmation
                </p>
                <p className="text-[13px] font-mono font-medium text-foreground mt-1">
                  {stay.confirmationCode}
                </p>
              </div>
            )}
            {stay.contactPhone && (
              <div>
                <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                  Contact
                </p>
                <p className="text-[13px] font-medium text-foreground mt-1">
                  {stay.contactPhone}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RestaurantDetailCard({
  activity,
  onClose,
}: {
  activity: Activity
  onClose: () => void
}) {
  const food = activity.foodDetails
  if (!food) return null

  const restaurantTypeLabel = {
    restaurant: "Restaurant",
    izakaya: "Izakaya",
    cafe: "Cafe",
    fine_dining: "Fine Dining",
    street_food: "Street Food",
  }

  const paymentStatusConfig = {
    paid: { label: "Paid in Full", icon: CreditCard, color: "text-chart-2 bg-chart-2/10" },
    pay_on_site: { label: "Pay on Site", icon: Wallet, color: "text-chart-4 bg-chart-4/10" },
    deposit_paid: { label: "Deposit Paid", icon: CreditCard, color: "text-accent bg-accent/10" },
  }

  const paymentMethodLabel = {
    credit_card: "Credit Card",
    cash: "Cash",
    ic_card: "IC Card",
    qr_code: "QR Code Payment",
  }

  const paymentMethodIcon = {
    credit_card: CreditCard,
    cash: Banknote,
    ic_card: CreditCard,
    qr_code: QrCode,
  }

  const paymentConfig = paymentStatusConfig[food.paymentStatus]
  const PaymentStatusIcon = paymentConfig.icon
  const PaymentMethodIcon = food.paymentMethod ? paymentMethodIcon[food.paymentMethod] : null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md my-8 bg-card border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10 bg-card/80 backdrop-blur-sm"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="bg-chart-5 px-6 py-5">
          <div className="flex items-center gap-2 mb-1">
            <Utensils className="h-4 w-4 text-white/70" />
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/70">
              {restaurantTypeLabel[food.restaurantType || "restaurant"]}
            </p>
          </div>
          <h3 className="text-xl font-light text-white">
            {food.restaurantName}
          </h3>
          {food.cuisine && (
            <p className="text-[11px] text-white/60 mt-1 font-mono tracking-wide">
              {food.cuisine} Cuisine
            </p>
          )}
          {food.address && (
            <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
              {food.address}
            </p>
          )}
        </div>

        {/* Google Maps */}
        {food.coordinates && (
          <div className="aspect-[16/9] bg-secondary">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6CE-xaQwN0fIBkA&q=${food.coordinates.lat},${food.coordinates.lng}&zoom=16`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map of ${food.restaurantName}`}
            />
          </div>
        )}

        {/* Reservation Info - Highlighted */}
        {food.reservation && (
          <div className="px-6 py-5 border-b border-border bg-secondary/30">
            <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground mb-4">
              Reservation
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-mono tracking-[0.1em] uppercase text-muted-foreground">
                  Date
                </p>
                <p className="text-lg font-light text-foreground mt-1">
                  {food.reservation.date}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono tracking-[0.1em] uppercase text-muted-foreground">
                  Time
                </p>
                <p className="text-lg font-light text-foreground mt-1">
                  {food.reservation.time}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] font-mono tracking-[0.1em] uppercase text-muted-foreground">
                    Party Size
                  </p>
                </div>
                <p className="text-[14px] font-medium text-foreground mt-1">
                  {food.reservation.partySize} guests
                </p>
              </div>
              {food.reservation.seating && (
                <div>
                  <p className="text-[10px] font-mono tracking-[0.1em] uppercase text-muted-foreground">
                    Seating
                  </p>
                  <p className="text-[14px] font-medium text-foreground mt-1">
                    {food.reservation.seating}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
              {food.reservation.confirmationCode && (
                <div>
                  <p className="text-[9px] font-mono tracking-[0.1em] uppercase text-muted-foreground">
                    Confirmation
                  </p>
                  <p className="text-[12px] font-mono font-medium text-foreground mt-0.5">
                    {food.reservation.confirmationCode}
                  </p>
                </div>
              )}
              {food.reservation.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[12px] text-foreground">
                    {food.reservation.contactPhone}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preorder Course */}
        {food.preorderCourse && (
          <div className="px-6 py-4 border-b border-border/50 bg-accent/5">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-accent" />
              <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-accent">
                Preorder Course
              </p>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[14px] font-medium text-foreground">
                  {food.preorderCourse.courseName}
                </p>
                {food.preorderCourse.courseNameNative && (
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {food.preorderCourse.courseNameNative}
                  </p>
                )}
                {food.preorderCourse.description && (
                  <p className="text-[11px] text-muted-foreground/80 mt-2 leading-relaxed">
                    {food.preorderCourse.description}
                  </p>
                )}
              </div>
              <p className="text-[14px] font-mono font-medium text-foreground whitespace-nowrap ml-4">
                {food.preorderCourse.pricePerPerson}/person
              </p>
            </div>
          </div>
        )}

        {/* Recommended Menu */}
        {food.recommendedMenu && food.recommendedMenu.length > 0 && (
          <div className="px-6 py-4 border-b border-border/50">
            <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground mb-3">
              Recommended
            </p>
            <div className="space-y-3">
              {food.recommendedMenu.map((item, index) => (
                <div key={index} className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">
                      {item.name}
                    </p>
                    {item.nativeName && (
                      <p className="text-[11px] text-muted-foreground">
                        {item.nativeName}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.price && (
                    <p className="text-[12px] font-mono text-muted-foreground whitespace-nowrap ml-4">
                      {item.price}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Table */}
        {food.orders && food.orders.length > 0 && (
          <div className="px-6 py-4 border-b border-border/50">
            <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground mb-3">
              Order Details
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 font-mono font-normal text-muted-foreground tracking-wide">Item</th>
                    <th className="text-right py-2 font-mono font-normal text-muted-foreground tracking-wide">Price</th>
                    <th className="text-center py-2 font-mono font-normal text-muted-foreground tracking-wide w-12">Qty</th>
                    <th className="text-right py-2 font-mono font-normal text-muted-foreground tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {food.orders.map((item, index) => (
                    <tr key={index} className="border-b border-border/30">
                      <td className="py-2.5">
                        <p className="font-medium text-foreground">{item.name}</p>
                        {item.nativeName && (
                          <p className="text-[10px] text-muted-foreground">{item.nativeName}</p>
                        )}
                      </td>
                      <td className="text-right py-2.5 font-mono text-muted-foreground">
                        {item.price}
                      </td>
                      <td className="text-center py-2.5 font-mono text-foreground">
                        {item.quantity}
                      </td>
                      <td className="text-right py-2.5 font-mono font-medium text-foreground">
                        {item.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border">
                    <td colSpan={3} className="py-3 text-right font-mono font-medium text-foreground">
                      Total
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-lg text-foreground">
                      {food.totalAmount}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tear line decoration */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-4 h-4 bg-background rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute right-0 top-0 w-4 h-4 bg-background rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Payment Section */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                Payment Status
              </p>
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 mt-2",
                paymentConfig.color
              )}>
                <PaymentStatusIcon className="h-4 w-4" />
                <span className="text-[11px] font-mono tracking-wide">
                  {paymentConfig.label}
                </span>
              </div>
            </div>
            {food.depositAmount && food.paymentStatus === "deposit_paid" && (
              <div className="text-right">
                <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                  Deposit
                </p>
                <p className="text-lg font-mono font-medium text-foreground mt-1">
                  {food.depositAmount}
                </p>
              </div>
            )}
          </div>

          {food.paymentMethod && PaymentMethodIcon && (
            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                Payment Method
              </p>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary">
                <PaymentMethodIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-[11px] font-mono text-foreground">
                  {paymentMethodLabel[food.paymentMethod]}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BoardingPassCard({
  activity,
  onClose,
}: {
  activity: Activity
  onClose: () => void
}) {
  const flight = activity.flightDetails
  if (!flight) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-card border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header stripe */}
        <div className="bg-accent px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-accent-foreground/70">
                Boarding Pass
              </p>
              <p className="text-lg font-light text-accent-foreground mt-1">
                {flight.airline}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-accent-foreground/70">
                Flight
              </p>
              <p className="text-xl font-mono font-light text-accent-foreground">
                {flight.flightNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Route section */}
        <div className="px-6 py-6 border-b border-dashed border-border">
          <div className="flex items-center justify-between">
            {/* Departure */}
            <div className="text-left">
              <p className="text-4xl font-light tracking-tight text-foreground">
                {flight.departure.code}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[100px] leading-tight">
                {flight.departure.airport}
              </p>
            </div>

            {/* Flight path */}
            <div className="flex-1 px-4 flex items-center justify-center">
              <div className="flex items-center gap-2 w-full max-w-[120px]">
                <div className="h-px flex-1 bg-border" />
                <Plane className="h-4 w-4 text-accent" />
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <p className="text-4xl font-light tracking-tight text-foreground">
                {flight.arrival.code}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[100px] leading-tight ml-auto">
                {flight.arrival.airport}
              </p>
            </div>
          </div>

          {/* Times */}
          <div className="flex items-center justify-between mt-6">
            <div>
              <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                Depart
              </p>
              <p className="text-xl font-mono font-light text-foreground mt-1">
                {flight.departure.time}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
                Arrive
              </p>
              <p className="text-xl font-mono font-light text-foreground mt-1">
                {flight.arrival.time}
              </p>
            </div>
          </div>
        </div>

        {/* Tear line decoration */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-4 h-4 bg-background rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute right-0 top-0 w-4 h-4 bg-background rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Passengers section */}
        <div className="px-6 py-4 border-b border-border/50">
          <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground mb-3">
            Passengers ({flight.passengers.length})
          </p>
          <div className="space-y-2">
            {flight.passengers.map((passenger, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-secondary/50"
              >
                <span className="text-[13px] font-medium text-foreground">
                  {passenger.name}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Seat {passenger.seat || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Details grid */}
        <div className="px-6 py-5 grid grid-cols-3 gap-4">
          <div>
            <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
              Class
            </p>
            <p className="text-[13px] font-medium text-foreground mt-1">
              {flight.class || "—"}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
              Terminal
            </p>
            <p className="text-[13px] font-medium text-foreground mt-1">
              {flight.departure.terminal || "—"}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
              Gate
            </p>
            <p className="text-[13px] font-medium text-foreground mt-1">
              {flight.departure.gate || "—"}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
              Confirmation
            </p>
            <p className="text-[13px] font-mono font-medium text-foreground mt-1">
              {flight.confirmationCode || "—"}
            </p>
          </div>
        </div>

        {/* Barcode area */}
        <div className="px-6 pb-6">
          <div className="bg-secondary p-4 flex items-center justify-center">
            <div className="flex gap-[2px]">
              {/* Fake barcode */}
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-foreground"
                  style={{
                    width: Math.random() > 0.5 ? "2px" : "1px",
                    height: "40px",
                    opacity: Math.random() * 0.5 + 0.5,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityCard({
  activity,
  isSelected,
  onSelect,
  onOpenDetail,
}: {
  activity: Activity
  isSelected: boolean
  onSelect: () => void
  onOpenDetail: () => void
}) {
  const Icon = iconMap[activity.type]
  const typeLabel = typeLabels[activity.type]

  const handleClick = () => {
    if (!isSelected) {
      onSelect()
    } else {
      onOpenDetail()
    }
  }

  return (
    <div
      className={cn(
        "group cursor-pointer transition-all duration-500 ease-out",
        isSelected ? "opacity-100" : "opacity-50 hover:opacity-80"
      )}
      onClick={handleClick}
    >
      {/* Time first - prominent display */}
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-lg font-light tabular-nums text-foreground">
          {activity.time}
        </span>
        <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
          {typeLabel}
        </span>
      </div>

      {/* Main content card */}
      <div
        className={cn(
          "p-5 transition-all duration-500 border-l-2",
          isSelected
            ? "bg-card border-l-accent"
            : "bg-transparent border-l-border/40 group-hover:border-l-accent/30"
        )}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center transition-colors duration-500",
              isSelected
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "text-[15px] font-normal tracking-tight transition-colors duration-500",
                isSelected ? "text-foreground" : "text-foreground/70"
              )}
            >
              {activity.title}
            </h4>
            
            <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{activity.location}</span>
            </div>

            {/* Tags */}
            {activity.tags && activity.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {activity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] font-mono tracking-wide uppercase bg-secondary text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Notes - only when selected */}
            {activity.notes && isSelected && (
              <p className="mt-4 text-[12px] text-muted-foreground leading-relaxed pl-3 border-l border-accent/30">
                {activity.notes}
              </p>
            )}

            {/* Tap for details hint */}
            {isSelected && (
              <p className="mt-3 text-[10px] font-mono tracking-[0.1em] uppercase text-accent/70">
                Tap for details
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DayCarousel({
  days,
  currentDayIndex,
  onDayChange,
}: {
  days: DaySchedule[]
  currentDayIndex: number
  onDayChange: (index: number) => void
}) {
  const canGoPrev = currentDayIndex > 0
  const canGoNext = currentDayIndex < days.length - 1

  return (
    <div className="flex items-center justify-between mb-10">
      {/* Previous button */}
      <button
        onClick={() => canGoPrev && onDayChange(currentDayIndex - 1)}
        className={cn(
          "p-2 transition-all duration-300",
          canGoPrev
            ? "text-foreground hover:text-accent cursor-pointer"
            : "text-border cursor-not-allowed"
        )}
        disabled={!canGoPrev}
        aria-label="Previous day"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Day indicators */}
      <div className="flex items-center gap-6">
        {days.map((day, index) => (
          <button
            key={day.date}
            onClick={() => onDayChange(index)}
            className={cn(
              "text-center transition-all duration-500 cursor-pointer",
              index === currentDayIndex
                ? "opacity-100"
                : "opacity-40 hover:opacity-70"
            )}
          >
            <p
              className={cn(
                "text-[10px] font-mono tracking-[0.2em] uppercase transition-colors duration-500",
                index === currentDayIndex ? "text-accent" : "text-muted-foreground"
              )}
            >
              {day.dayLabel}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1 font-light">
              {day.date}
            </p>
          </button>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={() => canGoNext && onDayChange(currentDayIndex + 1)}
        className={cn(
          "p-2 transition-all duration-300",
          canGoNext
            ? "text-foreground hover:text-accent cursor-pointer"
            : "text-border cursor-not-allowed"
        )}
        disabled={!canGoNext}
        aria-label="Next day"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

export function TripTimeline() {
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(sampleTrip[0].activities[0].id)
  const [detailActivity, setDetailActivity] = useState<Activity | null>(null)

  const currentDay = sampleTrip[currentDayIndex]

  // Update selected activity when day changes
  const handleDayChange = (index: number) => {
    setCurrentDayIndex(index)
    setSelectedId(sampleTrip[index].activities[0].id)
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <header className="mb-16 text-center">
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Itinerary
        </p>
        <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">
          Japan Spring Journey
        </h1>
        <p className="text-[13px] text-muted-foreground mt-3 font-light">
          May 12 - 14, 2025
        </p>
      </header>

      {/* Day Carousel */}
      <DayCarousel
        days={sampleTrip}
        currentDayIndex={currentDayIndex}
        onDayChange={handleDayChange}
      />

      {/* Map view link */}
      <div className="flex justify-center mb-10">
        <Link
          href="/trip/japan-spring/map"
          className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground border border-border/60 hover:border-accent/40 transition-all duration-300"
        >
          <Map className="h-4 w-4" />
          <span className="text-[10px] font-mono tracking-[0.15em] uppercase">View on Map</span>
        </Link>
      </div>

      {/* Current day activities */}
      <div className="space-y-6">
        {currentDay.activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isSelected={selectedId === activity.id}
            onSelect={() => setSelectedId(activity.id)}
            onOpenDetail={() => setDetailActivity(activity)}
          />
        ))}
      </div>

      {/* Detail modal - Boarding pass for flights */}
      {detailActivity?.type === "flight" && detailActivity.flightDetails && (
        <BoardingPassCard
          activity={detailActivity}
          onClose={() => setDetailActivity(null)}
        />
      )}

      {/* Detail modal - Transport ticket for train/bus/taxi */}
      {detailActivity?.type === "transport" && detailActivity.transportDetails && (
        <TransportTicketCard
          activity={detailActivity}
          onClose={() => setDetailActivity(null)}
        />
      )}

      {/* Detail modal - Stay details for accommodation */}
      {detailActivity?.type === "accommodation" && detailActivity.stayDetails && (
        <StayDetailCard
          activity={detailActivity}
          onClose={() => setDetailActivity(null)}
        />
      )}

      {/* Detail modal - Restaurant details for food */}
      {detailActivity?.type === "food" && detailActivity.foodDetails && (
        <RestaurantDetailCard
          activity={detailActivity}
          onClose={() => setDetailActivity(null)}
        />
      )}

      {/* Day progress indicator */}
      <div className="mt-12 flex items-center justify-center gap-2">
        {sampleTrip.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDayChange(index)}
            className={cn(
              "h-1 transition-all duration-500 cursor-pointer",
              index === currentDayIndex
                ? "w-8 bg-accent"
                : "w-2 bg-border hover:bg-accent/30"
            )}
            aria-label={`Go to day ${index + 1}`}
          />
        ))}
      </div>

    </div>
  )
}
