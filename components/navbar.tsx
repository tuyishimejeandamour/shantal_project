"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Toggle Menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                  Home
                </Link>
                {isAuthenticated && (
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                    Dashboard
                  </Link>
                )}
                <Link href="/marketplace" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                  Marketplace
                </Link>
                <Link href="/storage" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                  Storage
                </Link>
                <Link href="/transport" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                  Transport
                </Link>
                <Link href="/about" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                  About
                </Link>
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-2 text-lg font-medium text-red-500"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">PHM</span>
          </Link>
        </div>
        <nav className="hidden lg:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium">
            Home
          </Link>
          {isAuthenticated && (
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
          )}
          <Link href="/marketplace" className="text-sm font-medium">
            Marketplace
          </Link>
          <Link href="/storage" className="text-sm font-medium">
            Storage
          </Link>
          <Link href="/transport" className="text-sm font-medium">
            Transport
          </Link>
          <Link href="/about" className="text-sm font-medium">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user?.name?.split(" ")[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Register
                </Button>
              </Link>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

