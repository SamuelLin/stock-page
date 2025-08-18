import { memo } from 'react'
import { Loader2, TrendingUp } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

interface LoadingStateProps {
  message?: string
  variant?: 'default' | 'cards' | 'bars' | 'inline'
  className?: string
}

export const LoadingState = memo(function LoadingState({ 
  message = '載入中...', 
  variant = 'default',
  className 
}: LoadingStateProps) {
  if (variant === 'bars') {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* 表頭 skeleton */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg animate-pulse">
          <div className="flex items-center space-x-4 min-w-0 flex-shrink-0">
            <div className="min-w-0">
              <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
          <div className="flex items-center space-x-8 flex-grow justify-center">
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
            </div>
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
            </div>
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
            </div>
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
            </div>
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 flex-shrink-0">
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-8"></div>
            </div>
          </div>
        </div>

        {/* 股票條列 skeleton */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
            {/* 左側：股票名稱和代碼 */}
            <div className="flex items-center space-x-4 min-w-0 flex-shrink-0">
              <div className="min-w-0">
                <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>

            {/* 中間：價格資訊 */}
            <div className="flex items-center space-x-8 flex-grow justify-center">
              <div className="text-center">
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="text-center">
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-14"></div>
              </div>
              <div className="text-center">
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-14"></div>
              </div>
              <div className="text-center">
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-14"></div>
              </div>
              <div className="text-center">
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
            </div>

            {/* 右側：漲跌幅 */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-100 flex-shrink-0">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="text-center">
                <div className="h-5 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                {/* 標題區域 */}
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
                
                {/* 價格區域 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                
                {/* 其他數據區域 */}
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    )
  }

  // Default variant
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="relative">
        <TrendingUp className="h-12 w-12 text-primary opacity-20" />
        <Loader2 className="h-6 w-6 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="mt-4 text-muted-foreground font-medium">{message}</p>
      <p className="mt-1 text-sm text-muted-foreground">正在從台灣證券交易所獲取最新數據...</p>
    </div>
  )
})
