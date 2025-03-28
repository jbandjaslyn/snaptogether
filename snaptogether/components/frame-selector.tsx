/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { InfoCircle } from "@/components/info-circle"
import { TEMPLATE_FRAMES } from "@/components/frame-templates"

interface FrameSelectorProps {
  currentFrame: string | null
  customFrames: string[]
  onFrameChange: (frame: string | null) => void
  onDeleteCustomFrame?: (index: number) => void
}

interface FrameData {
  url: string;
  type: 'svg' | 'png';
}

export function FrameSelector({ currentFrame, customFrames, onFrameChange, onDeleteCustomFrame }: FrameSelectorProps) {
  const [allFrames, setAllFrames] = useState<Array<{ id: string; name: string; frameData: FrameData; description?: string }>>([])

  // Combine template frames with custom frames
  useEffect(() => {
    const customFramesFormatted = customFrames.map((frameDataStr, index) => {
      let frameData: FrameData;
      try {
        frameData = JSON.parse(frameDataStr);
      } catch (e) {
        // Handle legacy frames that were stored as plain URLs
        frameData = { url: frameDataStr, type: frameDataStr.includes('svg') ? 'svg' : 'png' };
      }
      
      return {
        id: `custom-${index}`,
        name: `Custom ${index + 1}`,
        frameData,
        description: `Custom ${frameData.type.toUpperCase()} frame`,
      };
    });

    const templateFramesFormatted = TEMPLATE_FRAMES.map(frame => ({
      ...frame,
      frameData: { url: frame.url, type: 'svg' as const }
    }));

    setAllFrames([...templateFramesFormatted, ...customFramesFormatted]);
  }, [customFrames]);

  // Function to render a preview of the frame
  const renderFramePreview = (frame: { id?: string; name: string; frameData: FrameData; description?: string }) => {
    // For template frames, use the SVG content
    const templateFrame = TEMPLATE_FRAMES.find((f) => f.url === frame.frameData.url) as { svgContent?: string }

    if (templateFrame?.svgContent) {
      return (
        <div
          className="h-full w-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: templateFrame.svgContent }}
        />
      )
    }

    // For custom frames (both PNG and SVG), use the image URL
    return (
      <img
        src={frame.frameData.url || "/placeholder.svg?height=300&width=400"}
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
              currentFrame === frame.frameData.url ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onFrameChange(frame.frameData.url)}
          >
            <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
              {renderFramePreview(frame)}
              {currentFrame === frame.frameData.url && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Selected</div>
                </div>
              )}
            </div>
            <div className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">{frame.name}</h4>
                  {frame.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {frame.description}
                    </p>
                  )}
                </div>
                {frame.id?.startsWith('custom-') && onDeleteCustomFrame && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this frame?')) {
                        const index = parseInt(frame.id.split('-')[1]);
                        onDeleteCustomFrame(index);
                        if (currentFrame === frame.frameData.url) {
                          onFrameChange(null);
                        }
                      }
                    }}
                    className="text-destructive hover:text-destructive/80 p-1 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                )}
              </div>
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

