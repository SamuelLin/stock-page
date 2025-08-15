import { createContext } from 'react'
import type { Stock } from '@/types/stock'

export interface StockContextType {
  stocks: Stock[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  isFromCache: boolean
  fetchStocks: () => Promise<void>
  refreshStocks: () => Promise<void>
  clearError: () => void
}

export const StockContext = createContext<StockContextType | null>(null)