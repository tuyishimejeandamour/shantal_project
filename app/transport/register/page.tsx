"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Truck } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"

// Features that can be selected for transport vehicles
const TRANSPORT_FEATURES = [
  { id: "refrigerated", label: "Refrigerated" },
  { id: "gps-tracking", label: "GPS Tracking" },
  { id: "covered", label: "Covered" },
  { id: "hydraulic-lift", label: "Hydraulic Lift" },
  { id: "insulated", label: "Insulated" },
]

// Vehicle types
const VEHICLE_TYPES = [
  { id: "truck", label: "Truck" },
  { id: "pickup", label: "Pickup" },
  { id: "van", label: "Van" },
  { id: "lorry", label: "Lorry" },
]

export default function RegisterTransportPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    vehicleType: "",
    capacity: "",
    pricePerKm: "",
    location: "",
    description: "",
    features: [] as string[],
    image: "", // For storing Base64 image
  })

  // Redirect if user is not a transporter
  if (user && user.userType !== "transporter") {
    router.push("/dashboard")
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFeatureToggle = (featureId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: checked ? [...prev.features, featureId] : prev.features.filter((id) => id !== featureId),
    }))
  }

  const handleImageUpload = (base64Image: string) => {
    setFormData((prev) => ({ ...prev, image: base64Image }))
  }

  const handleImageRemove = () => {
    setFormData((prev) => ({ ...prev, image: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate form data
      if (!formData.name || !formData.vehicleType || !formData.capacity || !formData.pricePerKm || !formData.location) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      // Prepare data for API
      const transportData = {
        name: formData.name,
        provider: user?.id,
        vehicleType: formData.vehicleType,
        capacity: Number.parseFloat(formData.capacity),
        pricePerKm: Number.parseFloat(formData.pricePerKm),
        location: formData.location,
        features: formData.features,
        description: formData.description,
        image: formData.image,
        availability: "Available",
      }

      // Send data to API
      const response = await fetch("/api/transport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transportData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to register transport vehicle")
      }

      // Show success message
      toast({
        title: "Success!",
        description: "Your transport vehicle has been registered.",
      })

      // Redirect to dashboard
      router.push("/dashboard/transporter")
    } catch (err) {
      console.error("Error registering transport:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-green-600" />
            <CardTitle>Register Transport Vehicle</CardTitle>
          </div>
          <CardDescription>List your transport vehicle for farmers to find and book</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Vehicle Image</Label>
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                currentImage={formData.image}
              />
              <p className="text-xs text-muted-foreground">
                Upload an image of your vehicle to help farmers make informed decisions
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Kigali Express Transport"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) => handleSelectChange("vehicleType", value)}
                  required
                >
                  <SelectTrigger id="vehicleType">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (Tons)</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pricePerKm">Price per Km (RWF)</Label>
                <Input
                  id="pricePerKm"
                  name="pricePerKm"
                  type="number"
                  min="1"
                  step="10"
                  value={formData.pricePerKm}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Base Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Kigali, Huye"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="grid grid-cols-2 gap-2">
                {TRANSPORT_FEATURES.map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature.id}
                      checked={formData.features.includes(feature.id)}
                      onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked as boolean)}
                    />
                    <label
                      htmlFor={feature.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {feature.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Provide details about your vehicle, such as make, model, year, condition, etc."
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering Vehicle...
                </>
              ) : (
                "Register Vehicle"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

