"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, FileUp, FileImage } from "lucide-react"
import { Button } from "@/components/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs"

interface FrameUploaderProps {
  onFrameUpload: (frameUrl: string) => void
}

export function FrameUploader({ onFrameUpload }: FrameUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadType, setUploadType] = useState<"file" | "template">("file")

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    // Check if file is an acceptable image type
    if (!file.type.match(/^image\/(png|svg\+xml)$/)) {
      alert("Please upload a PNG or SVG file")
      return
    }

    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert("File size should be less than 20MB")
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      if (e.target?.result) {
        const frameUrl = e.target.result as string
        
        // For PNG files, verify dimensions and transparency
        if (file.type === 'image/png') {
          const img = new Image()
          img.onload = async () => {
            // Check dimensions
            if (img.width !== 1200 || img.height !== 3600) {
              alert("PNG frame must be 1200x3600 pixels. Please use the template as a guide.")
              return
            }
            
            try {
              // Compress PNG before storing
              const canvas = document.createElement('canvas')
              canvas.width = img.width
              canvas.height = img.height
              const ctx = canvas.getContext('2d')
              if (!ctx) {
                throw new Error('Could not get canvas context')
              }
              
              // Draw and compress
              ctx.drawImage(img, 0, 0)
              const compressedUrl = canvas.toDataURL('image/png', 0.7) // Compress with 0.7 quality
              
              // Check estimated storage size
              const totalSize = estimateStorageSize(compressedUrl)
              if (totalSize > 4.5 * 1024 * 1024) { // Warning at 4.5MB
                if (!confirm("This frame is quite large and may cause storage issues. Continue anyway?")) {
                  return
                }
              }

              // Store frame type along with the URL
              const frameData = {
                url: compressedUrl,
                type: 'png'
              }
              setPreviewUrl(compressedUrl)
              onFrameUpload(JSON.stringify(frameData))
            } catch (error) {
              if (error instanceof Error && error.name === 'QuotaExceededError') {
                alert("Storage limit reached. Please delete some existing frames first.")
              } else {
                alert("Error processing image. Please try a smaller file.")
                console.error("Frame processing error:", error)
              }
            }
          }
          img.src = frameUrl
        } else {
          // For SVG files, store with type
          try {
            // Check estimated storage size
            const totalSize = estimateStorageSize(frameUrl)
            if (totalSize > 4.5 * 1024 * 1024) { // Warning at 4.5MB
              if (!confirm("This frame is quite large and may cause storage issues. Continue anyway?")) {
                return
              }
            }

            const frameData = {
              url: frameUrl,
              type: 'svg'
            }
            setPreviewUrl(frameUrl)
            onFrameUpload(JSON.stringify(frameData))
          } catch (error) {
            if (error instanceof Error && error.name === 'QuotaExceededError') {
              alert("Storage limit reached. Please delete some existing frames first.")
            } else {
              alert("Error processing image. Please try a smaller file.")
              console.error("Frame processing error:", error)
            }
          }
        }
      }
    }
    reader.readAsDataURL(file)
  }

  // Helper function to estimate storage size
  const estimateStorageSize = (dataUrl: string): number => {
    // Get current frames from localStorage
    const currentFrames = localStorage.getItem('customFrames')
    const currentSize = currentFrames ? new Blob([currentFrames]).size : 0
    const newItemSize = new Blob([dataUrl]).size
    return currentSize + newItemSize
  }

  const clearPreview = () => {
    setPreviewUrl(null)
  }

  // Template SVG code to download - this is a simple frame template with guides
  const downloadTemplateFile = () => {
    const templateSVG = `
    <svg width="1200" height="3600" xmlns="http://www.w3.org/2000/svg">
      <!-- White background -->
      <rect x="0" y="0" width="1200" height="3600" fill="white"/>
      
      <!-- Photo frames -->
      <!-- Frame 1 -->
      <rect x="100" y="80" width="1000" height="700" fill="none" stroke="#FF0000" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="600" y="430" font-family="Arial" font-size="20" text-anchor="middle" fill="#888888">Photo Area 1 (keep transparent)</text>

      <!-- Frame 2 -->
      <rect x="100" y="840" width="1000" height="700" fill="none" stroke="#FF0000" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="600" y="1190" font-family="Arial" font-size="20" text-anchor="middle" fill="#888888">Photo Area 2 (keep transparent)</text>

      <!-- Frame 3 -->
      <rect x="100" y="1600" width="1000" height="700" fill="none" stroke="#FF0000" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="600" y="1950" font-family="Arial" font-size="20" text-anchor="middle" fill="#888888">Photo Area 3 (keep transparent)</text>

      <!-- Frame 4 -->
      <rect x="100" y="2360" width="1000" height="700" fill="none" stroke="#FF0000" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="600" y="2710" font-family="Arial" font-size="20" text-anchor="middle" fill="#888888">Photo Area 4 (keep transparent)</text>

      <!-- Bottom branding area - enlarged -->
      <rect x="100" y="3120" width="1000" height="400" fill="none" stroke="#FF0000" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="600" y="3320" font-family="Arial" font-size="20" text-anchor="middle" fill="#888888">Branding Area (customize)</text>
      
      <!-- Template guides -->
      <text x="600" y="3550" font-family="Arial" font-size="16" text-anchor="middle" fill="#666666">Frame Template - 1200×3600px</text>
      <text x="600" y="3580" font-family="Arial" font-size="14" text-anchor="middle" fill="#666666">Keep photo areas transparent when designing your frame</text>
    </svg>`

    const blob = new Blob([templateSVG], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "photostrip-template.svg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-4">
      <h3 className="text-sm font-medium">Upload Your Own Frame</h3>
      <div className="text-xs text-muted-foreground mb-2">
        Accepted formats:
        <ul className="list-disc pl-5 mt-1">
          <li>PNG (1200x3600px, with transparency)</li>
          <li>SVG (with transparent photo areas)</li>
        </ul>
      </div>

      <Tabs
        defaultValue="file"
        className="w-full"
        onValueChange={(value) => setUploadType(value as "file" | "template")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload Image</TabsTrigger>
          <TabsTrigger value="template">Get Template</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="pt-4">
          {!previewUrl ? (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("frame-upload")?.click()}
            >
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Drag and drop your frame image here</p>
              <p className="text-xs text-muted-foreground">or click to browse (PNG with transparency recommended)</p>
              <input id="frame-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="relative border rounded-lg overflow-hidden">
              <div className="aspect-[2/5] w-full relative">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Frame preview"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full"
                  onClick={clearPreview}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="template" className="pt-4">
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-4">
              <FileImage className="h-10 w-10 text-muted-foreground" />
              <div>
                <h4 className="font-medium text-sm">Frame Template</h4>
                <p className="text-xs text-muted-foreground">Download an SVG template to create your custom frame</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={downloadTemplateFile} className="gap-2">
                <FileUp className="h-4 w-4" />
                Download Template
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>How to use the template:</p>
              <ol className="list-decimal pl-5 space-y-1 mt-1">
                <li>Download the SVG template</li>
                <li>Open in an image editor (like Inkscape, Illustrator, or Photoshop)</li>
                <li>Design your frame around the transparent photo area</li>
                <li>Save as PNG with transparency</li>
                <li>Upload your custom frame</li>
              </ol>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

