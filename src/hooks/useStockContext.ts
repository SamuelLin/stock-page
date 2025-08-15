import { useContext } from 'react'
import { StockContext } from '@/contexts/SimpleStockContext'

export function useStockContext() {
  const context = useContext(StockContext)
  if (!context) {
    throw new Error('useStockContext 必須在 StockProvider 內使用')
  }
  return context
}