import { TrendingUp, TrendingDown, Minus } from "lucide-react"

import type { Stock } from "@/types/stock"

interface StockBarProps {
  stock: Stock
}

export function StockBar({ stock }: StockBarProps) {
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
    if (isPositive) return "text-green-600 bg-green-50"
    if (isNegative) return "text-red-600 bg-red-50"
    return "text-gray-600 bg-gray-50"
  }

  const getChangePrefix = () => {
    if (isPositive) return "+"
    return ""
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-all hover:bg-gray-50/50">
      {/* 左側：股票名稱和代碼 */}
      <div className="flex items-center space-x-4 min-w-0 flex-shrink-0">
        <div className="min-w-0">
          <h3 className="font-semibold text-lg truncate">{stock.Name}</h3>
          <p className="text-sm text-muted-foreground">{stock.Code}</p>
        </div>
      </div>

      {/* 中間：價格資訊 */}
      <div className="flex items-center space-x-8 flex-grow justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">收盤價</p>
          <p className="font-bold text-xl">{formatNumber(stock.ClosingPrice)}</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">開盤價</p>
          <p className="font-medium">{formatNumber(stock.OpeningPrice)}</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">最高價</p>
          <p className="font-medium text-green-600">{formatNumber(stock.HighestPrice)}</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">最低價</p>
          <p className="font-medium text-red-600">{formatNumber(stock.LowestPrice)}</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">成交量</p>
          <p className="font-medium">{formatNumber(stock.TradeVolume)}</p>
        </div>
      </div>

      {/* 右側：漲跌幅 */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-md ${getTrendColor()} flex-shrink-0`}>
        {getTrendIcon()}
        <div className="text-center">
          <p className="font-bold text-lg">
            {getChangePrefix()}{change}
          </p>
          <p className="text-xs opacity-75">漲跌</p>
        </div>
      </div>
    </div>
  )
}
