"use client"

import { Button } from "@/components/button"

interface FilterSelectorProps {
  currentFilter: string
  onFilterChange: (filter: string) => void
}

const FILTERS = [
  { id: "none", name: "None" },
  { id: "grayscale", name: "Grayscale" },
  { id: "sepia", name: "Sepia" },
  { id: "invert", name: "Invert" },
  { id: "vintage", name: "Vintage" },
  { id: "blueprint", name: "Blueprint" },
]

export function FilterSelector({ currentFilter, onFilterChange }: FilterSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="mb-2 text-sm font-medium">Filters</h3>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Button
            key={filter.id}
            variant={currentFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.name}
          </Button>
        ))}
      </div>
    </div>
  )
}

