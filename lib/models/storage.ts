export interface Storage {
  _id?: string
  name: string
  provider: string // User ID
  location: string
  capacity: number
  available: number
  pricePerTon: number
  features: string[]
  description?: string
  image?: string // Base64 encoded image
  createdAt?: Date
  updatedAt?: Date
}

export interface StorageBooking {
  _id?: string
  storage: string // Storage ID
  farmer: string // User ID
  crop: string // Crop ID
  quantity: number
  startDate: Date
  endDate: Date
  status: BookingStatus
  totalPrice: number
  createdAt?: Date
  updatedAt?: Date
}

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

