import { useEffect } from 'react'
import { useStockContext } from '@/hooks/useStockContext'

export function useStocks() {
  const {
    stocks,
    loading,
    error,
    lastUpdated,
    isFromCache,
    fetchStocks,
    refreshStocks,
    clearError
  } = useStockContext()

  // 自動載入數據
  useEffect(() => {
    if (stocks.length === 0 && !loading && !error) {
      fetchStocks()
    }
  }, [fetchStocks, stocks.length, loading, error])

  return {
    stocks,
    loading,
    error,
    lastUpdated,
    isFromCache,
    totalCount: stocks.length,
    refreshStocks,
    clearError
  }
}