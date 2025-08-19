import { createContext, useContext, useState, useCallback, useMemo, type ReactNode, type JSX } from 'react'
import { stockApi } from '@/lib/api'
import { cache } from '@/lib/simpleCache'
import type { Stock } from '@/types/stock'

// Context 型別定義
export interface StockContextType {
  stocks: Stock[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  isFromCache: boolean
  fetchStocks: () => Promise<void>
  refreshStocks: () => Promise<void>
  clearError: () => void
  ensureStocksLoaded: () => Promise<Stock[]>
}

// eslint-disable-next-line react-refresh/only-export-components
export const StockContext = createContext<StockContextType | null>(null)

export function StockProvider({ children }: { children: ReactNode }): JSX.Element {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)

  // 單一路徑載入流程，供 fetch 與 ensure 共用
  const loadStocks = useCallback(async (
    options?: { skipCache?: boolean; onlyIfEmpty?: boolean }
  ): Promise<Stock[]> => {
    const { skipCache = false, onlyIfEmpty = false } = options || {}

    // 僅在需要時載入（ensure 模式）
    if (onlyIfEmpty && stocks.length > 0) {
      return stocks
    }

    // 若已在載入中，直接回傳現有資料避免重入
    if (loading) {
      return stocks
    }

    try {
      setLoading(true)
      setError(null)

      if (!skipCache) {
        const cachedData = cache.get<Stock[]>('stocks')
        if (cachedData) {
          setStocks(cachedData)
          const timestamp = cache.get<number>('stocks_timestamp')
          setLastUpdated(timestamp ? new Date(timestamp) : null)
          setIsFromCache(true)
          return cachedData
        }
      }

      const data = await stockApi.getAllStocks()
      setStocks(data)
      const now = Date.now()
      cache.set('stocks', data)
      cache.set('stocks_timestamp', now)
      setLastUpdated(new Date(now))
      setIsFromCache(false)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取股票資料失敗')
      throw err
    } finally {
      setLoading(false)
    }
  }, [stocks, loading])

  const fetchStocks = useCallback(async () => {
    await loadStocks({ skipCache: false, onlyIfEmpty: false })
  }, [loadStocks])

  const refreshStocks = useCallback(async () => {
    cache.delete('stocks')
    cache.delete('stocks_timestamp')
    await loadStocks({ skipCache: true, onlyIfEmpty: false })
  }, [loadStocks])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const ensureStocksLoaded = useCallback(async (): Promise<Stock[]> => {
    return loadStocks({ skipCache: false, onlyIfEmpty: true })
  }, [loadStocks])

  const contextValue = useMemo(() => ({
    stocks,
    loading,
    error,
    lastUpdated,
    isFromCache,
    fetchStocks,
    refreshStocks,
    clearError,
    ensureStocksLoaded
  }), [
    stocks,
    loading,
    error,
    lastUpdated,
    isFromCache,
    fetchStocks,
    refreshStocks,
    clearError,
    ensureStocksLoaded
  ])

  return (
    <StockContext.Provider value={contextValue}>
      {children}
    </StockContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStocks() {
  const context = useContext(StockContext)
  if (!context) {
    throw new Error('useStocks must be used within a StockProvider')
  }
  return context
}