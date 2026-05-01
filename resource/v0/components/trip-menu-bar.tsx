"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { CalendarDays, Receipt, Briefcase, ShoppingCart, ChevronLeft } from "lucide-react"

const menuItems = [
  {
    label: "Plan",
    href: "/trip/japan-spring",
    icon: CalendarDays,
  },
  {
    label: "Expense",
    href: "/trip/japan-spring/expense",
    icon: Receipt,
  },
  {
    label: "Package",
    href: "/trip/japan-spring/package",
    icon: Briefcase,
  },
  {
    label: "Cart",
    href: "/trip/japan-spring/cart",
    icon: ShoppingCart,
  },
]

export function TripMenuBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/40">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Back button */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1 px-2 py-1 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-[9px] font-mono tracking-wide uppercase">Back</span>
          </Link>

          {/* Menu items */}
          <div className="flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href === "/trip/japan-spring" && pathname === "/trip/japan-spring")
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-4 py-1 transition-all duration-300",
                    isActive
                      ? "text-accent"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-accent")} />
                  <span
                    className={cn(
                      "text-[9px] font-mono tracking-[0.1em] uppercase",
                      isActive && "text-accent"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
