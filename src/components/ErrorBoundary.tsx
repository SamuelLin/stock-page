import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // 記錄錯誤到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // 這裡可以添加錯誤報告服務，例如 Sentry
    // reportError(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // 如果有自定義 fallback，使用自定義的
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默認錯誤界面
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-xl">應用程式發生錯誤</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                很抱歉，應用程式遇到了一個意外錯誤。請嘗試重新整理頁面或回到首頁。
              </p>
              
              {/* 在開發模式下顯示錯誤詳情 */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 p-4 bg-muted rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    錯誤詳情（開發模式）
                  </summary>
                  <pre className="text-xs text-red-600 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                    {this.state.errorInfo && (
                      <>
                        {'\n\n'}
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </details>
              )}

              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={this.handleReset}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  重試
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  重新整理
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
