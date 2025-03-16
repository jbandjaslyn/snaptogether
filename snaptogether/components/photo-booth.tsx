"use client"

import { useRef, useState, useEffect } from "react"
import { Camera, Download, RefreshCw, Upload } from "lucide-react"

import { Button } from "@/components/button"
import { Card, CardContent } from "@/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs"
import { FilterSelector } from "@/components/filter-selector"
import { useMobile } from "@/hooks/use-mobile"
import { Progress } from "@/components/progress"

export function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stripCanvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [stripImage, setStripImage] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState<string>("normal")
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const isMobile = useMobile()

  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }

        setCameraPermission(true)
      } catch (err) {
        console.error("Error accessing camera:", err)
        setCameraPermission(false)
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw the video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Apply filter effects
        applyFilter(context, currentFilter, canvas.width, canvas.height)

        // Convert canvas to data URL
        const imageDataURL = canvas.toDataURL("image/png")
        return imageDataURL
      }
    }
    return null
  }

  const startPhotoboothSequence = () => {
    setIsCapturing(true)
    setCapturedImages([])
    setStripImage(null)
    setCurrentPhotoIndex(0)
    startCountdown(3)
  }

  const startCountdown = (seconds: number) => {
    setCountdown(seconds)

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval)
          // Take photo when countdown reaches 0
          if (currentPhotoIndex < 4) {
            const photo = capturePhoto()
            if (photo) {
              setCapturedImages((prev) => [...prev, photo])
              setCurrentPhotoIndex(currentPhotoIndex + 1)

              // If we haven't taken all 4 photos yet, start the next countdown
              if (currentPhotoIndex < 3) {
                setTimeout(() => startCountdown(3), 500)
              } else {
                // We've taken all 4 photos, create the strip
                setTimeout(() => createPhotoStrip(), 500)
              }
            }
          }
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const createPhotoStrip = () => {
    if (capturedImages.length !== 4 || !stripCanvasRef.current) return

    const canvas = stripCanvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Set dimensions for the strip (vertical layout)
    const photoWidth = 400
    const photoHeight = 300
    const padding = 10

    canvas.width = photoWidth + padding * 2
    canvas.height = photoHeight * 4 + padding * 5

    // Fill with white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Load and draw each image
    const loadImages = async () => {
      for (let i = 0; i < 4; i++) {
        const img = new Image()
        img.crossOrigin = "anonymous"

        // Create a promise to wait for the image to load
        await new Promise<void>((resolve) => {
          img.onload = () => {
            // Calculate position for this photo
            const y = padding + i * (photoHeight + padding)

            // Draw the photo
            ctx.drawImage(img, padding, y, photoWidth, photoHeight)
            resolve()
          }
          img.src = capturedImages[i]
        })
      }

      // Add a title/branding to the strip
      ctx.fillStyle = "black"
      ctx.font = "bold 20px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("SnapBooth", canvas.width / 2, padding / 2 + 10)

      // Convert the strip to an image
      const stripImageURL = canvas.toDataURL("image/jpeg", 0.9)
      setStripImage(stripImageURL)
      setIsCapturing(false)
    }

    loadImages()
  }

  const applyFilter = (context: CanvasRenderingContext2D, filter: string, width: number, height: number) => {
    const imageData = context.getImageData(0, 0, width, height)
    const data = imageData.data

    switch (filter) {
      case "grayscale":
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i] = avg
          data[i + 1] = avg
          data[i + 2] = avg
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
          data[i] = 255 - data[i]
          data[i + 1] = 255 - data[i + 1]
          data[i + 2] = 255 - data[i + 2]
        }
        break
      case "normal":
      default:
        // No filter
        break
    }

    context.putImageData(imageData, 0, 0)
  }

  const resetCamera = () => {
    setCapturedImages([])
    setStripImage(null)
    setIsCapturing(false)
    setCountdown(null)
    setCurrentPhotoIndex(0)
    setUploadStatus(null)
  }

  const downloadStrip = () => {
    if (stripImage) {
      const link = document.createElement("a")
      link.href = stripImage
      link.download = `snapbooth-strip-${new Date().getTime()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const uploadStrip = async () => {
    if (!stripImage) return

    setUploadStatus("Uploading...")

    // This is a mock upload function
    // In a real application, you would send the image to your server or a storage service
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock successful upload
      setUploadStatus("Upload successful! Your strip has been saved.")

      // In a real app, you would do something like:
      // const formData = new FormData()
      // formData.append('image', await fetch(stripImage).then(r => r.blob()), 'photostrip.jpg')
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData
      // })
      // if (response.ok) {
      //   setUploadStatus("Upload successful!")
      // } else {
      //   throw new Error('Upload failed')
      // }
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadStatus("Upload failed. Please try again.")
    }
  }

  const handleFilterChange = (filter: string) => {
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
      <Tabs defaultValue="camera" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera">Camera</TabsTrigger>
          <TabsTrigger value="strip" disabled={!stripImage}>
            Photo Strip
          </TabsTrigger>
        </TabsList>
        <TabsContent value="camera" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="relative overflow-hidden rounded-lg bg-black aspect-video">
                {isCapturing && countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                    <div className="text-white text-7xl font-bold">{countdown}</div>
                  </div>
                )}

                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

                <canvas ref={canvasRef} className="hidden" />

                {isCapturing && countdown === null && (
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <Progress value={(currentPhotoIndex / 4) * 100} className="h-2" />
                    <p className="text-white text-center mt-2">Taking photo {currentPhotoIndex + 1} of 4</p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <FilterSelector currentFilter={currentFilter} onFilterChange={handleFilterChange} />
              </div>

              <div className="mt-6 flex justify-center gap-4">
                {!isCapturing && capturedImages.length === 0 && (
                  <Button onClick={startPhotoboothSequence} className="gap-2" disabled={isCapturing}>
                    <Camera className="h-4 w-4" />
                    Start Photobooth (4 Photos)
                  </Button>
                )}

                {(isCapturing || capturedImages.length > 0) && !stripImage && (
                  <div className="text-center w-full">
                    {isCapturing ? <p>Taking photos... Please stay still</p> : <p>Creating your photo strip...</p>}
                  </div>
                )}

                {stripImage && (
                  <Button variant="outline" onClick={resetCamera} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    New Strip
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="strip" className="mt-4">
          {stripImage && (
            <Card>
              <CardContent className="p-6">
                <div className="overflow-hidden rounded-lg mx-auto max-w-md">
                  <img
                    src={stripImage || "/placeholder.svg"}
                    alt="Photo Strip"
                    className="h-full w-full object-contain"
                  />
                  <canvas ref={stripCanvasRef} className="hidden" />
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
                  <Button variant="outline" onClick={resetCamera} className="gap-2">
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

