import Link from "next/link"
import { ChevronRight, MapPin, CalendarDays } from "lucide-react"

interface Trip {
  slug: string
  name: string
  destination: string
  dates: string
  daysCount: number
  status: "upcoming" | "ongoing" | "completed"
}

const trips: Trip[] = [
  {
    slug: "japan-spring",
    name: "Japan Spring Journey",
    destination: "Tokyo, Kyoto",
    dates: "May 12 - 14, 2025",
    daysCount: 3,
    status: "upcoming",
  },
  {
    slug: "paris-autumn",
    name: "Paris Autumn",
    destination: "Paris, France",
    dates: "Oct 5 - 10, 2025",
    daysCount: 6,
    status: "upcoming",
  },
]

const statusLabels = {
  upcoming: "Upcoming",
  ongoing: "In Progress",
  completed: "Completed",
}

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-20 md:py-32">
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <header className="mb-16 text-center">
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Pocket
          </p>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">
            Your Trips
          </h1>
        </header>

        {/* Trip list */}
        <div className="space-y-4">
          {trips.map((trip) => (
            <Link
              key={trip.slug}
              href={`/trip/${trip.slug}`}
              className="group block p-6 bg-card border border-border/40 hover:border-accent/30 transition-all duration-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Status badge */}
                  <span className="inline-block px-2 py-0.5 text-[9px] font-mono tracking-wide uppercase bg-secondary text-muted-foreground mb-3">
                    {statusLabels[trip.status]}
                  </span>

                  {/* Trip name */}
                  <h2 className="text-[17px] font-normal tracking-tight text-foreground mb-2 group-hover:text-accent transition-colors duration-500">
                    {trip.name}
                  </h2>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3" />
                      <span>{trip.dates}</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors duration-500 shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Add trip button */}
        <div className="mt-10 pt-6 border-t border-border/40 text-center">
          <button className="text-[11px] font-mono tracking-wide uppercase text-muted-foreground hover:text-accent transition-colors duration-300">
            + New Trip
          </button>
        </div>
      </div>
    </main>
  )
}
