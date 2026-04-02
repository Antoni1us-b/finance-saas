/**
 * Simple in-memory cache สำหรับลด API calls ที่ซ้ำซ้อน
 * ข้อมูลถูก cache ไว้ TTL วินาที จากนั้น fetch ใหม่อัตโนมัติ
 */

interface CacheEntry<T> {
  data: T
  expiry: number
}

const store = new Map<string, CacheEntry<unknown>>()

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiry) { store.delete(key); return null }
  return entry.data as T
}

export function cacheSet<T>(key: string, data: T, ttlSeconds = 30): void {
  store.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 })
}

export function cacheClear(keyPrefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) store.delete(key)
  }
}

export function cacheInvalidate(key: string): void {
  store.delete(key)
}
