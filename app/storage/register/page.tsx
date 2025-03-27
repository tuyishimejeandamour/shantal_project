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
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Warehouse } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"

// Features that can be selected for storage facilities
const STORAGE_FEATURES = [
  { id: "climate-control", label: "Climate Control" },
  { id: "security", label: "Security" },
  { id: "pest-control", label: "Pest Control" },
  { id: "loading-equipment", label: "Loading Equipment" },
  { id: "monitoring", label: "24/7 Monitoring" },
  { id: "fire-protection", label: "Fire Protection" },
]

export default function RegisterStoragePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    pricePerTon: "",
    description: "",
    features: [] as string[],
    image: "", // For storing Base64 image
  })

  // Redirect if user is not a storage provider
  if (user && user.userType !== "storage") {
    router.push("/dashboard")
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
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
      if (!formData.name || !formData.location || !formData.capacity || !formData.pricePerTon) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      // Prepare data for API
      const storageData = {
        name: formData.name,
        provider: user?.id,
        location: formData.location,
        capacity: Number.parseFloat(formData.capacity),
        pricePerTon: Number.parseFloat(formData.pricePerTon),
        features: formData.features,
        description: formData.description,
        image: formData.image,
      }

      // Send data to API
      const response = await fetch("/api/storage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storageData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to register storage facility")
      }

      // Show success message
      toast({
        title: "Success!",
        description: "Your storage facility has been registered.",
      })

      // Redirect to dashboard
      router.push("/dashboard/storage-provider")
    } catch (err) {
      console.error("Error registering storage:", err)
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
            <Warehouse className="h-6 w-6 text-green-600" />
            <CardTitle>Register Storage Facility</CardTitle>
          </div>
          <CardDescription>List your storage facility for farmers to find and book</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Facility Image</Label>
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                currentImage={formData.image}
              />
              <p className="text-xs text-muted-foreground">
                Upload an image of your storage facility to help farmers make informed decisions
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Facility Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} required />
              <p className="text-xs text-muted-foreground">
                Specify the district and sector where your facility is located
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capacity">Total Capacity (Tons)</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerTon">Price per Ton (RWF/month)</Label>
                <Input
                  id="pricePerTon"
                  name="pricePerTon"
                  type="number"
                  min="1"
                  step="100"
                  value={formData.pricePerTon}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="grid grid-cols-2 gap-2">
                {STORAGE_FEATURES.map((feature) => (
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
                placeholder="Provide details about your storage facility, such as type of structure, age, special features, etc."
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
                  Registering Facility...
                </>
              ) : (
                "Register Facility"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

