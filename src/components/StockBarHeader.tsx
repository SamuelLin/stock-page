export function StockBarHeader() {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg font-medium text-sm text-muted-foreground">
      {/* 左側：股票名稱和代碼 */}
      <div className="flex items-center space-x-4 min-w-0 flex-shrink-0">
        <div className="min-w-0">
          <p>股票名稱</p>
          <p>股票代碼</p>
        </div>
      </div>

      {/* 中間：價格資訊 */}
      <div className="flex items-center space-x-8 flex-grow justify-center">
        <div className="text-center">
          <p>收盤價</p>
        </div>

        <div className="text-center">
          <p>開盤價</p>
        </div>

        <div className="text-center">
          <p>最高價</p>
        </div>

        <div className="text-center">
          <p>最低價</p>
        </div>

        <div className="text-center">
          <p>成交量</p>
        </div>
      </div>

      {/* 右側：漲跌幅 */}
      <div className="flex items-center space-x-2 px-3 py-2 flex-shrink-0">
        <div className="text-center">
          <p>漲跌幅</p>
        </div>
      </div>
    </div>
  )
}
