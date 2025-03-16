"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, Download, RefreshCw, Upload } from "lucide-react";

import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { FilterSelector } from "@/components/filter-selector";
import { Progress } from "@/components/progress";
import { useMobile } from "@/hooks/use-mobile";

export function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stripCanvasRef = useRef<HTMLCanvasElement>(null)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [stripImage, setStripImage] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState<string>("none")
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("camera"); 


  useEffect(() => {
    // Ensure video is ready and canvas is available
    const updateCanvas = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (canvas && video) {
        const context = canvas.getContext('2d');
        if (context) {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          // Draw the video frame
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Apply the filter
          applyFilter(context, currentFilter, canvas.width, canvas.height);
        }
      }
    };
  
    const intervalId = setInterval(updateCanvas, 100); // Update 10 times per second
  
    return () => clearInterval(intervalId);
  }, [currentFilter]);
  

  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => videoRef.current.play();
        }
        setCameraPermission(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraPermission(false);
      }
    };
  
    startCamera();
  
    // Cleanup directly using the video element's srcObject.
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);
  

  // Run a countdown and return a promise that resolves when done.
  const runCountdown = (seconds) => {
    return new Promise((resolve) => {
      setCountdown(seconds);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            resolve();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });
  };

  // Capture the current video frame into the canvas and return a data URL.
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!video.videoWidth || !video.videoHeight) {
        console.error("Video dimensions not available yet.");
        return null;
      }

      // Set canvas size to match the video.
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current frame from the video.
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Apply the current filter.
      applyFilter(context, currentFilter, canvas.width, canvas.height);

      // Return the image as a data URL.
      return canvas.toDataURL("image/png");
    }
    return null;
  };

  // Sequentially capture 4 photos.
  const runPhotoSequence = async () => {
    setIsCapturing(true);
    setStripImage(null);
    
    // Check if video is active before starting
    if (!videoRef.current || !videoRef.current.srcObject) {
      console.error("Video stream not available");
      setIsCapturing(false);
      return;
    }
    
    // Ensure video is playing
    try {
      await videoRef.current.play();
    } catch (err) {
      console.error("Failed to play video:", err);
    }
    
    const photos = [];
    
    for (let i = 0; i < 4; i++) {
      await runCountdown(3);
      // Give video time to refresh between shots
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Double check video is still available
      if (!videoRef.current || videoRef.current.paused) {
        console.log("Video is paused, attempting to resume");
        try {
          await videoRef.current?.play();
        } catch (err) {
          console.error("Failed to resume video");
        }
      }
      
      const photo = capturePhoto();
      if (photo) {
        photos.push(photo);
      }
    }
    
    setCapturedImages(photos);
    setTimeout(() => {
      createPhotoStrip(photos);
      setIsCapturing(false);
    }, 100);
  };

  // Create a photo strip by stacking the 4 images.
  const createPhotoStrip = (photos = capturedImages) => {
    setCapturedImages(photos);
    console.log(capturedImages.length);
    console.log(stripCanvasRef.current);
    if (photos.length < 4 || !stripCanvasRef.current) {
      console.log("lmao" + photos.length);
      console.log("rofl" + stripCanvasRef.current);
      console.error("Not enough photos to create a strip");
      return;
    }

    const canvas = stripCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Define dimensions.
    const photoWidth = 400;
    const photoHeight = 300;
    const padding = 10;

    // Set canvas size for a vertical strip.
    canvas.width = photoWidth + padding * 2;
    canvas.height = (photoHeight + padding) * 4 + padding;

    // Fill background with white.
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load each image and draw it on the canvas.
    const loadAndDrawImages = async () => {
      for (let i = 0; i < 4; i++) {
        await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const y = padding + i * (photoHeight + padding);
            ctx.drawImage(img, padding, y, photoWidth, photoHeight);
            resolve();
          };
          img.src = photos[i];
        });
      }
      // Optional: Add title or branding.
      ctx.fillStyle = "black";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SnapBooth", canvas.width / 2, 30);

      // Convert the completed strip to a data URL.
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setStripImage(dataUrl);

      setActiveTab("strip");
    };

    loadAndDrawImages();
  };

  // Filter function that modifies the image data.
  const applyFilter = (context: CanvasRenderingContext2D, filter: string, width: number, height: number) => {
    // Skip if no filter selected
    if (filter === "none") return;
    
    // Get the image data to manipulate
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    switch (filter) {
      case "grayscale":
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;     // red
          data[i + 1] = avg; // green
          data[i + 2] = avg; // blue
        }
        break;
        
      case "sepia":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        break;
        
      case "invert":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];         // red
          data[i + 1] = 255 - data[i + 1]; // green
          data[i + 2] = 255 - data[i + 2]; // blue
        }
        break;
        
      case "vintage":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, (r * 0.9) + 40);
          data[i + 1] = Math.min(255, (g * 0.7) + 20);
          data[i + 2] = Math.min(255, (b * 0.6) + 10);
        }
        break;
        
      case "blueprint":
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = 0;                // No red (zero)
          data[i + 1] = avg * 0.4;    // Low green
          data[i + 2] = Math.min(255, avg * 1.2); // High blue
        }
        break;
    }
    
    // Put the modified data back
    context.putImageData(imageData, 0, 0);
  };

  // Reset the photobooth state.
  const resetCamera = () => {
    setCapturedImages([]);
    setStripImage(null);
    setIsCapturing(false);
    setCountdown(0);
    setUploadStatus(null);
  };

  // Download the photo strip.
  const downloadStrip = () => {
    if (stripImage) {
      const link = document.createElement("a");
      link.href = stripImage;
      link.download = `snapbooth-strip-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Simulated upload function.
  const uploadStrip = async () => {
    if (!stripImage) return;
    setUploadStatus("Uploading...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setUploadStatus("Upload successful! Your strip has been saved.");
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadStatus("Upload failed. Please try again.");
    }
  };

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

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
    );
  }

  return (
    <div className="mx-auto max-w-3xl">

      <canvas 
        ref={stripCanvasRef} 
        style={{ display: 'none' }} 
        width="400" 
        height="1200"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="camera" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera">Camera</TabsTrigger>
          <TabsTrigger value="strip" disabled={!stripImage}>Photo Strip</TabsTrigger>
        </TabsList>
        <TabsContent value="camera" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="relative overflow-hidden rounded-lg bg-black aspect-video">
                {isCapturing && countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-10" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="text-white text-7xl font-bold">{countdown}</div>
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                  style={{ display: 'none' }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
                {isCapturing && countdown === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <Progress value={(capturedImages.length / 4) * 100} className="h-2" />
                    <p className="text-white text-center mt-2">
                      Taking photo {capturedImages.length + 1} of 4
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <FilterSelector currentFilter={currentFilter} onFilterChange={handleFilterChange} />
              </div>
              <div className="mt-6 flex justify-center gap-4">
                {!isCapturing && capturedImages.length === 0 && (
                  <Button onClick={runPhotoSequence} className="gap-2">
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
                  <img src={stripImage} alt="Photo Strip" className="h-full w-full object-contain" />
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
                    disabled={
                      uploadStatus?.includes("successful") ||
                      uploadStatus?.includes("Uploading")
                    }
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
  );
}
