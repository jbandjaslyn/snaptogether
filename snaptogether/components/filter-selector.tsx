"use client"

import { Button } from "@/components/button"
import { ScrollArea, ScrollBar } from "@/components/scroll-area"

interface FilterSelectorProps {
  currentFilter: string
  onFilterChange: (filter: string) => void
}

const filters = [
  { id: "normal", name: "Normal" },
  { id: "grayscale", name: "Grayscale" },
  { id: "sepia", name: "Sepia" },
  { id: "invert", name: "Invert" },
]

export function FilterSelector({ currentFilter, onFilterChange }: FilterSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="mb-2 text-sm font-medium">Filters</h3>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 p-1">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={currentFilter === filter.id ? "default" : "outline"}
              className="flex-shrink-0"
              onClick={() => onFilterChange(filter.id)}
            >
              {filter.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

