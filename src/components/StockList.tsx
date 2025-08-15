import type { Stock } from "@/types/stock"
import { StockCard } from "./StockCard"
import { StockBar } from "./StockBar"
import { StockBarHeader } from "./StockBarHeader"
import { LoadingState } from "./LoadingState"

interface StockListProps {
  stocks: Stock[]
  loading?: boolean
  viewMode?: 'cards' | 'bars'
  showEmptyState?: boolean
}

export function StockList({ stocks, loading = false, viewMode = 'bars', showEmptyState = false }: StockListProps) {
  if (loading) {
    return <LoadingState variant={viewMode} />
  }

  if (stocks.length === 0 && showEmptyState) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">沒有找到相關股票</div>
        <p className="text-sm text-muted-foreground mt-2">請嘗試其他搜尋關鍵字</p>
      </div>
    )
  }

  if (stocks.length === 0) {
    return null
  }

  if (viewMode === 'bars') {
    return (
      <div className="space-y-2">
        <StockBarHeader />
        {stocks.map((stock, index) => (
          <StockBar key={`${stock.Code}-${stock.Date}-${index}`} stock={stock} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stocks.map((stock, index) => (
        <StockCard key={`${stock.Code}-${stock.Date}-${index}`} stock={stock} />
      ))}
    </div>
  )
}
