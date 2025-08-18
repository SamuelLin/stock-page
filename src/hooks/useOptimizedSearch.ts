import { useState, useCallback, useRef, useEffect } from 'react'
import type { Stock } from '@/types/stock'

const searchCache = new Map<string, Stock[]>()

function filterStocks(stocks: Stock[], query: string): Stock[] {
  if (!query.trim()) return []
  
  const normalizedQuery = query.toLowerCase()
  
  const cacheKey = `${normalizedQuery}-${stocks.length}`
  const cachedResult = searchCache.get(cacheKey)
  if (cachedResult) {
    return cachedResult
  }

  const results: Stock[] = []
  const maxResults = 100

  for (let i = 0; i < stocks.length && results.length < maxResults; i++) {
    const stock = stocks[i]
    
    if (stock.code.toLowerCase() === normalizedQuery) {
      results.unshift(stock)
      continue
    }
    
    if (stock.code.toLowerCase().startsWith(normalizedQuery)) {
      results.push(stock)
      continue
    }
    
    if (stock.code.toLowerCase().includes(normalizedQuery)) {
      results.push(stock)
      continue
    }
    if (stock.name.toLowerCase().includes(normalizedQuery)) {
      results.push(stock)
    }
  }

  if (searchCache.size > 50) {
    const firstKey = searchCache.keys().next().value
    if (firstKey) {
      searchCache.delete(firstKey)
    }
  }
  searchCache.set(cacheKey, results)

  return results
}

export function useOptimizedSearch(stocks: Stock[]) {
  const [isSearching, setIsSearching] = useState(false)
  const [currentQuery, setCurrentQuery] = useState('')
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([])
  
  const stocksRef = useRef(stocks)
  useEffect(() => {
    stocksRef.current = stocks
  }, [stocks])

  const executeSearch = useCallback((query: string, searchStocks?: Stock[]) => {
    if (!query.trim()) {
      setFilteredStocks([])
      setCurrentQuery('')
      return
    }

    setIsSearching(true)
    setCurrentQuery(query)

    const stocksToSearch = searchStocks || stocksRef.current
    setTimeout(() => {
      const results = filterStocks(stocksToSearch, query)
      setFilteredStocks(results)
      setIsSearching(false)
    }, 0)
  }, [])
  const clearSearch = useCallback(() => {
    setFilteredStocks([])
    setCurrentQuery('')
    setIsSearching(false)
  }, [])
  const clearCache = useCallback(() => {
    searchCache.clear()
  }, [])

  return {
    filteredStocks,
    isSearching,
    currentQuery,
    executeSearch,
    clearSearch,
    clearCache
  }
}