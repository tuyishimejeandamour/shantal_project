import { MongoClient } from "mongodb"
import { logger } from "@/lib/logger"

if (!process.env.MONGODB_URI) {
  logger.error("Missing MONGODB_URI environment variable")
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10, // Increase connection pool size
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    logger.info("Creating new MongoDB client connection in development mode")
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client
      .connect()
      .then((client) => {
        logger.info("MongoDB connected successfully in development mode")
        return client
      })
      .catch((err) => {
        logger.error("Failed to connect to MongoDB in development mode", err)
        throw err
      })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  logger.info("Creating new MongoDB client connection in production mode")
  client = new MongoClient(uri, options)
  clientPromise = client
    .connect()
    .then((client) => {
      logger.info("MongoDB connected successfully in production mode")
      return client
    })
    .catch((err) => {
      logger.error("Failed to connect to MongoDB in production mode", err)
      throw err
    })
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

