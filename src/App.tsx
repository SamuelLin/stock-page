import { useState, useCallback, useMemo } from "react"
import { Database, Clock } from "lucide-react"

import { SearchBar } from "@/components/SearchBar"
import { StockList } from "@/components/StockList"
import { LoadingState } from "@/components/LoadingState"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Button } from "@/components/ui/button"

import { StockProvider, useStocks } from "@/contexts/StockContext"
import { useOptimizedSearch } from "@/hooks/useOptimizedSearch"

function StockApp() {
  const [searchInputValue, setSearchInputValue] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  
  const {
    stocks: allStocks,
    loading,
    error,
    lastUpdated,
    isFromCache,
    refreshStocks,
    clearError,
    ensureStocksLoaded
  } = useStocks()

  const { filteredStocks, isSearching, currentQuery, executeSearch, clearSearch } = useOptimizedSearch(allStocks)
  const handleSearch = useCallback(async (query: string) => {
    setHasSearched(true)
    
    try {
      const latestStocks = await ensureStocksLoaded()
      executeSearch(query, latestStocks)
    } catch (err) {
      console.error('載入股票資料失敗:', err)
    }
  }, [ensureStocksLoaded, executeSearch])
  const handleInputChange = useCallback((value: string) => {
    setSearchInputValue(value)
  }, [])
  const handleClearSearch = useCallback(() => {
    setSearchInputValue("")
    setHasSearched(false)
    clearSearch()
  }, [clearSearch])

  const handleRetry = useCallback(async () => {
    clearError()
    await refreshStocks()
  }, [clearError, refreshStocks])
  const stockStats = useMemo(() => ({
    total: allStocks.length,
    filtered: filteredStocks.length,
    hasStocks: allStocks.length > 0
  }), [allStocks.length, filteredStocks.length])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">台股即時行情</h1>
          <p className="text-muted-foreground text-sm">整合上市(TWSE)與上櫃(TPEX)股票資料</p>
          
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
            
            {stockStats.hasStocks && (
              <div className="flex items-center gap-1">
                <span>
                  顯示 {stockStats.filtered} / {stockStats.total} 檔股票
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <SearchBar
            onSearch={handleSearch}
            value={searchInputValue}
            onChange={handleInputChange}
            placeholder="請輸入股票代號或名稱開始搜尋..."
            disabled={loading || isSearching}
          />
        </div>

        {!hasSearched && !loading && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">🔍 開始搜尋股票</h3>
              <p className="text-muted-foreground mb-6">
                輸入股票代號（如：2330）或公司名稱（如：台積電）來查找股票資訊
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-card p-3 rounded-lg border">
                  <div className="font-medium mb-1">上市股票</div>
                  <div className="text-muted-foreground">台灣證券交易所</div>
                </div>
                <div className="bg-card p-3 rounded-lg border">
                  <div className="font-medium mb-1">上櫃股票</div>
                  <div className="text-muted-foreground">櫃買中心</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="text-destructive mb-2">錯誤：{error}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRetry}>
                重試
              </Button>
              <Button variant="ghost" size="sm" onClick={clearError}>
                忽略
              </Button>
            </div>
          </div>
        )}

        {hasSearched && (
          <>
            {isSearching && (
              <div className="flex justify-center mb-6">
                <LoadingState variant="inline" message="搜尋中..." />
              </div>
            )}
            
            {!isSearching && currentQuery && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-muted-foreground">
                    找到 {filteredStocks.length} 個結果
                    {filteredStocks.length === 100 && " (顯示前100筆)"}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleClearSearch}>
                    清除搜尋
                  </Button>
                </div>
                
                {filteredStocks.length > 0 ? (
                  <StockList stocks={filteredStocks} />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground text-lg mb-2">
                      找不到「{currentQuery}」相關的股票
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      請嘗試其他關鍵字或檢查拼寫
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {!hasSearched && !loading && error && allStocks.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">載入失敗</h3>
            <p className="text-muted-foreground mb-4">
              無法載入股票資料，請重試
            </p>
            <Button onClick={handleRetry}>重新載入</Button>
          </div>
        )}
      </div>
      
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
