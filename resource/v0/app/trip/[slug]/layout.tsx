"use client"

import { TripMenuBar } from "@/components/trip-menu-bar"
import { EditModeProvider } from "@/components/edit-mode-provider"

function TripLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <main className="px-6 py-12 md:py-16">
        {children}
      </main>
      <TripMenuBar />
    </div>
  )
}

export default function TripLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EditModeProvider>
      <TripLayoutContent>{children}</TripLayoutContent>
    </EditModeProvider>
  )
}
