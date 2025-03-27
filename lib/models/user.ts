export interface User {
  _id?: string
  name: string
  email: string
  password: string
  phone: string
  location: string
  userType: UserType
  createdAt?: Date
  updatedAt?: Date
}

export enum UserType {
  FARMER = "farmer",
  BUYER = "buyer",
  TRANSPORTER = "transporter",
  STORAGE_PROVIDER = "storage",
  COOPERATIVE = "cooperative",
}

