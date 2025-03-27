export interface Crop {
  _id?: string
  name: string
  farmer: string // User ID
  location: string
  quantity: number
  unit: string
  price: number
  quality: string
  harvestDate: Date
  description?: string
  image?: string // Base64 encoded image
  status: CropStatus
  createdAt?: Date
  updatedAt?: Date
}

export enum CropStatus {
  AVAILABLE = "available",
  RESERVED = "reserved",
  SOLD = "sold",
}

