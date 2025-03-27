import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
        <div className="flex flex-col gap-2">
          <Link href="/" className="text-xl font-bold">
            Post-Harvest Manager
          </Link>
          <p className="text-sm text-muted-foreground">
            Connecting farmers with storage, transport, and buyers to reduce post-harvest losses in Rwanda.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:gap-6">
          <Link href="/about" className="text-sm font-medium">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium">
            Contact
          </Link>
          <Link href="/privacy" className="text-sm font-medium">
            Privacy
          </Link>
          <Link href="/terms" className="text-sm font-medium">
            Terms
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Post-Harvest Manager. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

