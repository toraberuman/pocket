"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Check, Plus } from "lucide-react"

interface WishlistItem {
  id: string
  name: string
  category: string
  price?: number
  currency?: string
  image: string
  priority: "high" | "medium" | "low"
  purchased: boolean
}

const priorities = {
  high: { label: "High", color: "bg-accent" },
  medium: { label: "Medium", color: "bg-chart-4" },
  low: { label: "Low", color: "bg-chart-2" },
}

const sampleWishlist: WishlistItem[] = [
  {
    id: "1",
    name: "Kyoto Matcha",
    category: "Food",
    price: 2500,
    currency: "¥",
    image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=400&fit=crop",
    priority: "high",
    purchased: false,
  },
  {
    id: "2",
    name: "Tenugui Towels",
    category: "Souvenirs",
    price: 1200,
    currency: "¥",
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=400&fit=crop",
    priority: "medium",
    purchased: true,
  },
  {
    id: "3",
    name: "Stationery Set",
    category: "Souvenirs",
    price: 3000,
    currency: "¥",
    image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&h=400&fit=crop",
    priority: "low",
    purchased: false,
  },
  {
    id: "4",
    name: "Wagashi Box",
    category: "Food",
    price: 1800,
    currency: "¥",
    image: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=400&h=400&fit=crop",
    priority: "medium",
    purchased: false,
  },
  {
    id: "5",
    name: "Ceramic Tea Cup",
    category: "Homeware",
    price: 4500,
    currency: "¥",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop",
    priority: "high",
    purchased: false,
  },
  {
    id: "6",
    name: "Kyoto Incense",
    category: "Homeware",
    price: 2000,
    currency: "¥",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=400&fit=crop",
    priority: "low",
    purchased: false,
  },
  {
    id: "7",
    name: "Furoshiki Cloth",
    category: "Souvenirs",
    price: 2800,
    currency: "¥",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop",
    priority: "medium",
    purchased: false,
  },
  {
    id: "8",
    name: "Sake Set",
    category: "Homeware",
    price: 6500,
    currency: "¥",
    image: "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?w=400&h=400&fit=crop",
    priority: "high",
    purchased: false,
  },
]

export default function CartPage() {
  const [items, setItems] = useState<WishlistItem[]>(sampleWishlist)

  const togglePurchased = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, purchased: !item.purchased } : item
      )
    )
  }

  const unpurchased = items.filter((i) => !i.purchased)
  const purchased = items.filter((i) => i.purchased)
  const estimatedTotal = unpurchased.reduce((sum, i) => sum + (i.price || 0), 0)

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <header className="mb-10 text-center">
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Shopping
        </p>
        <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">
          Wishlist
        </h1>
      </header>

      {/* Summary bar */}
      <div className="mb-8 flex items-center justify-between py-4 border-y border-border/40">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-light text-foreground">
            {unpurchased.length}
          </span>
          <span className="text-[10px] font-mono tracking-[0.1em] uppercase text-muted-foreground">
            items
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-mono tracking-[0.1em] uppercase text-muted-foreground">
            Est.
          </span>
          <span className="text-lg font-light text-foreground">
            ¥{estimatedTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Photo grid - To Buy */}
      {unpurchased.length > 0 && (
        <div className="mb-10">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4">
            To Buy
          </p>

          <div className="grid grid-cols-2 gap-3">
            {unpurchased.map((item) => (
              <div
                key={item.id}
                className="group relative cursor-pointer"
                onClick={() => togglePurchased(item.id)}
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden bg-secondary">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Priority indicator */}
                <div
                  className={cn(
                    "absolute top-2 right-2 w-2 h-2",
                    priorities[item.priority].color
                  )}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Check className="h-4 w-4 text-foreground" />
                  </div>
                </div>

                {/* Info */}
                <div className="mt-2">
                  <p className="text-[12px] text-foreground truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">
                      {item.category}
                    </span>
                    {item.price && (
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {item.currency}{item.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo grid - Purchased */}
      {purchased.length > 0 && (
        <div className="mb-10">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4">
            Purchased
          </p>

          <div className="grid grid-cols-2 gap-3">
            {purchased.map((item) => (
              <div
                key={item.id}
                className="group relative cursor-pointer opacity-50"
                onClick={() => togglePurchased(item.id)}
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden bg-secondary relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover grayscale"
                  />
                  {/* Checkmark overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                    <div className="w-10 h-10 flex items-center justify-center bg-accent">
                      <Check className="h-5 w-5 text-accent-foreground" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-2">
                  <p className="text-[12px] text-muted-foreground line-through truncate">
                    {item.name}
                  </p>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {item.currency}{item.price?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority legend */}
      <div className="mb-8 flex items-center justify-center gap-6 py-4 border-t border-border/40">
        {Object.entries(priorities).map(([key, { label, color }]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={cn("w-2 h-2", color)} />
            <span className="text-[9px] font-mono uppercase text-muted-foreground">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Add item button */}
      <button className="w-full flex items-center justify-center gap-2 py-3 border border-border/40 text-muted-foreground hover:text-accent hover:border-accent/40 transition-colors duration-300">
        <Plus className="h-4 w-4" />
        <span className="text-[10px] font-mono tracking-wide uppercase">Add item</span>
      </button>
    </div>
  )
}
