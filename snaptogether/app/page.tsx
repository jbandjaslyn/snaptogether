import Link from "next/link"
import { Camera, ImageIcon } from "lucide-react"

import { Button } from "@/components/button"
import { PhotoBooth } from "@/components/photo-booth"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Camera className="w-6 h-6" />
            <span>SnapBooth</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/gallery">
              <Button variant="ghost" size="sm" className="gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>Gallery</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container grid items-center gap-6 px-4 py-8 md:px-6 md:py-12 lg:gap-10">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Virtual Photo Booth</h1>
            <p className="mx-auto text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 max-w-[700px]">
              Take fun photos, apply filters, add custom frames, and share with your friends!
            </p>
          </div>
          <PhotoBooth />
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

