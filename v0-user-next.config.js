/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    // Increase the API timeout to 60 seconds (default is 30)
    responseLimit: false,
    bodyParser: {
      sizeLimit: "10mb", // Increase the body size limit for image uploads
    },
  },
  // Increase serverless function timeout on Vercel
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
  // Add custom headers to help with debugging
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
          {
            key: "x-powered-by",
            value: "Post-Harvest Manager",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

