import { useCallback, useEffect, useMemo } from 'react'

import type { Stock } from '@/types/stock'
import { useApi, type ApiError } from '@/contexts/ApiContext'
import { stockApi } from '@/lib/api'
import { cacheManager, CACHE_KEYS } from '@/lib/cache'

// Hook 返回類型定義
export interface UseStocksReturn {
  // 數據
  stocks: Stock[]
  loading: boolean
  error: ApiError | null
  
  // 操作方法
  fetchStocks: () => Promise<void>
  refreshStocks: () => Promise<void>
  clearError: () => void
  
  // 元數據
  lastUpdated: Date | null
  isFromCache: boolean
  totalCount: number
}

/**
 * 股票數據管理 Hook (使用 axios 和 Context)
 */
export function useStocks(): UseStocksReturn {
  const { makeRequest, clearError: clearApiError, isLoading, getError, getData } = useApi()
  
  const API_KEY = 'stocks'

  // 獲取狀態
  const stocks = getData<Stock[]>(API_KEY) || []
  const loading = isLoading(API_KEY)
  const error = getError(API_KEY)

  // 檢查是否來自快取
  const isFromCache = useMemo(() => {
    return cacheManager.has(CACHE_KEYS.ALL_STOCKS)
  }, [])

  // 最後更新時間（從快取或當前時間獲取）
  const lastUpdated = useMemo(() => {
    if (stocks.length === 0) return null
    
    // 嘗試從快取獲取時間戳
    const cachedTimestamp = cacheManager.get<number>(`${CACHE_KEYS.ALL_STOCKS}_timestamp`)
    return cachedTimestamp ? new Date(cachedTimestamp) : new Date()
  }, [stocks.length])

  // 獲取股票數據
  const fetchStocks = useCallback(async (skipCache = false) => {
    try {
      await makeRequest(
        API_KEY,
        async () => {
          // 如果不跳過快取，先檢查快取
          if (!skipCache) {
            const cachedData = cacheManager.get<Stock[]>(CACHE_KEYS.ALL_STOCKS)
            if (cachedData) {
              console.log('使用快取的股票資料')
              return cachedData
            }
          }

          // 從 API 獲取數據
          console.log('從 API 獲取股票資料')
          const freshData = await stockApi.getAllStocks()
          
          // 存入快取並記錄時間戳
          cacheManager.set(CACHE_KEYS.ALL_STOCKS, freshData)
          cacheManager.set(`${CACHE_KEYS.ALL_STOCKS}_timestamp`, Date.now())
          
          return freshData
        },
        { skipCache }
      )
    } catch (error) {
      console.error('獲取股票數據失敗:', error)
      // 錯誤已經由 Context 處理，這裡不需要額外處理
    }
  }, [makeRequest])

  // 強制重新整理
  const refreshStocks = useCallback(async () => {
    // 清除快取並重新獲取
    cacheManager.delete(CACHE_KEYS.ALL_STOCKS)
    await fetchStocks(true)
  }, [fetchStocks])

  // 清除錯誤
  const clearError = useCallback(() => {
    clearApiError(API_KEY)
  }, [clearApiError])

  // 組件掛載時獲取數據
  useEffect(() => {
    if (stocks.length === 0 && !loading && !error) {
      fetchStocks()
    }
  }, [fetchStocks, stocks.length, loading, error])

  return {
    stocks,
    loading,
    error,
    fetchStocks,
    refreshStocks,
    clearError,
    lastUpdated,
    isFromCache,
    totalCount: stocks.length
  }
}

/**
 * 股票搜尋 Hook (使用 axios 和 Context)
 */
export interface UseStockSearchReturn {
  stocks: Stock[]
  loading: boolean
  error: ApiError | null
  lastUpdated: Date | null
  isFromCache: boolean
  totalCount: number
  filteredCount: number
  searchQuery: string
  setSearchQuery: (query: string) => void
  clearError: () => void
}

export function useStockSearch(initialQuery = ''): UseStockSearchReturn {
  const { stocks, loading, error, lastUpdated, isFromCache, clearError, totalCount } = useStocks()
  
  // 搜尋邏輯
  const { filteredStocks, searchQuery, setSearchQuery } = useStockFilter(stocks, initialQuery)

  return {
    stocks: filteredStocks,
    loading,
    error,
    lastUpdated,
    isFromCache,
    totalCount,
    filteredCount: filteredStocks.length,
    searchQuery,
    setSearchQuery,
    clearError
  }
}

/**
 * 股票過濾 Hook
 */
