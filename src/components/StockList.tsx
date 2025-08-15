import { memo } from "react"
import type { Stock } from "@/types/stock"
import { LoadingState } from "./LoadingState"

// 單個股票項目組件
const StockItem = memo(function StockItem({ stock, index }: { stock: Stock; index: number }) {
  return (
    <div 
      key={`${stock.Code}-${stock.Date}-${index}`}
      className="bg-card rounded-lg border p-4 hover:bg-accent/50 transition-colors"
    >
      {/* 桌面版顯示 */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <div className="font-semibold text-lg">{stock.Code}</div>
            <div className="text-sm text-muted-foreground">{stock.Name}</div>
          </div>
        </div>
        
        <div className="flex items-center text-right">
          <div className="w-20">
            <div className="text-lg font-mono">{stock.ClosingPrice || '--'}</div>
            <div className="text-xs text-muted-foreground">收盤價</div>
          </div>
          
          <div className={`w-24 ml-4 ${
            stock.Change && parseFloat(stock.Change) > 0 
              ? 'text-red-600' 
              : stock.Change && parseFloat(stock.Change) < 0 
                ? 'text-green-600' 
                : 'text-muted-foreground'
          }`}>
            <div className="font-mono">
              {stock.Change ? (parseFloat(stock.Change) > 0 ? '+' : '') + parseFloat(stock.Change).toFixed(2) : '--'}
            </div>
            <div className="text-xs text-muted-foreground">
              漲跌
            </div>
          </div>
          
          <div className="w-24 ml-6">
            <div className="font-mono">{stock.TradeVolume || '--'}</div>
            <div className="text-xs text-muted-foreground">成交量</div>
          </div>
          
          <div className="w-32 ml-6">
            <div className="font-mono text-sm">{stock.HighestPrice || '--'} / {stock.LowestPrice || '--'}</div>
            <div className="text-xs text-muted-foreground">最高/最低</div>
          </div>
        </div>
      </div>

      {/* 手機版顯示 */}
      <div className="sm:hidden space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-lg">{stock.Code}</div>
            <div className="text-sm text-muted-foreground">{stock.Name}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-mono">{stock.ClosingPrice || '--'}</div>
            <div className={`text-sm font-mono ${
              stock.Change && parseFloat(stock.Change) > 0 
                ? 'text-red-600' 
                : stock.Change && parseFloat(stock.Change) < 0 
                  ? 'text-green-600' 
                  : 'text-muted-foreground'
            }`}>
              {stock.Change ? (parseFloat(stock.Change) > 0 ? '+' : '') + parseFloat(stock.Change).toFixed(2) : '--'}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">成交量：</span>
            <span className="font-mono">{stock.TradeVolume || '--'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">最高：</span>
            <span className="font-mono">{stock.HighestPrice || '--'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">開盤：</span>
            <span className="font-mono">{stock.OpeningPrice || '--'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">最低：</span>
            <span className="font-mono">{stock.LowestPrice || '--'}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

interface StockListProps {
  stocks: Stock[]
  loading?: boolean
}

export const StockList = memo(function StockList({ stocks, loading = false }: StockListProps) {
  if (loading) {
    return <LoadingState />
  }

  if (stocks.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {stocks.map((stock, index) => (
        <StockItem key={`${stock.Code}-${stock.Date}-${index}`} stock={stock} index={index} />
      ))}
    </div>
  )
})
