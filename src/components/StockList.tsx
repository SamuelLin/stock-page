import { memo } from "react"
import type { Stock } from "@/types/stock"
import { LoadingState } from "./LoadingState"

const StockItem = memo(function StockItem({ stock, index }: { stock: Stock; index: number }) {
  return (
    <div 
      key={`${stock.code}-${stock.date}-${index}`}
      className="bg-card rounded-lg border p-4 hover:bg-accent/50 transition-colors"
    >
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{stock.code}</span>
              <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                stock.source === 'twse' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {stock.source === 'twse' ? '上市' : '上櫃'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">{stock.name}</div>
          </div>
        </div>
        
        <div className="flex items-center text-right">
          <div className="w-20">
            <div className="text-lg font-mono">{stock.closingPrice || '--'}</div>
            <div className="text-xs text-muted-foreground">收盤價</div>
          </div>
          
          <div className={`w-24 ml-4 ${
            stock.change && parseFloat(stock.change) > 0 
              ? 'text-red-600' 
              : stock.change && parseFloat(stock.change) < 0 
                ? 'text-green-600' 
                : 'text-muted-foreground'
          }`}>
            <div className="font-mono">
              {stock.change ? (parseFloat(stock.change) > 0 ? '+' : '') + parseFloat(stock.change).toFixed(2) : '--'}
            </div>
            <div className="text-xs text-muted-foreground">
              漲跌
            </div>
          </div>
          
          <div className="w-24 ml-6">
            <div className="font-mono">{stock.tradeVolume || '--'}</div>
            <div className="text-xs text-muted-foreground">成交量</div>
          </div>
          
          <div className="w-32 ml-6">
            <div className="font-mono text-sm">{stock.highestPrice || '--'} / {stock.lowestPrice || '--'}</div>
            <div className="text-xs text-muted-foreground">最高/最低</div>
          </div>
        </div>
      </div>

      <div className="sm:hidden space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{stock.code}</span>
              <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                stock.source === 'twse' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {stock.source === 'twse' ? '上市' : '上櫃'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">{stock.name}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-mono">{stock.closingPrice || '--'}</div>
            <div className={`text-sm font-mono ${
              stock.change && parseFloat(stock.change) > 0 
                ? 'text-red-600' 
                : stock.change && parseFloat(stock.change) < 0 
                  ? 'text-green-600' 
                  : 'text-muted-foreground'
            }`}>
              {stock.change ? (parseFloat(stock.change) > 0 ? '+' : '') + parseFloat(stock.change).toFixed(2) : '--'}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">成交量：</span>
            <span className="font-mono">{stock.tradeVolume || '--'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">最高：</span>
            <span className="font-mono">{stock.highestPrice || '--'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">開盤：</span>
            <span className="font-mono">{stock.openingPrice || '--'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">最低：</span>
            <span className="font-mono">{stock.lowestPrice || '--'}</span>
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
        <StockItem key={`${stock.code}-${stock.date}-${index}`} stock={stock} index={index} />
      ))}
    </div>
  )
})
