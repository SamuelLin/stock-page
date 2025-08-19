 
import { Loader2, TrendingUp } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  variant?: 'default' | 'inline'
  className?: string
}

export function LoadingState({ 
  message = '載入中...', 
  variant = 'default',
  className 
}: LoadingStateProps) {

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
}
