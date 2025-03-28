// Storage utility for managing photos
const STORAGE_KEY = 'snaptogether_photos'

export interface SavedPhoto {
  id: string
  imageUrl: string
  timestamp: number
}

export function savePhoto(imageUrl: string): SavedPhoto {
  const photo: SavedPhoto = {
    id: Date.now().toString(),
    imageUrl,
    timestamp: Date.now()
  }
  
  // Get existing photos
  const existingPhotos = getPhotos()
  
  // Add new photo
  const updatedPhotos = [photo, ...existingPhotos]
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPhotos))
  
  return photo
}

export function getPhotos(): SavedPhoto[] {
  try {
    const photosJson = localStorage.getItem(STORAGE_KEY)
    return photosJson ? JSON.parse(photosJson) : []
  } catch (error) {
    console.error('Error loading photos:', error)
    return []
  }
}

export function deletePhoto(id: string): void {
  const photos = getPhotos()
  const updatedPhotos = photos.filter(photo => photo.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPhotos))
} 