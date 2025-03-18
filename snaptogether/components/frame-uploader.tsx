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
    // Check if file is an image
    if (!file.type.match("image.*")) {
      alert("Please upload an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        const frameUrl = e.target.result as string
        setPreviewUrl(frameUrl)
        onFrameUpload(frameUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  const clearPreview = () => {
    setPreviewUrl(null)
  }

  // Template SVG code to download - this is a simple frame template with guides
  const downloadTemplateFile = () => {
    const templateSVG = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <!-- Photo area (should be transparent) -->
      <rect x="20" y="20" width="360" height="260" fill="none" stroke="#FF0000" strokeWidth="2" strokeDasharray="5,5" />
      
      <!-- Frame border -->
      <rect x="0" y="0" width="400" height="300" fill="none" stroke="#000000" strokeWidth="8" />
      
      <!-- Corner decorations - modify these for your frame design -->
      <path d="M 0,0 L 40,0 L 40,40 L 0,40 Z" fill="#000000" opacity="0.5" />
      <path d="M 360,0 L 400,0 L 400,40 L 360,40 Z" fill="#000000" opacity="0.5" />
      <path d="M 0,260 L 40,260 L 40,300 L 0,300 Z" fill="#000000" opacity="0.5" />
      <path d="M 360,260 L 400,260 L 400,300 L 360,300 Z" fill="#000000" opacity="0.5" />
      
      <!-- Guide text -->
      <text x="200" y="150" fontFamily="Arial" fontSize="12" textAnchor="middle" fill="#888888">Photo Area (keep transparent)</text>
      <text x="200" y="280" fontFamily="Arial" fontSize="10" textAnchor="middle" fill="#000000">Frame Template - 400×300px</text>
    </svg>
    `

    const blob = new Blob([templateSVG], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "frame-template.svg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-4">
      <h3 className="text-sm font-medium">Upload Your Own Frame</h3>

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
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Frame preview"
                className="w-full h-auto object-contain max-h-40"
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

