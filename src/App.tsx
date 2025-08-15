import { useState, useMemo, useCallback, useRef } from "react"
import { RefreshCw, Database, Clock } from "lucide-react"

import { SearchBar } from "@/components/SearchBar"
import { StockList } from "@/components/StockList"
import { ErrorAlert } from "@/components/ErrorAlert"
import { LoadingState } from "@/components/LoadingState"
import { NetworkStatus } from "@/components/NetworkStatus"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Button } from "@/components/ui/button"

import { StockProvider } from "@/contexts/SimpleStockContext"
import { useStocks } from "@/hooks/useSimpleStocks"

function StockApp() {
  const [activeSearchQuery, setActiveSearchQuery] = useState("")
  const [searchInputValue, setSearchInputValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const {
    stocks: allStocks,
    loading,
    error,
    lastUpdated,
    isFromCache,
    totalCount,
    refreshStocks,
    clearError
  } = useStocks()

  // 處理搜尋（不使用防抖動，因為是手動觸發）
  const handleSearch = useCallback((query: string) => {
    setIsSearching(true)
    
    // 模擬搜尋延遲，提供視覺反饋
    setTimeout(() => {
      setActiveSearchQuery(query.trim())
      setIsSearching(false)
    }, 100)
  }, [])

  // 處理搜尋欄位變化
  const handleInputChange = useCallback((value: string) => {
    setSearchInputValue(value)
  }, [])

  // 清空搜尋
  const handleClearSearch = useCallback(() => {
    setSearchInputValue("")
    setActiveSearchQuery("")
    setIsSearching(false)
  }, [])

  // 過濾股票數據（只在實際搜尋時過濾）
  const filteredStocks = useMemo(() => {
    if (!activeSearchQuery.trim()) {
      return allStocks
    }
    
    const query = activeSearchQuery.toLowerCase()
    return allStocks.filter(stock => 
      stock.Code.toLowerCase().includes(query) ||
      stock.Name.toLowerCase().includes(query)
    )
  }, [allStocks, activeSearchQuery])

  const handleRetry = async () => {
    clearError()
    await refreshStocks()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">台股即時行情</h1>
          
          {/* 數據狀態指示器 */}
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground flex-wrap">
            {lastUpdated && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>更新時間: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
            
            {isFromCache && (
              <div className="flex items-center gap-1 text-orange-600">
                <Database className="h-4 w-4" />
                <span>快取數據</span>
              </div>
            )}
            
            {totalCount > 0 && (
              <div className="flex items-center gap-1">
                <span>
                  顯示 {filteredStocks.length} / {totalCount} 檔股票
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 搜尋欄 */}
        <div className="flex justify-center mb-8">
          <SearchBar
            onSearch={handleSearch}
            value={searchInputValue}
            onChange={handleInputChange}
            placeholder="輸入股票代號或名稱..."
            disabled={loading || isSearching}
          />
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="mb-6">
            <ErrorAlert
              error={error}
              onRetry={handleRetry}
              onDismiss={clearError}
            />
          </div>
        )}

        {/* 主要內容區域 */}
        {loading && !allStocks.length ? (
          <LoadingState message="正在載入股票數據..." />
        ) : (
          <>
            {/* 加載指示器（有數據時顯示在頂部） */}
            {(loading || isSearching) && allStocks.length > 0 && (
              <div className="flex justify-center mb-4">
                <LoadingState 
                  variant="inline" 
                  message={isSearching ? "搜尋中..." : "更新中..."} 
                />
              </div>
            )}
            
            {/* 股票列表 */}
            <StockList 
              stocks={filteredStocks} 
              loading={isSearching}
            />
            
            {/* 搜尋無結果提示 - 只有在有股票資料但搜尋無結果時顯示 */}
            {activeSearchQuery && !isSearching && filteredStocks.length === 0 && allStocks.length > 0 && !loading && !error && (
              <div className="text-center py-8">
                <div className="text-muted-foreground text-lg mb-2">
                  找不到「{activeSearchQuery}」相關的股票
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  請嘗試其他關鍵字或檢查拼寫
                </p>
                <Button variant="outline" onClick={handleClearSearch}>
                  顯示所有股票
                </Button>
              </div>
            )}
          </>
        )}

        {/* 底部工具欄 */}
        {!loading && allStocks.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={refreshStocks}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              重新整理數據
            </Button>
          </div>
        )}
        
        {/* 空狀態 - 只有在沒有搜尋關鍵字且真的沒有資料時才顯示 */}
        {!loading && !error && allStocks.length === 0 && !activeSearchQuery && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">無股票資料</h3>
            <p className="text-muted-foreground mb-4">
              無法從台灣證券交易所獲取股票資料
            </p>
            <Button onClick={handleRetry}>重新載入</Button>
          </div>
        )}
      </div>
      
      {/* 網路狀態指示器 */}
      <NetworkStatus />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <StockProvider>
        <StockApp />
      </StockProvider>
    </ErrorBoundary>
  )
}

export default App
