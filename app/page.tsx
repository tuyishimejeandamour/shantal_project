import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Leaf, Truck, Store, Users } from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50 to-white py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Reducing Post-Harvest Losses in Rwanda
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Connect with storage facilities, transport providers, and buyers to ensure your crops reach the market
                  efficiently.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/agriculture products.jpg?height=400&width=600"
                alt="Rwandan farmers"
                width={600}
                height={400}
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Our platform connects all stakeholders in the agricultural value chain to reduce post-harvest losses.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
            <Card className="flex flex-col items-center text-center">
              <CardHeader>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <Leaf className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="mt-4">Farmers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Register your crops and connect with storage facilities, transporters, and buyers.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center text-center">
              <CardHeader>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                  <Store className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="mt-4">Storage Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>List your storage facilities and help farmers preserve their crops.</CardDescription>
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center text-center">
              <CardHeader>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                  <Truck className="h-10 w-10 text-amber-600" />
                </div>
                <CardTitle className="mt-4">Transporters</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Offer your transport services to move crops from farms to storage or markets.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center text-center">
              <CardHeader>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                  <Users className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="mt-4">Buyers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Find and purchase quality crops directly from farmers.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-50 py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Making an Impact</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Reducing post-harvest losses and improving farmers' livelihoods in Rwanda.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
              <div className="text-4xl font-bold text-green-600">30%</div>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Post-harvest losses in some agricultural value chains in Rwanda
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
              <div className="text-4xl font-bold text-green-600">1000+</div>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Farmers already connected to markets through our platform
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
              <div className="text-4xl font-bold text-green-600">15%</div>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Average increase in farmer income through reduced losses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join Our Platform Today</h2>
              <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Be part of the solution to reduce post-harvest losses in Rwanda.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                  Register Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

