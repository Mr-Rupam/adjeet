// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
import { LEAD_DEADLINES } from '@/lib/lead-deadline'
const connect = vi.hoisted(() => vi.fn())
const constructed = vi.hoisted(() => [] as { serverSelectionTimeoutMS?: number; connectTimeoutMS?: number }[])
vi.mock('mongodb', () => ({
  MongoClient: class {
    connect = connect
    constructor(_uri: string, options: { serverSelectionTimeoutMS?: number }) { constructed.push(options) }
  },
  ServerApiVersion: { v1: '1' },
}))
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); connect.mockReset(); constructed.length = 0 })

it('allows a new connection after a cached connection rejects', async () => {
  vi.stubEnv('NODE_ENV', 'test')
  vi.stubEnv('MONGODB_URI', 'mongodb://example.test/test')
  connect.mockRejectedValueOnce(new Error('temporary outage')).mockResolvedValueOnce({ connected: true })
  const { default: getClient } = await import('@/lib/mongodb')
  await expect(getClient()).rejects.toThrow('temporary outage')
  await expect(getClient()).resolves.toEqual({ connected: true })
  expect(connect).toHaveBeenCalledTimes(2)
})

it('gives a cold connection the whole Mongo share of the lead deadline, and no more', async () => {
  vi.stubEnv('MONGODB_URI', 'mongodb://example.test/test')
  connect.mockResolvedValue({ connected: true })
  const { default: getClient } = await import('@/lib/mongodb')
  await getClient()
  expect(constructed[0].serverSelectionTimeoutMS).toBe(LEAD_DEADLINES.mongo)
  expect(constructed[0].connectTimeoutMS).toBe(LEAD_DEADLINES.mongo)
})
