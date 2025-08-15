import { AlertCircle, Wifi, WifiOff, RefreshCw, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// ApiError 定義移動到這裡因為不再使用 ApiContext
interface ApiError {
  message: string
  code?: string
}

interface ErrorAlertProps {
  error: ApiError
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function ErrorAlert({ error, onRetry, onDismiss, className }: ErrorAlertProps) {

  const getErrorIcon = () => {
    switch (error.code) {
      case 'NO_NETWORK':
        return <WifiOff className="h-5 w-5" />
      case 'TIMEOUT':
        return <Wifi className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const getErrorColor = () => {
    switch (error.code) {
      case 'NO_NETWORK':
        return 'text-orange-600 border-orange-200 bg-orange-50'
      case 'TIMEOUT':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50'
      default:
        return 'text-red-600 border-red-200 bg-red-50'
    }
  }

  const getActionText = () => {
    switch (error.code) {
      case 'NO_NETWORK':
        return '檢查網路連線後重試'
      case 'TIMEOUT':
        return '請求超時，點擊重試'
      default:
        return '重新載入'
    }
  }

  return (
    <Card className={`border-2 ${getErrorColor()} ${className}`}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          {getErrorIcon()}
          <div>
            <h4 className="font-semibold">發生錯誤</h4>
            <p className="text-sm opacity-90">{error.message}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {getActionText()}
            </Button>
          )}
          
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
