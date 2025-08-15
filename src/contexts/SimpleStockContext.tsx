import { useState, useCallback, ReactNode } from 'react'

import { stockApi } from '@/lib/api'
import { cache } from '@/lib/simpleCache'
import type { Stock } from '@/types/stock'
import { StockContext } from '@/contexts/StockContext'

export function StockProvider({ children }: { children: ReactNode }) {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const isFromCache = cache.has('stocks')

  const fetchStocks = useCallback(async (skipCache = false) => {
    try {
      setLoading(true)
      setError(null)

      // 檢查快取
      if (!skipCache) {
        const cachedData = cache.get<Stock[]>('stocks')
        if (cachedData) {
          setStocks(cachedData)
          const timestamp = cache.get<number>('stocks_timestamp')
          setLastUpdated(timestamp ? new Date(timestamp) : null)
          setLoading(false)
          return
        }
      }

      // 從 API 獲取
      const data = await stockApi.getAllStocks()
      setStocks(data)
      
      // 存入快取
      const now = Date.now()
      cache.set('stocks', data)
      cache.set('stocks_timestamp', now)
      setLastUpdated(new Date(now))

    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取股票資料失敗')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshStocks = useCallback(async () => {
    cache.delete('stocks')
    cache.delete('stocks_timestamp')
    await fetchStocks(true)
  }, [fetchStocks])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <StockContext.Provider value={{
      stocks,
      loading,
      error,
      lastUpdated,
      isFromCache,
      fetchStocks,
      refreshStocks,
      clearError
    }}>
      {children}
    </StockContext.Provider>
  )
}

