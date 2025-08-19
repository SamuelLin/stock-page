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

  const fetchStocks = useCallback(async (skipCache = false) => {
    if (loading) return
    
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
          setLoading(false)
          return
        }
      }

      const data = await stockApi.getAllStocks()
      setStocks(data)
      
      const now = Date.now()
      cache.set('stocks', data)
      cache.set('stocks_timestamp', now)
      setLastUpdated(new Date(now))
      setIsFromCache(false)

    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取股票資料失敗')
    } finally {
      setLoading(false)
    }
  }, [loading])

  const refreshStocks = useCallback(async () => {
    cache.delete('stocks')
    cache.delete('stocks_timestamp')
    await fetchStocks(true)
  }, [fetchStocks])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const ensureStocksLoaded = useCallback(async (): Promise<Stock[]> => {
    if (stocks.length === 0 && !loading) {
      try {
        setLoading(true)
        setError(null)

        const cachedData = cache.get<Stock[]>('stocks')
        if (cachedData) {
          setStocks(cachedData)
          const timestamp = cache.get<number>('stocks_timestamp')
          setLastUpdated(timestamp ? new Date(timestamp) : null)
          setIsFromCache(true)
          setLoading(false)
          return cachedData
        }

        const data = await stockApi.getAllStocks()
        setStocks(data)
        
        const now = Date.now()
        cache.set('stocks', data)
        cache.set('stocks_timestamp', now)
        setLastUpdated(new Date(now))
        setIsFromCache(false)
        setLoading(false)
        
        return data
      } catch (err) {
        setError(err instanceof Error ? err.message : '獲取股票資料失敗')
        setLoading(false)
        throw err
      }
    }
    return stocks
  }, [stocks, loading])

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