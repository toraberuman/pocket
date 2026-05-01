"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { Plus, Pencil, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditModeContextType {
  isEditMode: boolean
  setEditMode: (value: boolean) => void
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined)

export function useEditMode() {
  const context = useContext(EditModeContext)
  if (!context) {
    throw new Error("useEditMode must be used within EditModeProvider")
  }
  return context
}

interface EditModeProviderProps {
  children: ReactNode
}

export function EditModeProvider({ children }: EditModeProviderProps) {
  const [isEditMode, setEditMode] = useState(false)

  return (
    <EditModeContext.Provider value={{ isEditMode, setEditMode }}>
      {children}
      
      {/* Floating Edit/View Toggle - top right */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => setEditMode(!isEditMode)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 border transition-all duration-300",
            isEditMode
              ? "bg-accent text-accent-foreground border-accent"
              : "bg-card text-foreground border-border hover:border-accent/50"
          )}
          aria-label={isEditMode ? "Switch to view mode" : "Switch to edit mode"}
        >
          {isEditMode ? (
            <Eye className="h-4 w-4" />
          ) : (
            <Pencil className="h-4 w-4" />
          )}
          <span className="text-[10px] font-mono tracking-[0.15em] uppercase">
            {isEditMode ? "View" : "Edit"}
          </span>
        </button>
      </div>

      {/* Floating Add Button - only visible in edit mode */}
      <div
        className={cn(
          "fixed right-6 bottom-24 z-40 transition-all duration-300 ease-out",
          isEditMode
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("trip:add-item"))
          }}
          className="flex items-center gap-2 px-5 py-3 bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Add item"
        >
          <Plus className="h-4 w-4" />
          <span className="text-[11px] font-mono tracking-[0.1em] uppercase">Add</span>
        </button>
      </div>
    </EditModeContext.Provider>
  )
}
