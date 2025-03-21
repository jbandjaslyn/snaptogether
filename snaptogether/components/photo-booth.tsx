"use client"

import { useRef, useState, useEffect } from "react"
import { Camera, Download, RefreshCw, Upload, Play, AlertCircle, ImageIcon, Check } from "lucide-react"

import { Button } from "@/components/button"
import { Card, CardContent } from "@/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs"
import { FilterSelector } from "@/components/filter-selector"
import { FrameSelector } from "@/components/frame-selector"
import { FrameUploader } from "@/components/frame-uploader"
import { Progress } from "@/components/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui"

// Import frame SVGs directly
import { TEMPLATE_FRAMES } from "@/components/frame-templates"
import { savePhoto } from "@/lib/storage"

export function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stripCanvasRef = useRef<HTMLCanvasElement>(null)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [stripImage, setStripImage] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState<string>("none")
  const [currentFrame, setCurrentFrame] = useState<string | null>(null)
  const [customFrames, setCustomFrames] = useState<string[]>([])
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("frames") // Start with frames tab
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [frameSelected, setFrameSelected] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Load custom frames from localStorage on component mount
  useEffect(() => {
    const savedFrames = localStorage.getItem("customFrames")
    if (savedFrames) {
      try {
        const frames = JSON.parse(savedFrames)
        setCustomFrames(frames)

        // If we have previously saved frames, check if one was selected
        const savedSelectedFrame = localStorage.getItem("selectedFrame")
        if (savedSelectedFrame) {
          setCurrentFrame(savedSelectedFrame)
          setFrameSelected(true)
        }
      } catch (e) {
        console.error("Error loading saved frames:", e)
        setDebugInfo(`Error loading saved frames: ${e.message}`)
      }
    }
  }, [])

  // Save custom frames to localStorage when they change
  useEffect(() => {
    if (customFrames.length > 0) {
      localStorage.setItem("customFrames", JSON.stringify(customFrames))
    }

    // Save the selected frame to localStorage
    if (currentFrame) {
      localStorage.setItem("selectedFrame", currentFrame)
    } else {
      localStorage.removeItem("selectedFrame")
    }
  }, [customFrames, currentFrame])

  // Update canvas with video feed and apply filter
  useEffect(() => {
    if (!isCameraActive || !setupComplete) return

    const updateCanvas = () => {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (canvas && video && video.readyState >= 2 && !video.paused) {
        const context = canvas.getContext("2d")
        if (context) {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth || 640
          canvas.height = video.videoHeight || 480
          // Draw the video frame
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          // Apply the filter
          applyFilter(context, currentFilter, canvas.width, canvas.height)
        }
      }
    }

    const intervalId = setInterval(updateCanvas, 100) // Update 10 times per second

    return () => clearInterval(intervalId)
  }, [currentFilter, isCameraActive, setupComplete])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraStream])

  // Initialize camera access
  const initializeCamera = async () => {
    setIsCameraLoading(true)
    setCameraError(null)
    setDebugInfo("Initializing camera...")

    try {
      // Stop any existing stream
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }

      // Request camera access
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      }

      setDebugInfo("Requesting camera access...")
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setCameraStream(stream)
      setDebugInfo("Camera access granted, setting up video element...")

      if (videoRef.current) {
        videoRef.current.srcObject = stream

        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) return reject("Video element not found")

          videoRef.current.onloadedmetadata = () => {
            setDebugInfo("Video metadata loaded")
            resolve()
          }

          // Set a timeout in case onloadedmetadata doesn't fire
          setTimeout(() => {
            if (videoRef.current?.readyState >= 2) {
              setDebugInfo("Video ready state check passed")
              resolve()
            } else {
              setDebugInfo(`Video not ready: readyState=${videoRef.current?.readyState}`)
              reject("Video metadata loading timeout")
            }
          }, 5000)
        })

        // Start playing the video
        setDebugInfo("Starting video playback...")
        await videoRef.current.play()
        setDebugInfo("Video playback started")

        setIsCameraActive(true)
        setCameraPermission(true)
        setIsCameraLoading(false)
      } else {
        setDebugInfo("Video element not found")
        throw new Error("Video element not found")
      }
    } catch (err) {
      console.error("Camera initialization error:", err)
      setDebugInfo(`Camera error: ${err.message || "Unknown error"}`)
      setCameraPermission(false)
      setIsCameraLoading(false)
      setCameraError(err.message || "Failed to access camera")
      setIsCameraActive(false)
    }
  }

  // Handle frame upload
  const handleFrameUpload = (frameUrl: string) => {
    setCustomFrames((prev) => [...prev, frameUrl])
    setCurrentFrame(frameUrl)
    setFrameSelected(true)
  }

  // Handle frame selection
  const handleFrameChange = (frameUrl: string | null) => {
    setCurrentFrame(frameUrl)
    setFrameSelected(!!frameUrl)
  }

  // Complete setup and move to camera tab
  const completeSetup = () => {
    if (!frameSelected) {
      alert("Please select a frame before continuing")
      return
    }

    setSetupComplete(true)
    setActiveTab("camera")

    // Initialize camera automatically when moving to camera tab
    if (!isCameraActive && !isCameraLoading) {
      initializeCamera()
    }
  }

  // Run a countdown and return a promise that resolves when done.
  const runCountdown = (seconds) => {
    return new Promise((resolve) => {
      setCountdown(seconds)
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            resolve()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    })
  }

  // Capture the current video frame into the canvas and return a data URL.
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas element not found")
      setDebugInfo("Capture error: Video or canvas element not found")
      return null
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) {
      console.error("Could not get canvas context")
      setDebugInfo("Capture error: Could not get canvas context")
      return null
    }

    if (video.readyState < 2) {
      console.error("Video not ready for capture")
      setDebugInfo(`Capture error: Video not ready (readyState=${video.readyState})`)
      return null
    }

    // Set canvas size to match the video
    const width = video.videoWidth || 640
    const height = video.videoHeight || 480
    canvas.width = width
    canvas.height = height

    // Draw the current frame from the video
    try {
      context.drawImage(video, 0, 0, width, height)

      // Apply the current filter
      applyFilter(context, currentFilter, width, height)

      // Return the image as a data URL
      return canvas.toDataURL("image/png")
    } catch (err) {
      console.error("Error capturing photo:", err)
      setDebugInfo(`Capture error: ${err.message}`)
      return null
    }
  }

  // Sequentially capture 4 photos.
  const runPhotoSequence = async () => {
    // Verify camera is active and ready
    if (!isCameraActive || !cameraStream) {
      setCameraError("Camera is not active. Please start the camera first.")
      return
    }

    if (!videoRef.current || videoRef.current.readyState < 2) {
      setCameraError("Video stream is not ready. Please wait a moment and try again.")
      return
    }

    // Check if frame is selected
    if (!frameSelected) {
      setCameraError("Please select a frame before taking photos.")
      return
    }

    setIsCapturing(true)
    setStripImage(null)
    setCameraError(null)
    setCapturedImages([]) // Reset captured images

    const photos: string[] = []

    try {
      for (let i = 0; i < 4; i++) {
        await runCountdown(3)

        // Ensure video is still playing
        if (videoRef.current?.paused) {
          try {
            await videoRef.current.play()
          } catch (err) {
            console.error("Failed to resume video:", err)
            setDebugInfo(`Failed to resume video: ${err instanceof Error ? err.message : 'Unknown error'}`)
          }
        }

        // Capture photo with retry
        let photo: string | null = null
        for (let attempt = 0; attempt < 3 && !photo; attempt++) {
          photo = capturePhoto()
          if (!photo) {
            // Small delay before retry
            await new Promise(r => setTimeout(r, 100))
          }
        }

        if (!photo) {
          throw new Error("Failed to capture photo after multiple attempts")
        }

        photos.push(photo)
        setCapturedImages([...photos]) // Update UI with each photo
        
        // Small delay to ensure UI updates
        await new Promise(r => setTimeout(r, 100))
      }

      // Only create strip if we have all 4 photos
      if (photos.length === 4) {
        await createPhotoStrip(photos)
      } else {
        throw new Error(`Expected 4 photos but got ${photos.length}`)
      }
    } catch (error) {
      console.error("Photo sequence error:", error)
      setCameraError(error instanceof Error ? error.message : "Failed to complete photo sequence")
    } finally {
      setIsCapturing(false)
    }
  }

  // Create a photo strip by stacking the 4 images.
  const createPhotoStrip = async (photos: string[]) => {
    try {
      if (!photos || photos.length < 4) {
        throw new Error("Not enough photos to create a strip")
      }

      // Initialize strip canvas with proper dimensions
      const stripCanvas = stripCanvasRef.current
      if (!stripCanvas) {
        throw new Error("Strip canvas not found")
      }

      // Define dimensions with film strip aesthetics
      const photoWidth = 800 // Make photos larger
      const photoHeight = 600
      const padding = 40 // Larger padding
      const borderWidth = 60 // Width of the black film strip border
      const bottomBrandingHeight = 120 // Height for the branding section

      // Set canvas size for a vertical strip with borders
      stripCanvas.width = photoWidth + (padding * 2) + (borderWidth * 2)
      stripCanvas.height = (photoHeight * 4) + (padding * 5) + bottomBrandingHeight

      const ctx = stripCanvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      // Clear any previous content
      ctx.clearRect(0, 0, stripCanvas.width, stripCanvas.height)

      // Fill background with black for film strip effect
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height)

      // Draw the film strip holes
      const holeRadius = 20
      const holeOffset = 30
      const holes = 9 // Number of holes on each side
      const holeSpacing = (stripCanvas.height - bottomBrandingHeight) / (holes - 1)
      
      ctx.fillStyle = "#333333" // Darker gray for hole shadows
      for (let side = 0; side < 2; side++) {
        const x = side === 0 ? borderWidth/2 : stripCanvas.width - borderWidth/2
        for (let i = 0; i < holes; i++) {
          const y = holeOffset + (i * holeSpacing)
          ctx.beginPath()
          ctx.arc(x, y, holeRadius + 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      
      ctx.fillStyle = "#444444" // Lighter gray for holes
      for (let side = 0; side < 2; side++) {
        const x = side === 0 ? borderWidth/2 : stripCanvas.width - borderWidth/2
        for (let i = 0; i < holes; i++) {
          const y = holeOffset + (i * holeSpacing)
          ctx.beginPath()
          ctx.arc(x, y, holeRadius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Load and draw each image
      for (let i = 0; i < 4; i++) {
        await new Promise<void>((resolve) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = async () => {
            const y = padding + (i * (photoHeight + padding))
            
            // Create white background for each photo
            ctx.fillStyle = "white"
            ctx.fillRect(borderWidth + padding, y, photoWidth, photoHeight)
            
            // Calculate dimensions to maintain aspect ratio
            const imgAspectRatio = img.width / img.height
            const targetAspectRatio = photoWidth / photoHeight
            
            let drawWidth = photoWidth
            let drawHeight = photoHeight
            let offsetX = 0
            let offsetY = 0
            
            if (imgAspectRatio > targetAspectRatio) {
              // Image is wider than target
              drawHeight = photoWidth / imgAspectRatio
              offsetY = (photoHeight - drawHeight) / 2
            } else {
              // Image is taller than target
              drawWidth = photoHeight * imgAspectRatio
              offsetX = (photoWidth - drawWidth) / 2
            }
            
            // Draw the image maintaining aspect ratio
            ctx.drawImage(
              img, 
              borderWidth + padding + offsetX, 
              y + offsetY, 
              drawWidth, 
              drawHeight
            )

            // If a frame is selected, apply it
            if (currentFrame) {
              const frameImg = new Image()
              
              // For data URLs, we don't need crossOrigin
              if (!currentFrame.startsWith('data:')) {
                frameImg.crossOrigin = "anonymous"
              }
              
              await new Promise<void>((resolve) => {
                frameImg.onload = () => {
                  try {
                    ctx.drawImage(
                      frameImg,
                      borderWidth + padding,
                      y,
                      photoWidth,
                      photoHeight
                    )
                    resolve()
                  } catch (error) {
                    console.error("Error drawing frame:", error)
                    setDebugInfo(`Error drawing frame: ${error instanceof Error ? error.message : 'Unknown error'}`)
                    resolve()
                  }
                }
                
                frameImg.onerror = () => {
                  console.error("Error loading frame:", currentFrame)
                  setDebugInfo(`Error loading frame: ${currentFrame}`)
                  resolve()
                }
                
                frameImg.src = currentFrame
              })
            }
            resolve()
          }
          
          img.onerror = () => {
            console.error("Error loading image")
            setDebugInfo(`Error loading image: ${photos[i].substring(0, 50)}...`)
            resolve()
          }
          img.src = photos[i]
        })
      }

      // Add branding at the bottom
      const brandingY = stripCanvas.height - bottomBrandingHeight + 20
      ctx.fillStyle = "black"
      ctx.fillRect(0, stripCanvas.height - bottomBrandingHeight, stripCanvas.width, bottomBrandingHeight)
      
      // Add logo/text
      ctx.fillStyle = "white"
      ctx.font = "bold 48px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("SNAPBOOTH", stripCanvas.width / 2, brandingY + 30)
      
      // Add date
      ctx.font = "24px sans-serif"
      ctx.fillText(new Date().toLocaleDateString(), stripCanvas.width / 2, brandingY + 70)

      // Convert the completed strip to a data URL
      const dataUrl = stripCanvas.toDataURL("image/jpeg", 0.95)
      setStripImage(dataUrl)
      setActiveTab("strip")
    } catch (error) {
      console.error("Error creating photo strip:", error)
      setDebugInfo(`Strip error: ${error instanceof Error ? error.message : "Unknown error"}`)
      setStripImage(null)
      setActiveTab("camera")
    }
  }

  // Filter function that modifies the image data.
  const applyFilter = (context: CanvasRenderingContext2D, filter: string, width: number, height: number) => {
    // Skip if no filter selected
    if (filter === "none") return

    // Get the image data to manipulate
    const imageData = context.getImageData(0, 0, width, height)
    const data = imageData.data

    switch (filter) {
      case "grayscale":
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i] = avg // red
          data[i + 1] = avg // green
          data[i + 2] = avg // blue
        }
        break

      case "sepia":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
        }
        break

      case "invert":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i] // red
          data[i + 1] = 255 - data[i + 1] // green
          data[i + 2] = 255 - data[i + 2] // blue
        }
        break

      case "vintage":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          data[i] = Math.min(255, r * 0.9 + 40)
          data[i + 1] = Math.min(255, g * 0.7 + 20)
          data[i + 2] = Math.min(255, b * 0.6 + 10)
        }
        break

      case "blueprint":
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i] = 0 // No red (zero)
          data[i + 1] = avg * 0.4 // Low green
          data[i + 2] = Math.min(255, avg * 1.2) // High blue
        }
        break
    }

    // Put the modified data back
    context.putImageData(imageData, 0, 0)
  }

  // Reset the photobooth state.
  const resetCamera = async () => {
    setCapturedImages([])
    setStripImage(null)
    setIsCapturing(false)
    setCountdown(0)
    setUploadStatus(null)
    setActiveTab("camera")

    // Stop current stream if it exists
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }

    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    // Reinitialize camera
    await initializeCamera()
  }

  // Download the photo strip.
  const downloadStrip = () => {
    if (stripImage) {
      const link = document.createElement("a")
      link.href = stripImage
      link.download = `snapbooth-strip-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Update the upload function to actually save photos
  const uploadStrip = async () => {
    if (!stripImage) return
    setUploadStatus("Uploading...")
    try {
      await savePhoto(stripImage)
      setUploadStatus("Upload successful! Your strip has been saved.")
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadStatus("Upload failed. Please try again.")
    }
  }

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter)
  }

  if (cameraPermission === false) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="p-6 text-center">
          <div className="mb-4 flex justify-center">
            <Camera className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Camera Access Required</h3>
          <p className="mb-4 text-muted-foreground">
            Please allow camera access to use the photo booth. You may need to update your browser settings.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <canvas 
        ref={stripCanvasRef} 
        style={{ display: "none" }} 
        width={800 + (40 * 2) + (60 * 2)} // photoWidth + padding*2 + borderWidth*2
        height={(600 * 4) + (40 * 5) + 120} // (photoHeight * 4) + (padding * 5) + bottomBrandingHeight
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="frames" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="frames">1. Choose Frame</TabsTrigger>
          <TabsTrigger value="camera" disabled={!frameSelected || !setupComplete}>
            2. Take Photos
          </TabsTrigger>
          <TabsTrigger value="strip" disabled={!stripImage}>
            3. View Strip
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frames" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-1">Step 1: Choose or Upload a Frame</h3>
                <p className="text-muted-foreground text-sm">
                  Select a frame template or upload your own before taking photos
                </p>
              </div>

              {/* Frame selector with template frames */}
              <FrameSelector
                currentFrame={currentFrame}
                customFrames={customFrames}
                onFrameChange={handleFrameChange}
              />

              <div className="border-t pt-6">
                <FrameUploader onFrameUpload={handleFrameUpload} />
              </div>

              {customFrames.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all custom frames?")) {
                        setCustomFrames([])
                        setCurrentFrame(null)
                        setFrameSelected(false)
                        localStorage.removeItem("customFrames")
                      }
                    }}
                  >
                    Clear All Custom Frames
                  </Button>
                </div>
              )}

              <div className="border-t pt-6 flex justify-center">
                <Button onClick={completeSetup} disabled={!frameSelected} size="lg" className="gap-2">
                  {frameSelected ? <Check className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                  {frameSelected ? "Continue to Photo Booth" : "Please Select a Frame"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="camera" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-1">Step 2: Take Your Photos</h3>
                <p className="text-muted-foreground text-sm">
                  Using the "
                  {currentFrame ? TEMPLATE_FRAMES.find((f) => f.url === currentFrame)?.name || "Custom" : "selected"}"
                  frame
                </p>
              </div>

              <div className="relative overflow-hidden rounded-lg bg-black aspect-video">
                {isCapturing && countdown > 0 && (
                  <div
                    className="absolute inset-0 flex items-center justify-center z-10"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                  >
                    <div className="text-white text-7xl font-bold">{countdown}</div>
                  </div>
                )}

                {/* Camera loading state */}
                {isCameraLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="text-white">Loading camera...</div>
                  </div>
                )}

                {/* Camera not started state */}
                {!isCameraActive && !isCameraLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                    <Camera className="h-12 w-12 text-white mb-4" />
                    <p className="text-white mb-4">Camera access is required</p>
                    <Button onClick={initializeCamera} className="gap-2">
                      <Play className="h-4 w-4" />
                      Start Camera
                    </Button>
                  </div>
                )}

                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

                {isCapturing && countdown === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <Progress value={(capturedImages.length / 4) * 100} className="h-2" />
                    <p className="text-white text-center mt-2">Taking photo {capturedImages.length + 1} of 4</p>
                  </div>
                )}
              </div>

              {cameraError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{cameraError}</AlertDescription>
                </Alert>
              )}

              <div className="mt-4">
                <FilterSelector currentFilter={currentFilter} onFilterChange={handleFilterChange} />
              </div>

              <div className="mt-6 flex justify-center gap-4">
                {!isCameraActive && !isCameraLoading && (
                  <Button onClick={initializeCamera} className="gap-2">
                    <Play className="h-4 w-4" />
                    Start Camera
                  </Button>
                )}

                {isCameraActive && !isCapturing && capturedImages.length === 0 && (
                  <Button onClick={runPhotoSequence} className="gap-2" disabled={isCameraLoading}>
                    <Camera className="h-4 w-4" />
                    Take Photo Strip (4 Photos)
                  </Button>
                )}

                {(isCapturing || capturedImages.length > 0) && !stripImage && (
                  <div className="text-center w-full">
                    {isCapturing ? <p>Taking photos... Please stay still</p> : <p>Creating your photo strip...</p>}
                  </div>
                )}

                {stripImage && (
                  <Button variant="outline" onClick={() => resetCamera()} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    New Strip
                  </Button>
                )}
              </div>

              {/* Debug information */}
              {debugInfo && (
                <div className="mt-4 p-2 border border-dashed rounded text-xs text-muted-foreground">
                  <details>
                    <summary className="cursor-pointer">Debug Info</summary>
                    <pre className="mt-2 whitespace-pre-wrap">{debugInfo}</pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strip" className="mt-4">
          {stripImage && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-1">Step 3: Your Photo Strip</h3>
                  <p className="text-muted-foreground text-sm">Download or share your completed photo strip</p>
                </div>

                <div className="overflow-hidden rounded-lg mx-auto max-w-md">
                  <img
                    src={stripImage || "/placeholder.svg"}
                    alt="Photo Strip"
                    className="h-full w-full object-contain"
                  />
                </div>
                {uploadStatus && (
                  <div
                    className={`mt-4 p-3 rounded-md text-center ${
                      uploadStatus.includes("successful")
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : uploadStatus.includes("failed")
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    }`}
                  >
                    {uploadStatus}
                  </div>
                )}
                <div className="mt-6 flex justify-center gap-4">
                  <Button variant="outline" onClick={() => resetCamera()} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    New Strip
                  </Button>
                  <Button onClick={downloadStrip} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    onClick={uploadStrip}
                    className="gap-2"
                    disabled={uploadStatus?.includes("successful") || uploadStatus?.includes("Uploading")}
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

