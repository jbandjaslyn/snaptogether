import Link from "next/link"
import { Camera, ChevronLeft } from "lucide-react"

import { Button } from "@/components/button"
import { Card, CardContent } from "@/components/card"

export default function GalleryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Camera className="w-6 h-6" />
            <span>SnapBooth</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Booth</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container grid items-center gap-6 px-4 py-8 md:px-6 md:py-12 lg:gap-10">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Your Gallery</h1>
            <p className="mx-auto text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 max-w-[700px]">
              View and manage your saved photos
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <GalleryEmptyState />
          </div>
        </div>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
          <div className="text-sm text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} SnapBooth. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm underline">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function GalleryEmptyState() {
  return (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <Camera className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">No Photos Yet</h3>
        <p className="mb-4 text-muted-foreground">Your gallery is empty. Take some photos to see them here!</p>
        <Button asChild>
          <Link href="/">Take Photos</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

