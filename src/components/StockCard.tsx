import { TrendingUp, TrendingDown, Minus } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Stock } from "@/types/stock"

interface StockCardProps {
  stock: Stock
}

export function StockCard({ stock }: StockCardProps) {
  const change = parseFloat(stock.Change)
  const isPositive = change > 0
  const isNegative = change < 0
  
  const formatNumber = (value: string) => {
    const num = parseFloat(value)
    return isNaN(num) ? value : num.toLocaleString()
  }

  const getTrendIcon = () => {
    if (isPositive) return <TrendingUp className="h-4 w-4" />
    if (isNegative) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getTrendColor = () => {
    if (isPositive) return "text-green-600"
    if (isNegative) return "text-red-600"
    return "text-gray-500"
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{stock.Name}</h3>
            <p className="text-sm text-muted-foreground">{stock.Code}</p>
          </div>
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="font-medium">
              {change > 0 ? '+' : ''}{change}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">收盤價</p>
            <p className="font-semibold text-lg">{formatNumber(stock.ClosingPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">開盤價</p>
            <p className="font-medium">{formatNumber(stock.OpeningPrice)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">最高價</p>
            <p className="font-medium text-green-600">{formatNumber(stock.HighestPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">最低價</p>
            <p className="font-medium text-red-600">{formatNumber(stock.LowestPrice)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-sm text-muted-foreground">成交量</p>
            <p className="font-medium">{formatNumber(stock.TradeVolume)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">成交筆數</p>
            <p className="font-medium">{formatNumber(stock.Transaction)}</p>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">成交金額</p>
          <p className="font-medium">{formatNumber(stock.TradeValue)}</p>
        </div>
        
        <div className="pt-2 text-xs text-muted-foreground">
          日期: {stock.Date}
        </div>
      </CardContent>
    </Card>
  )
}
