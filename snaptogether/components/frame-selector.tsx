/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { InfoCircle } from "@/components/info-circle"
import { TEMPLATE_FRAMES } from "@/components/frame-templates"

interface FrameSelectorProps {
  currentFrame: string | null
  customFrames: string[]
  onFrameChange: (frame: string | null) => void
}

export function FrameSelector({ currentFrame, customFrames, onFrameChange }: FrameSelectorProps) {
  const [allFrames, setAllFrames] = useState<Array<{ id: string; name: string; url: string; description?: string }>>([])

  // Combine template frames with custom frames
  useEffect(() => {
    const customFramesFormatted = customFrames.map((url, index) => ({
      id: `custom-${index}`,
      name: `Custom ${index + 1}`,
      url,
      description: "Your uploaded frame",
    }))

    setAllFrames([...TEMPLATE_FRAMES, ...customFramesFormatted])
  }, [customFrames])

  // Function to render a preview of the SVG frame
  const renderFramePreview = (frame: { id?: string; name: any; url: any; description?: string | undefined }) => {
    // For template frames, use the SVG content
    const templateFrame = TEMPLATE_FRAMES.find((f) => f.url === frame.url)

    if (templateFrame && templateFrame.svgContent) {
      return (
        <div
          className="h-full w-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: templateFrame.svgContent }}
        />
      )
    }

    // For custom frames, use the image URL
    return (
      <img
        src={frame.url || "/placeholder.svg?height=300&width=400"}
        alt={frame.name}
        className="h-full w-full object-contain"
      />
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Select a Frame Template</h3>
        <InfoCircle text="These frames will be applied to your photos. Templates include transparent areas for your photo to show through." />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {allFrames.map((frame) => (
          <div
            key={frame.id}
            className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
              currentFrame === frame.url ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onFrameChange(frame.url)}
          >
            <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
              {renderFramePreview(frame)}
              {currentFrame === frame.url && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Selected</div>
                </div>
              )}
            </div>
            <div className="p-2">
              <h4 className="font-medium text-sm">{frame.name}</h4>
              {frame.description && <p className="text-xs text-muted-foreground truncate">{frame.description}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <h4 className="font-medium mb-2">Frame Guidelines</h4>
        <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
          <li>Use PNG images with transparent areas for photos</li>
          <li>Recommended dimensions: 400px × 300px</li>
          <li>Avoid frames that cover too much of the photo area</li>
          <li>Simple borders and decorative corners work best</li>
        </ul>
      </div>
    </div>
  )
}

