"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Plus, TrendingUp, TrendingDown } from "lucide-react"

interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  currency: string
}

const categories = [
  { id: "transport", label: "Transport", color: "bg-chart-2" },
  { id: "food", label: "Food", color: "bg-chart-1" },
  { id: "stay", label: "Accommodation", color: "bg-chart-4" },
  { id: "activity", label: "Activities", color: "bg-chart-5" },
  { id: "shopping", label: "Shopping", color: "bg-chart-3" },
]

const sampleExpenses: Expense[] = [
  { id: "1", date: "05.12", category: "transport", description: "JR Pass (7 days)", amount: 29650, currency: "¥" },
  { id: "2", date: "05.12", category: "stay", description: "Ryokan Asakusa", amount: 18000, currency: "¥" },
  { id: "3", date: "05.12", category: "food", description: "Soba lunch", amount: 1200, currency: "¥" },
  { id: "4", date: "05.13", category: "food", description: "Kaiseki dinner", amount: 8500, currency: "¥" },
  { id: "5", date: "05.13", category: "activity", description: "Tea ceremony", amount: 3000, currency: "¥" },
  { id: "6", date: "05.14", category: "shopping", description: "Matcha & souvenirs", amount: 4500, currency: "¥" },
]

const budget = 100000

export default function ExpensePage() {
  const [expenses] = useState<Expense[]>(sampleExpenses)
  
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const remaining = budget - totalSpent
  const percentUsed = (totalSpent / budget) * 100

  const expensesByCategory = categories.map((cat) => ({
    ...cat,
    total: expenses.filter((e) => e.category === cat.id).reduce((sum, e) => sum + e.amount, 0),
  }))

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <header className="mb-12 text-center">
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Budget
        </p>
        <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">
          Expenses
        </h1>
      </header>

      {/* Budget overview */}
      <div className="mb-12 p-6 bg-card border border-border/40">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
            Total Budget
          </span>
          <span className="text-lg font-light text-foreground">
            ¥{budget.toLocaleString()}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-secondary mb-4">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-3 w-3 text-accent" />
            <span className="text-[12px] text-muted-foreground">
              Spent: ¥{totalSpent.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-chart-2" />
            <span className="text-[12px] text-muted-foreground">
              Left: ¥{remaining.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="mb-12">
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4">
          By Category
        </p>
        <div className="space-y-3">
          {expensesByCategory.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3">
              <div className={cn("w-2 h-2", cat.color)} />
              <span className="flex-1 text-[12px] text-foreground">{cat.label}</span>
              <span className="text-[12px] text-muted-foreground tabular-nums">
                ¥{cat.total.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expense list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
            Transactions
          </p>
          <button className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors duration-300">
            <Plus className="h-3.5 w-3.5" />
            <span className="text-[10px] font-mono tracking-wide uppercase">Add</span>
          </button>
        </div>

        <div className="space-y-1">
          {expenses.map((expense) => {
            const cat = categories.find((c) => c.id === expense.category)
            return (
              <div
                key={expense.id}
                className="flex items-center gap-4 py-3 border-b border-border/30 last:border-0"
              >
                <div className={cn("w-1.5 h-1.5", cat?.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground truncate">{expense.description}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{expense.date}</p>
                </div>
                <span className="text-[13px] text-foreground tabular-nums shrink-0">
                  {expense.currency}{expense.amount.toLocaleString()}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
