export interface Transport {
  _id?: string
  name: string
  provider: string // User ID
  location: string
  vehicleType: string
  capacity: number
  pricePerKm: number
  features: string[]
  availability: string
  description?: string
  image?: string // Base64 encoded image
  createdAt?: Date
  updatedAt?: Date
}

export interface TransportBooking {
  _id?: string
  transport: string // Transport ID
  user: string // User ID
  crop: string // Crop ID
  pickupLocation: string
  deliveryLocation: string
  distance: number
  quantity: number
  date: Date
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

