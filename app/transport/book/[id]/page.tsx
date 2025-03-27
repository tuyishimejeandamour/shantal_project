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
import { Loader2, Truck, MapPin, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function BookTransportPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transport, setTransport] = useState<any>(null)
  const [crops, setCrops] = useState<any[]>([])
  const [provider, setProvider] = useState<any>(null)

  const [formData, setFormData] = useState({
    crop: "",
    quantity: "",
    pickupLocation: "",
    deliveryLocation: "",
    distance: "",
    date: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch transport provider details
        const transportResponse = await fetch(`/api/transport/${params.id}`)
        if (!transportResponse.ok) {
          throw new Error("Failed to fetch transport provider details")
        }
        const transportData = await transportResponse.json()
        setTransport(transportData)

        // Fetch provider details
        if (transportData.provider) {
          const providerResponse = await fetch(`/api/users/${transportData.provider}`)
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
      if (
        !formData.crop ||
        !formData.quantity ||
        !formData.pickupLocation ||
        !formData.deliveryLocation ||
        !formData.distance ||
        !formData.date
      ) {
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

      // Check if quantity is within capacity
      if (quantity > transport.capacity) {
        setError(`Quantity exceeds vehicle capacity. Maximum capacity: ${transport.capacity} tons`)
        setSubmitting(false)
        return
      }

      // Check if distance is valid
      const distance = Number.parseFloat(formData.distance)
      if (isNaN(distance) || distance <= 0) {
        setError("Please enter a valid distance")
        setSubmitting(false)
        return
      }

      // Check if date is valid
      const bookingDate = new Date(formData.date)
      const today = new Date()

      if (bookingDate < today) {
        setError("Booking date cannot be in the past")
        setSubmitting(false)
        return
      }

      // Calculate total price
      const totalPrice = transport.pricePerKm * distance

      // Prepare data for API
      const bookingData = {
        transport: params.id,
        user: user?.id,
        crop: formData.crop,
        quantity: quantity,
        pickupLocation: formData.pickupLocation,
        deliveryLocation: formData.deliveryLocation,
        distance: distance,
        date: bookingDate,
        totalPrice: Math.round(totalPrice),
        status: "pending",
      }

      // Send data to API
      const response = await fetch("/api/bookings/transport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to book transport")
      }

      // Show success message
      toast({
        title: "Success!",
        description: "Your transport booking has been submitted.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      console.error("Error booking transport:", err)
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
          <p className="text-sm text-muted-foreground">Loading transport provider details...</p>
        </div>
      </div>
    )
  }

  if (!transport) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>Transport provider not found</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/transport")}>
          Back to Transport Providers
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Book Transport Service</CardTitle>
          <CardDescription>Arrange transportation for your crops</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{transport.name}</h3>
              <Badge
                variant="outline"
                className={transport.availability === "Available" ? "bg-green-50" : "bg-amber-50"}
              >
                {transport.availability}
              </Badge>
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Location: {transport.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>
                  {transport.vehicleType} - {transport.capacity} Tons
                </span>
              </div>
              {provider && (
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground">Provider: {provider.name}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Price:</span>
                <span className="font-medium">{transport.pricePerKm} RWF/km</span>
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
                  <p>You don't have any available crops to transport.</p>
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
                max={transport.capacity}
                step="0.1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">Maximum capacity: {transport.capacity} tons</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryLocation">Delivery Location</Label>
                <Input
                  id="deliveryLocation"
                  name="deliveryLocation"
                  value={formData.deliveryLocation}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (km)</Label>
                <Input
                  id="distance"
                  name="distance"
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.distance}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Transport Date</Label>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="rounded-md bg-muted p-4">
              <h4 className="font-medium">Booking Summary</h4>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Transport Provider:</span>
                  <span>{transport.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vehicle:</span>
                  <span>
                    {transport.vehicleType} ({transport.capacity} tons)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Rate:</span>
                  <span>{transport.pricePerKm} RWF/km</span>
                </div>
                {formData.distance && formData.quantity && (
                  <>
                    <div className="flex justify-between">
                      <span>Distance:</span>
                      <span>{formData.distance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span>{formData.quantity} tons</span>
                    </div>
                    <div className="flex justify-between font-medium pt-1 border-t mt-1">
                      <span>Estimated Total:</span>
                      <span>{Math.round(transport.pricePerKm * Number.parseFloat(formData.distance))} RWF</span>
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
            disabled={submitting || crops.length === 0 || transport.availability !== "Available"}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking Transport...
              </>
            ) : (
              "Book Transport"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

