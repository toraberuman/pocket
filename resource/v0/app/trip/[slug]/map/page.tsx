"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { ChevronLeft, Train, Utensils, Camera, Building2, TreePine, MapPin } from "lucide-react"
import { sampleTrip, type Activity } from "@/components/trip-timeline"

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

// Sample coordinates for the places (in real app, these would come from the data)
const placeCoordinates: Record<string, [number, number]> = {
  "1": [35.7720, 140.3929], // Narita Airport
  "2": [35.7148, 139.7967], // Asakusa Ryokan
  "3": [35.7148, 139.7967], // Senso-ji Temple Area
  "4": [35.7148, 139.7967], // Senso-ji Temple
  "5": [35.6812, 139.7671], // Tokyo Station
  "6": [34.9858, 135.7590], // Kyoto Station
  "7": [34.9671, 135.7727], // Fushimi Inari
  "8": [35.0037, 135.7756], // Gion District
  "9": [35.0158, 135.6722], // Arashiyama
  "10": [35.0394, 135.7292], // Kinkaku-ji
  "11": [34.9987, 135.7817], // Higashiyama
  "12": [35.0050, 135.7648], // Nishiki Market
}

const iconMap = {
  transport: Train,
  food: Utensils,
  sightseeing: Camera,
  accommodation: Building2,
  nature: TreePine,
}

const typeColors = {
  transport: "bg-blue-500",
  food: "bg-orange-500",
  sightseeing: "bg-accent",
  accommodation: "bg-emerald-600",
  nature: "bg-green-600",
}

export default function MapPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  // Flatten all activities
  const allActivities = useMemo(() => {
    if (selectedDay === null) {
      return sampleTrip.flatMap((day, dayIndex) =>
        day.activities.map((activity) => ({ ...activity, dayIndex }))
      )
    }
    return sampleTrip[selectedDay].activities.map((activity) => ({
      ...activity,
      dayIndex: selectedDay,
    }))
  }, [selectedDay])

  // Calculate map center based on activities
  const mapCenter = useMemo((): [number, number] => {
    const coords = allActivities
      .map((a) => placeCoordinates[a.id])
      .filter(Boolean)
    if (coords.length === 0) return [35.6762, 139.6503] // Default: Tokyo
    const lat = coords.reduce((sum, c) => sum + c[0], 0) / coords.length
    const lng = coords.reduce((sum, c) => sum + c[1], 0) / coords.length
    return [lat, lng]
  }, [allActivities])

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Floating back button */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Link
          href="/trip/japan-spring"
          className="flex items-center gap-2 px-4 py-2.5 bg-card/95 backdrop-blur-sm border border-border/60 text-foreground hover:border-accent/50 transition-all duration-300 shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-[10px] font-mono tracking-[0.15em] uppercase">Back</span>
        </Link>
      </div>

      {/* Floating day filter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="flex items-center gap-1 bg-card/95 backdrop-blur-sm border border-border/60 p-1 shadow-sm">
          <button
            onClick={() => setSelectedDay(null)}
            className={cn(
              "px-3 py-1.5 text-[9px] font-mono tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-300",
              selectedDay === null
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {sampleTrip.map((day, index) => (
            <button
              key={day.date}
              onClick={() => setSelectedDay(index)}
              className={cn(
                "px-3 py-1.5 text-[9px] font-mono tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-300",
                selectedDay === index
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {day.date}
            </button>
          ))}
        </div>
      </div>

      {/* Full screen map */}
      <div className="absolute inset-0">
        {typeof window !== "undefined" && (
          <>
            <link
              rel="stylesheet"
              href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
              integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
              crossOrigin=""
            />
            <MapContainer
              center={mapCenter}
              zoom={selectedDay === null ? 7 : 12}
              className="h-full w-full"
              style={{ height: "100vh", width: "100vw", background: "var(--background)" }}
              whenReady={() => setIsMapReady(true)}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {isMapReady &&
                allActivities.map((activity) => {
                  const coords = placeCoordinates[activity.id]
                  if (!coords) return null
                  const Icon = iconMap[activity.type]
                  return (
                    <Marker
                      key={activity.id}
                      position={coords}
                      eventHandlers={{
                        click: () => setSelectedActivity(activity),
                      }}
                    />
                  )
                })}
            </MapContainer>
          </>
        )}

        {/* Selected activity detail */}
        {selectedActivity && (
          <div className="absolute bottom-6 left-4 right-4 z-[1000] max-w-sm mx-auto">
            <div className="bg-card/95 backdrop-blur-sm border border-border/60 p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center text-white",
                    typeColors[selectedActivity.type]
                  )}
                >
                  {(() => {
                    const Icon = iconMap[selectedActivity.type]
                    return <Icon className="h-4 w-4" />
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {selectedActivity.time}
                    </span>
                    <span className="text-[10px] font-mono tracking-[0.1em] uppercase text-accent">
                      Day {(selectedActivity as Activity & { dayIndex: number }).dayIndex + 1}
                    </span>
                  </div>
                  <h4 className="text-sm font-normal text-foreground truncate">
                    {selectedActivity.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{selectedActivity.location}</span>
                  </div>
                  {selectedActivity.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedActivity.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 text-[9px] font-mono tracking-wide uppercase bg-secondary text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating legend - bottom left */}
      <div className="absolute bottom-6 left-4 z-[1000]">
        <div className="bg-card/95 backdrop-blur-sm border border-border/60 p-2 shadow-sm">
          <div className="flex flex-col gap-1.5">
            {Object.entries(iconMap).map(([type, Icon]) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-5 w-5 flex items-center justify-center text-white",
                    typeColors[type as keyof typeof typeColors]
                  )}
                >
                  <Icon className="h-3 w-3" />
                </div>
                <span className="text-[9px] font-mono tracking-wide uppercase text-muted-foreground">
                  {type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
