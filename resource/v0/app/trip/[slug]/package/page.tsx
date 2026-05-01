"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Check, Plus } from "lucide-react"

interface PackingItem {
  id: string
  name: string
  category: string
  packed: boolean
  quantity?: number
}

const categories = [
  { id: "essentials", label: "Essentials" },
  { id: "clothing", label: "Clothing" },
  { id: "toiletries", label: "Toiletries" },
  { id: "electronics", label: "Electronics" },
  { id: "documents", label: "Documents" },
]

const sampleItems: PackingItem[] = [
  { id: "1", name: "Passport", category: "documents", packed: true },
  { id: "2", name: "JR Pass voucher", category: "documents", packed: true },
  { id: "3", name: "Travel insurance", category: "documents", packed: false },
  { id: "4", name: "T-shirts", category: "clothing", packed: true, quantity: 4 },
  { id: "5", name: "Light jacket", category: "clothing", packed: false },
  { id: "6", name: "Walking shoes", category: "clothing", packed: true },
  { id: "7", name: "Phone charger", category: "electronics", packed: true },
  { id: "8", name: "Power adapter", category: "electronics", packed: false },
  { id: "9", name: "Camera", category: "electronics", packed: false },
  { id: "10", name: "Toothbrush", category: "toiletries", packed: true },
  { id: "11", name: "Sunscreen", category: "toiletries", packed: false },
  { id: "12", name: "Medication", category: "essentials", packed: true },
  { id: "13", name: "Cash (Yen)", category: "essentials", packed: false },
]

export default function PackagePage() {
  const [items, setItems] = useState<PackingItem[]>(sampleItems)

  const togglePacked = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    )
  }

  const totalItems = items.length
  const packedItems = items.filter((i) => i.packed).length
  const percentPacked = (packedItems / totalItems) * 100

  const itemsByCategory = categories.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category === cat.id),
  }))

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <header className="mb-12 text-center">
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Luggage
        </p>
        <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">
          Packing List
        </h1>
      </header>

      {/* Progress overview */}
      <div className="mb-12 p-6 bg-card border border-border/40">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
            Progress
          </span>
          <span className="text-lg font-light text-foreground">
            {packedItems} / {totalItems}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${percentPacked}%` }}
          />
        </div>

        <p className="text-[11px] text-muted-foreground mt-3 text-right">
          {Math.round(percentPacked)}% packed
        </p>
      </div>

      {/* Packing list by category */}
      <div className="space-y-10">
        {itemsByCategory.map((category) => (
          <div key={category.id}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                {category.label}
              </p>
              <span className="text-[10px] text-muted-foreground">
                {category.items.filter((i) => i.packed).length}/{category.items.length}
              </span>
            </div>

            <div className="space-y-1">
              {category.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => togglePacked(item.id)}
                  className="w-full flex items-center gap-4 py-3 border-b border-border/30 last:border-0 text-left transition-all duration-300 hover:bg-secondary/30"
                >
                  <div
                    className={cn(
                      "w-5 h-5 flex items-center justify-center border transition-all duration-300",
                      item.packed
                        ? "bg-accent border-accent"
                        : "bg-transparent border-border"
                    )}
                  >
                    {item.packed && <Check className="h-3 w-3 text-accent-foreground" />}
                  </div>
                  <span
                    className={cn(
                      "flex-1 text-[13px] transition-all duration-300",
                      item.packed
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    )}
                  >
                    {item.name}
                    {item.quantity && item.quantity > 1 && (
                      <span className="ml-1.5 text-[11px] text-muted-foreground">
                        x{item.quantity}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add item button */}
      <div className="mt-10 pt-6 border-t border-border/40">
        <button className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-accent transition-colors duration-300">
          <Plus className="h-4 w-4" />
          <span className="text-[11px] font-mono tracking-wide uppercase">Add item</span>
        </button>
      </div>
    </div>
  )
}
