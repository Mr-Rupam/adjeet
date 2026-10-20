import { MongoClient, ServerApiVersion } from 'mongodb'
import { LEAD_DEADLINES } from '@/lib/lead-deadline'

// A cold TLS connection to Atlas can take a few round trips. Give it the
// lead route's whole Mongo share, and no longer, since Sheets runs alongside.
const options = {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  connectTimeoutMS: LEAD_DEADLINES.mongo,
  serverSelectionTimeoutMS: LEAD_DEADLINES.mongo,
}
let clientPromise: Promise<MongoClient> | null = null

/** Share connections, but never cache a rejected connection forever. */
export default function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise
  const uri = process.env.MONGODB_URI
  if (!uri) return Promise.reject(new Error('MONGODB_URI must be configured'))
  const g = globalThis as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> }
  const development = process.env.NODE_ENV === 'development'
  if (development && g._mongoClientPromise) {
    clientPromise = g._mongoClientPromise
    return clientPromise
  }
  const client = new MongoClient(uri, options)
  const pending = client.connect().catch(error => {
    if (clientPromise === pending) clientPromise = null
    if (g._mongoClientPromise === pending) delete g._mongoClientPromise
    // The driver can own sockets even after server selection fails.
    void client.close?.().catch(() => {})
    throw error
  })
  clientPromise = pending
  if (development) g._mongoClientPromise = pending
  return pending
}
