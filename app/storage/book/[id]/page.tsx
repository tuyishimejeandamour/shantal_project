"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Warehouse, MapPin, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function BookStoragePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storage, setStorage] = useState<any>(null)
  const [crops, setCrops] = useState<any[]>([])
  const [provider, setProvider] = useState<any>(null)

  const [formData, setFormData] = useState({
    crop: "",
    quantity: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch storage facility details
        const storageResponse = await fetch(`/api/storage/${params.id}`)
        if (!storageResponse.ok) {
          throw new Error("Failed to fetch storage facility details")
        }
        const storageData = await storageResponse.json()
        setStorage(storageData)

        // Fetch provider details
        if (storageData.provider) {
          const providerResponse = await fetch(`/api/users/${storageData.provider}`)
          if (providerResponse.ok) {
            const providerData = await providerResponse.json()
            setProvider(providerData)
          }
        }

        // Fetch user's crops for selection
        if (user?.id) {
          const cropsResponse = await fetch(`/api/crops?farmer=${user.id}&status=available`)
          if (cropsResponse.ok) {
            const cropsData = await cropsResponse.json()
            setCrops(cropsData)
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, user?.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      // Validate form data
      if (!formData.crop || !formData.quantity || !formData.startDate || !formData.endDate) {
        setError("Please fill in all required fields")
        setSubmitting(false)
        return
      }

      // Check if quantity is valid
      const quantity = Number.parseFloat(formData.quantity)
      if (isNaN(quantity) || quantity <= 0) {
        setError("Please enter a valid quantity")
        setSubmitting(false)
        return
      }

      // Check if storage has enough capacity
      if (quantity > storage.available) {
        setError(`Not enough available capacity. Maximum available: ${storage.available} tons`)
        setSubmitting(false)
        return
      }

      // Check if dates are valid
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const today = new Date()

      if (startDate < today) {
        setError("Start date cannot be in the past")
        setSubmitting(false)
        return
      }

      if (endDate <= startDate) {
        setError("End date must be after start date")
        setSubmitting(false)
        return
      }

      // Calculate duration in days
      const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

      // Calculate total price
      const totalPrice = (storage.pricePerTon * quantity * durationInDays) / 30 // Price per month

      // Prepare data for API
      const bookingData = {
        storage: params.id,
        farmer: user?.id,
        crop: formData.crop,
        quantity: quantity,
        startDate: startDate,
        endDate: endDate,
        totalPrice: Math.round(totalPrice),
        status: "pending",
      }

      // Send data to API
      const response = await fetch("/api/bookings/storage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to book storage")
      }

      // Show success message
      toast({
        title: "Success!",
        description: "Your storage booking has been submitted.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      console.error("Error booking storage:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-muted-foreground">Loading storage facility details...</p>
        </div>
      </div>
    )
  }

  if (!storage) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>Storage facility not found</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/storage")}>
          Back to Storage Facilities
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Book Storage Facility</CardTitle>
          <CardDescription>Reserve storage space for your crops</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{storage.name}</h3>
              <Badge variant="outline" className="bg-blue-50">
                {storage.available} Tons Available
              </Badge>
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Location: {storage.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <Warehouse className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Total Capacity: {storage.capacity} Tons</span>
              </div>
              {provider && (
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground">Provider: {provider.name}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Price:</span>
                <span className="font-medium">{storage.pricePerTon} RWF/ton/month</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crop">Select Crop</Label>
              {crops.length > 0 ? (
                <Select value={formData.crop} onValueChange={(value) => handleSelectChange("crop", value)} required>
                  <SelectTrigger id="crop">
                    <SelectValue placeholder="Select a crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem key={crop._id} value={crop._id}>
                        {crop.name} - {crop.quantity} {crop.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-md border p-3 text-center text-sm text-muted-foreground">
                  <p>You don't have any available crops to store.</p>
                  <Button variant="link" className="mt-1 p-0 text-green-600" onClick={() => router.push("/crops/add")}>
                    Add a crop first
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Tons)</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0.1"
                max={storage.available}
                step="0.1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">Maximum available: {storage.available} tons</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md bg-muted p-4">
              <h4 className="font-medium">Booking Summary</h4>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Storage Facility:</span>
                  <span>{storage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate:</span>
                  <span>{storage.pricePerTon} RWF/ton/month</span>
                </div>
                {formData.quantity && formData.startDate && formData.endDate && (
                  <>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span>{formData.quantity} tons</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>
                        {Math.ceil(
                          (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        days
                      </span>
                    </div>
                    <div className="flex justify-between font-medium pt-1 border-t mt-1">
                      <span>Estimated Total:</span>
                      <span>
                        {Math.round(
                          (storage.pricePerTon *
                            Number.parseFloat(formData.quantity) *
                            Math.ceil(
                              (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
                                (1000 * 60 * 60 * 24),
                            )) /
                            30,
                        )}{" "}
                        RWF
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700"
            disabled={submitting || crops.length === 0}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking Storage...
              </>
            ) : (
              "Book Storage"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