export function useStockFilter(stocks: Stock[], initialQuery = '') {
  
  const filteredStocks = useMemo(() => {
    if (!initialQuery.trim()) {
      return stocks
    }

    const query = initialQuery.toLowerCase().trim()
    return stocks.filter(stock =>
      stock.Code.toLowerCase().includes(query) ||
      stock.Name.toLowerCase().includes(query)
    )
  }, [stocks, initialQuery])

  const setSearchQuery = useCallback((newQuery: string) => {
    // 這裡可以添加搜尋歷史記錄等邏輯
    // 目前只提供基本的 setter 功能
    console.log('搜尋查詢更新:', newQuery)
  }, [])

  return {
    filteredStocks,
    searchQuery: initialQuery,
    setSearchQuery
  }
}

/**
 * 單一股票數據 Hook
 */
export interface UseStockReturn {
  stock: Stock | null
  loading: boolean
  error: ApiError | null
  refetch: () => Promise<void>
  clearError: () => void
}

export function useStock(code: string): UseStockReturn {
  const { makeRequest, clearError: clearApiError, isLoading, getError, getData } = useApi()
  
  const API_KEY = `stock_${code}`

  // 獲取狀態
  const stock = getData<Stock>(API_KEY)
  const loading = isLoading(API_KEY)
  const error = getError(API_KEY)

  // 獲取單一股票數據
  const fetchStock = useCallback(async () => {
    if (!code.trim()) return

    try {
      await makeRequest(
        API_KEY,
        async () => {
          // 檢查快取
          const cacheKey = CACHE_KEYS.STOCK_BY_CODE(code)
          const cachedData = cacheManager.get<Stock>(cacheKey)
          
          if (cachedData) {
            return cachedData
          }

          // 從服務獲取
          const allStocks = await stockApi.getAllStocks()
          const stockData = allStocks.find(stock => stock.Code === code)
          
          if (!stockData) {
            throw new Error(`找不到股票代號 ${code}`)
          }

          // 存入快取
          cacheManager.set(cacheKey, stockData)
          
          return stockData
        }
      )
    } catch (error) {
      console.error(`獲取股票 ${code} 資料失敗:`, error)
    }
  }, [code, makeRequest, API_KEY])

  // 清除錯誤
  const clearError = useCallback(() => {
    clearApiError(API_KEY)
  }, [clearApiError, API_KEY])

  // 自動獲取數據
  useEffect(() => {
    if (code && !stock && !loading && !error) {
      fetchStock()
    }
  }, [code, stock, loading, error, fetchStock])

  return {
    stock,
    loading,
    error,
    refetch: fetchStock,
    clearError
  }
}

/**
 * 熱門股票 Hook
 */
export function useTopStocks(type: 'volume' | 'gainers' | 'losers', limit = 10) {
  const { makeRequest, isLoading, getError, getData, clearError } = useApi()
  
  const API_KEY = `top_${type}_${limit}`

  const stocks = getData<Stock[]>(API_KEY) || []
  const loading = isLoading(API_KEY)
  const error = getError(API_KEY)

  const fetchTopStocks = useCallback(async () => {
    try {
      await makeRequest(API_KEY, async () => {
        const allStocks = await stockApi.getAllStocks()
        
        switch (type) {
          case 'volume':
            return allStocks
              .filter(stock => stock.TradeVolume && !isNaN(parseFloat(stock.TradeVolume)))
              .sort((a, b) => parseFloat(b.TradeVolume) - parseFloat(a.TradeVolume))
              .slice(0, limit)
          case 'gainers':
            return allStocks
              .filter(stock => stock.Change && !isNaN(parseFloat(stock.Change)))
              .sort((a, b) => parseFloat(b.Change) - parseFloat(a.Change))
              .slice(0, limit)
          case 'losers':
            return allStocks
              .filter(stock => stock.Change && !isNaN(parseFloat(stock.Change)))
              .sort((a, b) => parseFloat(a.Change) - parseFloat(b.Change))
              .slice(0, limit)
          default:
            throw new Error(`不支持的類型: ${type}`)
        }
      })
    } catch (error) {
      console.error(`獲取 ${type} 股票失敗:`, error)
    }
  }, [type, limit, makeRequest, API_KEY])

  useEffect(() => {
    if (stocks.length === 0 && !loading && !error) {
      fetchTopStocks()
    }
  }, [fetchTopStocks, stocks.length, loading, error])

  return {
    stocks,
    loading,
    error,
    refetch: fetchTopStocks,
    clearError: () => clearError(API_KEY)
  }
}
