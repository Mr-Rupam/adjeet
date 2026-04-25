import { MongoClient, ServerApiVersion } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
}

let clientPromise: Promise<MongoClient> | null = null

/**
 * Returns a lazily-initialised MongoDB client promise.
 *
 * In development, the promise is cached on `globalThis` to survive HMR reloads.
 * In production, it is cached in a module-level variable.
 *
 * Throws at connection time (not module-load time) if MONGODB_URI is missing
 * in production, so `next build` can complete without the env var.
 */
export default function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      return Promise.reject(new Error('MONGODB_URI must be set in production'))
    }
    console.warn('[mongodb] Missing MONGODB_URI — using localhost fallback')
    const fallback = new MongoClient('mongodb://localhost:27017/fallback', options)
    clientPromise = fallback.connect()
    return clientPromise
  }

  if (process.env.NODE_ENV === 'development') {
    const g = global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> }
    if (!g._mongoClientPromise) {
      g._mongoClientPromise = new MongoClient(uri, options).connect()
    }
    clientPromise = g._mongoClientPromise
    return clientPromise
  }

  clientPromise = new MongoClient(uri, options).connect()
  return clientPromise
}
