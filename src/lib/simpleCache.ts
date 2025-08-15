// 簡單的記憶體快取
interface CacheItem<T> {
  data: T
  timestamp: number
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly TTL = 5 * 60 * 1000 // 5分鐘

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    // 檢查是否過期
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

export const cache = new SimpleCache()