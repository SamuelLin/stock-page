// 快取配置
const CACHE_CONFIG = {
  // 股票數據快取 5 分鐘（股市數據變化頻繁）
  STOCK_DATA_TTL: 5 * 60 * 1000,
  // 最大快取項目數量
  MAX_CACHE_SIZE: 100,
  // 本地存儲鍵前綴
  STORAGE_PREFIX: 'stock_app_cache_'
} as const

// 快取項目介面
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

// 記憶體快取類
class MemoryCache {
  private cache = new Map<string, CacheItem<unknown>>()

  set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.STOCK_DATA_TTL): void {
    // 如果快取大小超過限制，清除最舊的項目
    if (this.cache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // 檢查是否過期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // 清除過期的快取項目
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// 本地存儲快取類
class PersistentCache {
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.STOCK_DATA_TTL): void {
    if (!this.isLocalStorageAvailable()) {
      return
    }

    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl
      }
      
      localStorage.setItem(
        CACHE_CONFIG.STORAGE_PREFIX + key,
        JSON.stringify(item)
      )
    } catch (error) {
      console.warn('無法將數據存入本地存儲:', error)
    }
  }

  get<T>(key: string): T | null {
    if (!this.isLocalStorageAvailable()) {
      return null
    }

    try {
      const stored = localStorage.getItem(CACHE_CONFIG.STORAGE_PREFIX + key)
      if (!stored) {
        return null
      }

      const item: CacheItem<T> = JSON.parse(stored)
      
      // 檢查是否過期
      if (Date.now() - item.timestamp > item.ttl) {
        this.delete(key)
        return null
      }

      return item.data as T
    } catch (error) {
      console.warn('無法從本地存儲讀取數據:', error)
      this.delete(key)
      return null
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    if (!this.isLocalStorageAvailable()) {
      return false
    }

    try {
      localStorage.removeItem(CACHE_CONFIG.STORAGE_PREFIX + key)
      return true
    } catch {
      return false
    }
  }

  clear(): void {
    if (!this.isLocalStorageAvailable()) {
      return
    }

    try {
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith(CACHE_CONFIG.STORAGE_PREFIX)
      )
      
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('無法清除本地存儲快取:', error)
    }
  }

  // 清除過期的本地存儲項目
  cleanup(): void {
    if (!this.isLocalStorageAvailable()) {
      return
    }

    try {
      const now = Date.now()
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith(CACHE_CONFIG.STORAGE_PREFIX)
      )

      keys.forEach(key => {
        try {
          const stored = localStorage.getItem(key)
          if (stored) {
            const item = JSON.parse(stored)
            if (now - item.timestamp > item.ttl) {
              localStorage.removeItem(key)
            }
          }
        } catch {
          // 如果解析失敗，直接刪除該項目
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('無法清除過期的本地存儲項目:', error)
    }
  }
}

// 多層級快取管理器
class CacheManager {
  private memoryCache = new MemoryCache()
  private persistentCache = new PersistentCache()

  set<T>(key: string, data: T, ttl?: number): void {
    this.memoryCache.set(key, data, ttl)
    this.persistentCache.set(key, data, ttl)
  }

  get<T>(key: string): T | null {
    // 首先嘗試從記憶體快取獲取
    let data = this.memoryCache.get<T>(key)
    
    if (data !== null) {
      return data
    }

    // 如果記憶體快取沒有，嘗試從本地存儲獲取
    data = this.persistentCache.get<T>(key)
    
    if (data !== null) {
      // 將數據重新加入記憶體快取
      this.memoryCache.set(key, data)
      return data
    }

    return null
  }

  has(key: string): boolean {
    return this.memoryCache.has(key) || this.persistentCache.has(key)
  }

  delete(key: string): boolean {
    const memoryDeleted = this.memoryCache.delete(key)
    const persistentDeleted = this.persistentCache.delete(key)
    return memoryDeleted || persistentDeleted
  }

  clear(): void {
    this.memoryCache.clear()
    this.persistentCache.clear()
  }

  cleanup(): void {
    this.memoryCache.cleanup()
    this.persistentCache.cleanup()
  }
}

// 導出單例快取管理器
export const cacheManager = new CacheManager()

// 股票數據專用快取鍵
export const CACHE_KEYS = {
  ALL_STOCKS: 'all_stocks',
  SEARCH_RESULTS: (query: string) => `search_${query}`,
  STOCK_BY_CODE: (code: string) => `stock_${code}`,
} as const

// 定期清理快取（每10分鐘）
setInterval(() => {
  cacheManager.cleanup()
}, 10 * 60 * 1000)